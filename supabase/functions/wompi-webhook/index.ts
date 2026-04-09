import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const body = await req.text()
    const signature = req.headers.get('x-event-checksum')
    const eventsSecret = Deno.env.get('WOMPI_EVENTS_SECRET')!

    // Verify Wompi webhook signature (HMAC-SHA256)
    if (signature && eventsSecret) {
      const expectedSig = createHmac('sha256', eventsSecret)
        .update(body)
        .digest('hex')

      if (signature !== expectedSig) {
        console.warn('Invalid Wompi webhook signature')
        return new Response('Invalid signature', { status: 401 })
      }
    }

    const event = JSON.parse(body)

    // Only handle transaction events
    if (event.event !== 'transaction.updated') {
      return new Response('OK', { status: 200 })
    }

    const transaction = event.data?.transaction
    if (!transaction) {
      return new Response('OK', { status: 200 })
    }

    const transactionId = transaction.id
    const wompiStatus = transaction.status  // APPROVED | DECLINED | VOIDED | ERROR | PENDING

    // Map Wompi status to our payment status
    const paymentStatusMap: Record<string, string> = {
      APPROVED: 'APPROVED',
      DECLINED: 'DECLINED',
      VOIDED: 'VOIDED',
      ERROR: 'ERROR',
      PENDING: 'PENDING',
    }

    const paymentStatus = paymentStatusMap[wompiStatus] || 'ERROR'

    // Map payment status to order status
    const orderStatusMap: Record<string, string> = {
      APPROVED: 'PROCESSING',
      DECLINED: 'CANCELLED',
      VOIDED: 'CANCELLED',
      ERROR: 'CANCELLED',
      PENDING: 'PENDING',
    }

    const orderStatus = orderStatusMap[wompiStatus] || 'CANCELLED'

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Find payment by gateway_ref (Wompi transaction ID for PSE, or our reference for other methods)
    let payment: { id: string; order_id: string } | null = null

    const { data: byGatewayRef } = await supabaseAdmin
      .from('payments')
      .select('id, order_id')
      .eq('gateway_ref', transactionId)
      .maybeSingle()

    if (byGatewayRef) {
      payment = byGatewayRef
    } else if (transaction.reference) {
      // Fallback: for NEQUI/CARD/BANCOLOMBIA_TRANSFER we stored our reference string as gateway_ref
      const { data: byRef } = await supabaseAdmin
        .from('payments')
        .select('id, order_id')
        .eq('gateway_ref', transaction.reference)
        .maybeSingle()
      payment = byRef ?? null
    }

    if (!payment) {
      console.log(`Payment not found for transaction ${transactionId} / reference ${transaction.reference}`)
      return new Response('OK', { status: 200 })
    }

    // Update payment status
    await supabaseAdmin
      .from('payments')
      .update({ status: paymentStatus, gateway_ref: transactionId })
      .eq('id', payment.id)

    // Update order status
    await supabaseAdmin
      .from('orders')
      .update({ status: orderStatus })
      .eq('id', payment.order_id)

    console.log(`Updated order ${payment.order_id} to ${orderStatus} via Wompi webhook`)

    // Always return 200 quickly — Wompi will retry on non-200
    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('wompi-webhook error:', error)
    // Return 200 to prevent Wompi from retrying indefinitely on our bugs
    return new Response('OK', { status: 200 })
  }
})
