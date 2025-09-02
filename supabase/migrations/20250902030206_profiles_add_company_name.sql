-- Agregar columna company_name si falta
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name text;
NOTIFY pgrst, 'reload schema';
