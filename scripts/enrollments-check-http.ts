import "./env";
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function main() {
  const r = await fetch(`${BASE}/api/admin/enrollments/check`);
  const t = await r.text();
  if (!r.ok) {
    console.error("ERROR (check):", t);
    process.exit(1);
  }
  console.log(t);
}
main().catch((e)=>{ console.error(e); process.exit(1); });
