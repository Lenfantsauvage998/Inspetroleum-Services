-- ─────────────────────────────────────────────────────────────────────────────
-- 007_service_gallery.sql
-- Adds image_urls array to services for multi-image gallery support.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';
