-- ─────────────────────────────────────────────────────────────────────────────
-- 006_admin_delete_service.sql
-- Admin RPC to safely delete a service that may have order_items referencing it.
-- Removes associated order_items first, then deletes the service.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_delete_service(p_service_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Remove order_items referencing this service
  DELETE FROM public.order_items WHERE service_id = p_service_id;

  -- Now delete the service
  DELETE FROM public.services WHERE id = p_service_id;
END;
$$;
