-- Asegura columna company_name en public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_name text;

-- Refrescar cache de PostgREST
NOTIFY pgrst, 'reload schema';
