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

interface OrderItem {
  serviceId: string
  quantity: number
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Auth — verify JWT from Authorization header
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

    // Verify user token — pass JWT explicitly to getUser() (Supabase recommended pattern)
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

    // ── Rate limit: 5 per user per 5-minute window ───────────────────────────
    const { data: rlAllowed, error: rlError } = await supabaseAdmin
      .rpc('check_rate_limit', {
        p_identifier:   user.id,
        p_endpoint:     'create-order',
        p_max_requests: 5,
        p_window_secs:  300,
      })
    if (!rlError && !rlAllowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '300' },
      })
    }
    // ── End rate limit ────────────────────────────────────────────────────────

    // Parse and validate body
    const body = await req.json()
    const items: OrderItem[] = body.items

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'items array is required and must not be empty' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    for (const item of items) {
      if (!item.serviceId || typeof item.serviceId !== 'string') {
        return new Response(JSON.stringify({ error: 'Each item must have a valid serviceId' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return new Response(JSON.stringify({ error: 'Each item must have a positive integer quantity' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Fetch real prices from DB — never trust client-sent prices
    const serviceIds = items.map(i => i.serviceId)
    const { data: services, error: servicesError } = await supabaseAdmin
      .from('services')
      .select('id, price, is_active, title')
      .in('id', serviceIds)

    if (servicesError) throw servicesError

    // Validate all services exist and are active
    for (const item of items) {
      const svc = services?.find(s => s.id === item.serviceId)
      if (!svc) {
        return new Response(JSON.stringify({ error: `Service ${item.serviceId} not found` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      if (!svc.is_active) {
        return new Response(JSON.stringify({ error: `Service "${svc.title}" is no longer available` }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => {
      const svc = services!.find(s => s.id === item.serviceId)!
      return sum + Number(svc.price) * item.quantity
    }, 0)

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({ user_id: user.id, total_amount: totalAmount, status: 'PENDING' })
      .select('id')
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map(item => {
      const svc = services!.find(s => s.id === item.serviceId)!
      return {
        order_id: order.id,
        service_id: item.serviceId,
        quantity: item.quantity,
        price: Number(svc.price),
      }
    })

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    return new Response(JSON.stringify({ orderId: order.id, totalAmount }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('create-order error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
