-- idempotent: agrega columna account_type si no existe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'student';

-- idempotent: agrega updated_at si no existe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- refrescar cache de esquema (PostgREST)
NOTIFY pgrst, 'reload schema';
