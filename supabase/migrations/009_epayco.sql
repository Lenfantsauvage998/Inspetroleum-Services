-- 009_epayco.sql
-- Switch payment gateway default from Wompi to ePayco
ALTER TABLE public.payments
  ALTER COLUMN gateway SET DEFAULT 'epayco';
