import { Pool, Client } from 'pg';
import "./env";

function connString() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const pwd = process.env.SUPABASE_DB_PASSWORD;
  if (!url || !pwd) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_DB_PASSWORD");
  const host = new URL(url).hostname; // stknnmg...supabase.co
  const ref = host.split(".")[0];     // stknnmg...
  const dbhost = `db.${ref}.supabase.co`;
  return `postgresql://postgres:${encodeURIComponent(pwd)}@${dbhost}:5432/postgres`;
}

async function main() {
  const cs = connString();
  const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const { rows: cnt } = await client.query("select count(*)::int as n from public.enrollments");
    console.log("Total enrollments:", cnt[0]?.n ?? 0);

    const { rows: recent } = await client.query(
      "select id, user_id, course_id, qty, status, paid, created_at from public.enrollments order by created_at desc limit 5"
    );
    console.log("5 más recientes:");
    for (const r of recent) console.log(r);
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
