-- contacts table
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  status text not null default 'new',    -- new | in_progress | done
  archived boolean not null default false,
  admin_notes text
);

alter table public.contacts enable row level security;

-- Sin políticas públicas de insert/select: sólo vía service role (bypass RLS)
-- (Los endpoints del servidor usan la service key; el cliente no puede escribir directo)

create index if not exists contacts_created_at_idx on public.contacts (created_at desc);
create index if not exists contacts_status_idx on public.contacts (status);
