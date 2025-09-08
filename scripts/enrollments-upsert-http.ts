import "./env";
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Simula una inscripción */
async function main() {
  const payload = {
    user_id: process.env.TEST_USER_ID || "",
    course_code: process.env.TEST_COURSE_CODE || null,
    course_id: process.env.TEST_COURSE_ID || null,
    qty: 1,
    meta: { source: "cli-upsert" },
  };

  if (!payload.user_id) {
    console.error("Define TEST_USER_ID en .env.local o como variable de entorno para probar (TEST_USER_ID).");
    process.exit(1);
  }

  const r = await fetch(`${BASE}/api/admin/enrollments/upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const t = await r.text();
  if (!r.ok) {
    console.error("ERROR (upsert):", t);
    process.exit(1);
  }
  console.log("Upsert OK:", t);
}
main().catch((e)=>{ console.error(e); process.exit(1); });
