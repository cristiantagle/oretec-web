-- Habilitar RLS (si no lo estaba)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas actuales de public.profiles (si existen)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles;', r.policyname);
  END LOOP;
END
$$;

-- Políticas mínimas, SIN subconsultas (evita recursión)
-- 1) Ver su propio registro
CREATE POLICY profiles_select_own
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 2) Insertar su propio registro
CREATE POLICY profiles_insert_own
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3) Actualizar su propio registro
CREATE POLICY profiles_update_own
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Refrescar caché de PostgREST
NOTIFY pgrst, 'reload schema';
