-- Reset de políticas RLS en public.profiles (evita recursión)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Elimina TODAS las políticas actuales de profiles (si existen)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT polname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles;', r.polname);
  END LOOP;
END
$$;

-- Políticas mínimas, SIN subconsultas (no hay recursión)
-- Ver su propio registro
CREATE POLICY profiles_select_own
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Insertar su propio registro
CREATE POLICY profiles_insert_own
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Actualizar su propio registro
CREATE POLICY profiles_update_own
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- (Opcional) si quieres permitir SELECT público de ciertas columnas,
-- crea acá una política separada con columnas proyectadas mediante vista, etc.

-- Refrescar cache de PostgREST
NOTIFY pgrst, 'reload schema';
