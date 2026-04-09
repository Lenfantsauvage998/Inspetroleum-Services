-- ─────────────────────────────────────────────────────────────────────────────
-- 005_fix_admin_get_all_users.sql
-- Fix type mismatch: auth.users.email is VARCHAR(255), not TEXT.
-- Cast to TEXT so the RETURNS TABLE signature matches.
-- ─────────────────────────────────────────────────────────────────────────────

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
    p.name::TEXT,
    u.email::TEXT,
    p.role::TEXT,
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
