-- ─────────────────────────────────────────────────────────────────────────────
-- 003_user_management.sql
-- Adds phone to admin user list, and admin RPC helpers for delete + role change
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Rebuild admin_get_all_users to include phone (from most-recent order)
DROP FUNCTION IF EXISTS public.admin_get_all_users();

CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id          UUID,
  name        TEXT,
  email       TEXT,
  role        TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    u.email,
    p.role,
    (
      SELECT o.customer_phone
      FROM   orders o
      WHERE  o.user_id = p.id
        AND  o.customer_phone IS NOT NULL
      ORDER  BY o.created_at DESC
      LIMIT  1
    ) AS phone,
    p.created_at
  FROM  public.profiles p
  JOIN  auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;

-- 2. Admin delete user (removes from auth.users → cascades to profiles)
DROP FUNCTION IF EXISTS public.admin_delete_user(UUID);

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- 3. Admin set user role
DROP FUNCTION IF EXISTS public.admin_set_user_role(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id UUID, p_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF p_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Rol inválido: %', p_role;
  END IF;

  UPDATE public.profiles SET role = p_role WHERE id = p_user_id;
END;
$$;
