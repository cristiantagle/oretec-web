// Listar cursos desde Supabase usando Service Role
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Carga .env.local si variables no están en el entorno
(function ensureEnv() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const f = path.resolve(".env.local");
  if (fs.existsSync(f)) {
    const txt = fs.readFileSync(f, "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const k = m[1];
      let v = m[2];
      if ((v.startsWith("\"") && v.endsWith("\"")) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
})();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, serviceKey);

async function main() {
  const { data, error } = await sb
    .from("courses")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("DB error:", error.message);
    process.exit(1);
  }

  const rows = Array.isArray(data) ? data : [];
  console.log("Total cursos:", rows.length);
  for (const r of rows) {
    console.log(
      `- ${r.id} | ${r.code ?? "—"} | ${r.title ?? r.name ?? "Curso"} | pub:${r.published ?? "?"} act:${r.is_active ?? "?"} vis:${r.visible ?? "?"}`
    );
  }
}
main();
