-- Políticas admin para public.profiles (selección/actualización global)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: admin puede ver todos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_admin_all_select') THEN
    CREATE POLICY profiles_admin_all_select
    ON public.profiles
    FOR SELECT
    USING ((auth.jwt() ->> 'role') = 'admin');
  END IF;
END $$;

-- UPDATE: admin puede editar todos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_admin_all_update') THEN
    CREATE POLICY profiles_admin_all_update
    ON public.profiles
    FOR UPDATE
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
