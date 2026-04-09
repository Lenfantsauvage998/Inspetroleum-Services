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
    const url = new URL(req.url)
    const orderId = url.searchParams.get('orderId')
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Rate limit: 60 per orderId per 1-minute window ───────────────────────
    const { data: rlAllowed, error: rlError } = await supabaseAdmin
      .rpc('check_rate_limit', {
        p_identifier:   orderId,
        p_endpoint:     'check-payment',
        p_max_requests: 60,
        p_window_secs:  60,
      })
    if (!rlError && !rlAllowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please slow down.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
      })
    }
    // ── End rate limit ────────────────────────────────────────────────────────

    // Read status directly from DB — ePayco webhook is the source of truth
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('status')
      .eq('order_id', orderId)
      .maybeSingle()

    if (!payment) {
      return new Response(JSON.stringify({ status: 'NOT_FOUND' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ status: payment.status }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('check-payment error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
