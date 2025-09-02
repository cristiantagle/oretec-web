-- idempotent: agrega full_name si no existe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;

-- refrescar cache de PostgREST para que vea la columna
NOTIFY pgrst, 'reload schema';
