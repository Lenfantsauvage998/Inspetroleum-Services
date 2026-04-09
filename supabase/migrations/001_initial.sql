-- ============================================================
-- Inspetroleum Services — Initial Schema
-- ============================================================

-- ── Profiles (extends auth.users) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── Services catalog ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN (
                'OILFIELD_SERVICES', 'LNG', 'INDUSTRIAL_TECH', 'ENERGY_TRANSITION'
              )),
  price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  image_url   TEXT,
  features    TEXT[] NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
                 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'
               )),
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ── Order Items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price      NUMERIC(12,2) NOT NULL CHECK (price >= 0)  -- snapshot price
);

-- ── Payments ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  gateway     TEXT NOT NULL DEFAULT 'wompi',
  gateway_ref TEXT,
  status      TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
                'PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'
              )),
  amount      NUMERIC(12,2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'COP',
  method      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- ============================================================
-- Row Level Security
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active services"
  ON public.services FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- ============================================================
-- Admin helper functions (SECURITY DEFINER — bypass RLS)
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_get_all_orders()
RETURNS TABLE (
  id           UUID,
  user_id      UUID,
  status       TEXT,
  total_amount NUMERIC,
  created_at   TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ,
  user_email   TEXT,
  user_name    TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Only callable by admins
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    o.id, o.user_id, o.status, o.total_amount, o.created_at, o.updated_at,
    u.email::TEXT AS user_email,
    p.name        AS user_name
  FROM public.orders o
  JOIN auth.users u ON u.id = o.user_id
  JOIN public.profiles p ON p.id = o.user_id
  ORDER BY o.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_order_status(order_id UUID, new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.orders
  SET status = new_status
  WHERE id = order_id;
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
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
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
DECLARE
  result JSON;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'totalOrders',    (SELECT COUNT(*) FROM public.orders),
    'totalRevenue',   (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status != 'CANCELLED'),
    'totalUsers',     (SELECT COUNT(*) FROM public.profiles WHERE role = 'user'),
    'totalServices',  (SELECT COUNT(*) FROM public.services WHERE is_active = TRUE),
    'pendingOrders',  (SELECT COUNT(*) FROM public.orders WHERE status = 'PENDING'),
    'recentOrders',   (
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
