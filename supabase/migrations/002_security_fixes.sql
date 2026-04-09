-- ============================================================
-- Inspetroleum Services — Security Fixes
-- Addresses: C1, C2, H4, H5 from security audit
-- ============================================================

-- ── H4: Create public.is_admin() SECURITY DEFINER ────────────
-- This function bypasses RLS safely, eliminating recursive
-- policy subqueries that caused infinite recursion on profiles.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ── C1: Fix handle_new_user — never trust client metadata ────
-- BEFORE: COALESCE(NEW.raw_user_meta_data->>'role', 'user')
-- Any attacker could pass { role: 'admin' } at signup.
-- FIX: hardcode 'user' — role is never read from client input.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user'  -- always hardcoded; never trust raw_user_meta_data for role
  );
  RETURN NEW;
END;
$$;

-- ── C2: Fix profiles UPDATE policy — add WITH CHECK ──────────
-- BEFORE: no WITH CHECK clause → any user could set role='admin'
-- FIX: WITH CHECK ensures role can only stay 'user' via client.
-- Admins promote users via SQL / admin tooling only.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user');

-- ── H4: Fix recursive admin policy on profiles ───────────────
-- BEFORE: SELECT subquery on profiles inside a profiles policy
-- caused infinite recursion. Replace with is_admin().
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Allow admins to update profiles (e.g., promote users via admin tooling)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── H4: Fix recursive admin policy on services ───────────────
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── H4: Add admin full-access policies on orders ─────────────
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── H5: Add INSERT policy on order_items ─────────────────────
-- BEFORE: no INSERT policy → RLS default-deny blocked
-- createOrderDirect, creating orphaned orders with no line items.
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- Admin full access on order_items
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin full access on payments
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Update all admin helper functions to use is_admin() ──────
-- Removes the inline profile subquery from every SECURITY DEFINER fn.

DROP FUNCTION IF EXISTS public.admin_update_order_status(UUID, TEXT);
CREATE OR REPLACE FUNCTION public.admin_update_order_status(p_order_id UUID, p_new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Validate status enum before writing
  IF p_new_status NOT IN ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED') THEN
    RAISE EXCEPTION 'Invalid status value: %', p_new_status;
  END IF;

  UPDATE public.orders
  SET status = p_new_status
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id         UUID,
  email      TEXT,
  name       TEXT,
  role       TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT p.id, u.email::TEXT, p.name, p.role, p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'totalOrders',   (SELECT COUNT(*) FROM public.orders),
    'totalRevenue',  (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status != 'CANCELLED'),
    'totalUsers',    (SELECT COUNT(*) FROM public.profiles WHERE role = 'user'),
    'totalServices', (SELECT COUNT(*) FROM public.services WHERE is_active = TRUE),
    'pendingOrders', (SELECT COUNT(*) FROM public.orders WHERE status = 'PENDING'),
    'recentOrders',  (
      SELECT json_agg(row_to_json(r)) FROM (
        SELECT o.id, o.status, o.total_amount, o.created_at, p.name AS user_name
        FROM public.orders o
        JOIN public.profiles p ON p.id = o.user_id
        ORDER BY o.created_at DESC
        LIMIT 5
      ) r
    )
  ) INTO result;

  RETURN result;
END;
$$;
