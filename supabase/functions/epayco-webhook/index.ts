import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ePayco sends webhook as application/x-www-form-urlencoded POST
// x_cod_response: 1=APPROVED, 2=DECLINED, 3=PENDING, 4=ERROR
// x_id_invoice: our orderId (passed as `external` during session creation)
// x_ref_payco: ePayco's payment reference
// x_transaction_id: ePayco's transaction ID
// x_signature: SHA-256(custId^p_key^x_ref_payco^x_transaction_id^x_amount^x_currency_code)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse form-encoded body (ePayco sends application/x-www-form-urlencoded)
    const contentType = req.headers.get('content-type') ?? ''
    let params: Record<string, string> = {}

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text()
      const urlParams = new URLSearchParams(text)
      urlParams.forEach((value, key) => { params[key] = value })
    } else {
      // Some ePayco integrations send JSON
      const json = await req.json()
      params = json as Record<string, string>
    }

    const {
      x_cod_response,
      x_id_invoice,   // our orderId
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      x_signature,
    } = params

    if (!x_id_invoice || !x_signature) {
      return new Response('Missing required fields', { status: 400 })
    }

    // ── Verify signature ──────────────────────────────────────────────────────
    // SHA-256(custId^p_key^x_ref_payco^x_transaction_id^x_amount^x_currency_code)
    const custId = Deno.env.get('EPAYCO_CUST_ID') ?? ''
    const pKey = Deno.env.get('EPAYCO_P_KEY') ?? ''
    const raw = `${custId}^${pKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
    const computed = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0')).join('')

    if (computed !== x_signature) {
      console.error('epayco-webhook: invalid signature')
      return new Response('Invalid signature', { status: 401 })
    }

    // ── Map ePayco status code to our statuses ────────────────────────────────
    const codResponse = Number(x_cod_response)
    let paymentStatus: string
    let orderStatus: string

    if (codResponse === 1) {
      paymentStatus = 'APPROVED'
      orderStatus = 'PROCESSING'
    } else if (codResponse === 2) {
      paymentStatus = 'DECLINED'
      orderStatus = 'CANCELLED'
    } else if (codResponse === 3) {
      paymentStatus = 'PENDING'
      orderStatus = 'PENDING'
    } else {
      // 4 or anything else = ERROR
      paymentStatus = 'ERROR'
      orderStatus = 'CANCELLED'
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Update payment record ─────────────────────────────────────────────────
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('id, order_id')
      .eq('order_id', x_id_invoice)
      .maybeSingle()

    if (!payment) {
      console.error(`epayco-webhook: payment not found for order ${x_id_invoice}`)
      // Return 200 so ePayco doesn't keep retrying for orders we don't know about
      return new Response('OK', { status: 200 })
    }

    await supabaseAdmin
      .from('payments')
      .update({
        status: paymentStatus,
        gateway_ref: x_ref_payco ?? payment.id,
      })
      .eq('id', payment.id)

    // Only update order status if it's a terminal state (don't downgrade PROCESSING to PENDING)
    if (paymentStatus !== 'PENDING') {
      await supabaseAdmin
        .from('orders')
        .update({ status: orderStatus })
        .eq('id', payment.order_id)
    }

    console.log(`epayco-webhook: order ${payment.order_id} → payment ${paymentStatus}, order ${orderStatus}`)

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('epayco-webhook error:', error)
    // Always return 200 — ePayco retries on non-2xx, which could cause duplicate updates
    return new Response('OK', { status: 200 })
  }
})
