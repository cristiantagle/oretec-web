-- Add avatar_url & phone if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
