-- Crear/actualizar bucket 'avatars' como público para lectura
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Política: lectura pública de objetos del bucket 'avatars'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'avatars_public_read'
  ) THEN
    CREATE POLICY avatars_public_read
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');
  END IF;
END
$$;

-- Política: usuarios autenticados pueden INSERT en bucket 'avatars'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'avatars_auth_insert'
  ) THEN
    CREATE POLICY avatars_auth_insert
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars');
  END IF;
END
$$;

-- Política: usuarios autenticados pueden UPDATE sus propios objetos en 'avatars'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'avatars_auth_update_own'
  ) THEN
    CREATE POLICY avatars_auth_update_own
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());
  END IF;
END
$$;

-- Política: usuarios autenticados pueden DELETE sus propios objetos en 'avatars'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'avatars_auth_delete_own'
  ) THEN
    CREATE POLICY avatars_auth_delete_own
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'avatars' AND owner = auth.uid());
  END IF;
END
$$;

-- Refrescar el cache de PostgREST
NOTIFY pgrst, 'reload schema';
