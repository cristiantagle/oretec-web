import "./env";
import { Client } from "pg";

function connString() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const pwd = process.env.SUPABASE_DB_PASSWORD;
  if (!url || !pwd) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_DB_PASSWORD");
  const host = new URL(url).hostname; // stknnmg...supabase.co
  const ref = host.split(".")[0];     // stknnmg...
  const dbhost = `db.${ref}.supabase.co`;
  return `postgresql://postgres:${encodeURIComponent(pwd)}@${dbhost}:5432/postgres`;
}

const SQL = `
begin;

create extension if not exists pgcrypto;

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  course_id uuid not null,
  qty integer not null default 1 check (qty > 0),
  status text not null default pending check (status in (pending,confirmed,cancelled)),
  paid boolean not null default false,
  payer_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema=public and table_name=courses
  ) then
    begin
      alter table public.enrollments
      add constraint enrollments_course_fk
      foreign key (course_id) references public.courses(id) on delete restrict;
      exception when duplicate_object then null;
    end;
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_proc where proname=set_current_timestamp_updated_at
  ) then
    create or replace function public.set_current_timestamp_updated_at()
    returns trigger as $BODY$
    begin
      new.updated_at = now();
      return new;
    end;
    $BODY$ language plpgsql;
  end if;
end$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger t
    join pg_class c on t.tgrelid=c.oid
    where c.relname=enrollments and t.tgname=set_timestamp_enrollments
  ) then
    create trigger set_timestamp_enrollments
    before update on public.enrollments
    for each row execute function public.set_current_timestamp_updated_at();
  end if;
end$$;

create index if not exists enrollments_user_idx on public.enrollments(user_id);
create index if not exists enrollments_course_idx on public.enrollments(course_id);
create index if not exists enrollments_created_idx on public.enrollments(created_at desc);

alter table public.enrollments enable row level security;

drop policy if exists "own_select" on public.enrollments;
create policy "own_select" on public.enrollments
  for select using (auth.uid() = user_id);

drop policy if exists "own_insert" on public.enrollments;
create policy "own_insert" on public.enrollments
  for insert with check (auth.uid() = user_id);

drop policy if exists "own_update" on public.enrollments;
create policy "own_update" on public.enrollments
  for update using (auth.uid() = user_id);

drop policy if exists "admin_all" on public.enrollments;
create policy "admin_all" on public.enrollments
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.account_type = admin
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.account_type = admin
    )
  );

commit;
`;

async function main() {
  const cs = connString();
  const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(SQL);
    console.log("✓ Migración enrollments aplicada.");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});

/** Forzar IPv4 en cliente pg para evitar ENETUNREACH (IPv6) */
import dns from "node:dns";
import { Pool } from "pg";

function createIPv4Pool(connStr: string) {
  return new Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    // Fuerza A-record (IPv4) en la resolución DNS

    keepAlive: true,
    statement_timeout: 30_000,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}
