-- Agregar columna company_name a profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name text;
NOTIFY pgrst, 'reload schema';
