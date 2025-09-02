-- Promueve a admin por email (idempotente)
WITH u AS (
  SELECT id
  FROM auth.users
  WHERE lower(email) = lower('cristian.gonzalez.gt@gmail.com')
)
INSERT INTO public.profiles (id, email, account_type, updated_at)
SELECT u.id, 'cristian.gonzalez.gt@gmail.com', 'admin', now()
FROM u
ON CONFLICT (id)
DO UPDATE SET
  account_type = EXCLUDED.account_type,
  updated_at   = EXCLUDED.updated_at;
