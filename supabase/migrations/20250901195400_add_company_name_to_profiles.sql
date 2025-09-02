-- idempotent: agrega company_name si no existe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name text;

-- refrescar cache de PostgREST para ver la columna altiro
NOTIFY pgrst, 'reload schema';
