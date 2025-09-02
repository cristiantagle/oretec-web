-- Agregar campos extra al perfil
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rut text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profession text;

NOTIFY pgrst, 'reload schema';
