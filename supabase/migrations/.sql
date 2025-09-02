ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
