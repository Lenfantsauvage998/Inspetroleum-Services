import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  Deno.env.get('FRONTEND_URL') ?? '',
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean)

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : (ALLOWED_ORIGINS[0] ?? '*')
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify user token
    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ── Rate limit: 10 per user per 5-minute window ──────────────────────────
    const { data: rlAllowed, error: rlError } = await supabaseAdmin
      .rpc('check_rate_limit', {
        p_identifier:   user.id,
        p_endpoint:     'initiate-payment',
        p_max_requests: 10,
        p_window_secs:  300,
      })
    if (!rlError && !rlAllowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '300' },
      })
    }
    // ── End rate limit ────────────────────────────────────────────────────────

    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify the order belongs to this user and is PENDING
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, total_amount, status')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (order.status !== 'PENDING') {
      return new Response(JSON.stringify({ error: 'Order is not in PENDING status' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create payment record in DB — ePayco checkout opens client-side using the public key
    await supabaseAdmin.from('payments').upsert({
      order_id: orderId,
      gateway: 'epayco',
      gateway_ref: orderId,   // will be replaced by x_ref_payco when webhook fires
      status: 'PENDING',
      amount: order.total_amount,
      currency: 'COP',
    }, { onConflict: 'order_id' })

    return new Response(JSON.stringify({
      orderId,
      amount: Number(order.total_amount),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('initiate-payment error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
