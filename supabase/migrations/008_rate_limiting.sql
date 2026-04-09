-- ─────────────────────────────────────────────────────────────────────────────
-- 008_rate_limiting.sql
-- Fixed-window rate limiting across Edge Functions.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.rate_limit (
  id            BIGSERIAL    PRIMARY KEY,
  identifier    TEXT         NOT NULL,
  endpoint      TEXT         NOT NULL,
  window_start  TIMESTAMPTZ  NOT NULL,
  request_count INT          NOT NULL DEFAULT 1,
  CONSTRAINT rate_limit_unique UNIQUE (identifier, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_window
  ON public.rate_limit (window_start);

-- No RLS policies → direct access denied; only the SECURITY DEFINER function can touch it.
ALTER TABLE public.rate_limit ENABLE ROW LEVEL SECURITY;

-- ── check_rate_limit() ────────────────────────────────────────────────────────
-- Atomically increments the counter for (identifier, endpoint) in the current
-- fixed window and returns TRUE if the request is allowed, FALSE if the limit
-- is exceeded.  Callers should fail open on DB errors (let the request through).
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier   TEXT,
  p_endpoint     TEXT,
  p_max_requests INT,
  p_window_secs  INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_new_count    INT;
BEGIN
  -- Align to the nearest window boundary (e.g. floor to 60-s or 300-s grid)
  v_window_start := to_timestamp(
    floor(EXTRACT(EPOCH FROM NOW()) / p_window_secs) * p_window_secs
  );

  INSERT INTO public.rate_limit (identifier, endpoint, window_start, request_count)
  VALUES (p_identifier, p_endpoint, v_window_start, 1)
  ON CONFLICT (identifier, endpoint, window_start)
  DO UPDATE SET request_count = rate_limit.request_count + 1
  RETURNING request_count INTO v_new_count;

  RETURN v_new_count <= p_max_requests;
END;
$$;

-- ── pg_cron cleanup ───────────────────────────────────────────────────────────
-- Purge rows older than 1 hour every hour. pg_cron is already enabled (migration 004).
DO $$ BEGIN PERFORM cron.unschedule('cleanup-rate-limits'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'cleanup-rate-limits',
  '0 * * * *',
  $$DELETE FROM public.rate_limit WHERE window_start < NOW() - INTERVAL '1 hour'$$
);
