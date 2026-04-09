-- ─────────────────────────────────────────────────────────────────────────────
-- 004_cancel_stale_orders.sql
-- Adds two functions:
--   1. cancel_my_order(uuid)  — called from the frontend on polling timeout
--   2. cancel_stale_orders()  — called by pg_cron every 10 minutes (safety net)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. RPC: user cancels their own PENDING order (e.g. payment timeout on frontend)
CREATE OR REPLACE FUNCTION public.cancel_my_order(p_order_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Only cancel if this order belongs to the calling user and is still PENDING
  UPDATE public.orders
  SET status = 'CANCELLED'
  WHERE id = p_order_id
    AND user_id = auth.uid()
    AND status = 'PENDING';

  IF NOT FOUND THEN
    -- Order doesn't exist, doesn't belong to this user, or is already past PENDING — ignore
    RETURN;
  END IF;

  -- Void the linked payment record
  UPDATE public.payments
  SET status = 'VOIDED'
  WHERE order_id = p_order_id
    AND status = 'PENDING';
END;
$$;

-- 2. Background cleanup: cancel any PENDING order+payment older than 30 minutes
--    (handles users who close the browser entirely without completing payment)
CREATE OR REPLACE FUNCTION public.cancel_stale_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cancel the orders first (CTE ensures we know exactly which IDs changed)
  WITH cancelled AS (
    UPDATE public.orders
    SET status = 'CANCELLED'
    WHERE status = 'PENDING'
      AND created_at < NOW() - INTERVAL '30 minutes'
      AND EXISTS (
        SELECT 1 FROM public.payments p
        WHERE p.order_id = orders.id AND p.status = 'PENDING'
      )
    RETURNING id
  )
  -- Void their associated payments in the same statement
  UPDATE public.payments
  SET status = 'VOIDED'
  WHERE order_id IN (SELECT id FROM cancelled)
    AND status = 'PENDING';
END;
$$;

-- 3. Schedule via pg_cron (runs every 10 minutes)
--    pg_cron must be enabled: Dashboard → Database → Extensions → pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove any existing job with the same name (safe re-run)
DO $$
BEGIN
  PERFORM cron.unschedule('cancel-stale-orders');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'cancel-stale-orders',      -- job name
  '*/10 * * * *',             -- every 10 minutes
  'SELECT public.cancel_stale_orders()'
);
