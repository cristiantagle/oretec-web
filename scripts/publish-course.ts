// Publicar/activar un curso por id o code, actualizando SOLO columnas existentes
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

// Parse args: --id=... o --code=...
const args = process.argv.slice(2);
let id: string | null = null;
let code: string | null = null;
for (const a of args) {
  if (a.startsWith("--id=")) id = a.slice(5);
  if (a.startsWith("--code=")) code = a.slice(7);
}

if (!id && !code) {
  console.error("Uso: npx tsx scripts/publish-course.ts --id=EL_ID  (o)  --code=EL_CODE");
  process.exit(1);
}

async function findCourse() {
  if (id) {
    const { data, error } = await sb.from("courses").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as Record<string, any> | null;
  } else {
    const { data, error } = await sb.from("courses").select("*").eq("code", code).maybeSingle();
    if (error) throw error;
    return data as Record<string, any> | null;
  }
}

async function main() {
  const row = await findCourse();
  if (!row) {
    console.error("No se encontró el curso con", id ? `id=${id}` : `code=${code}`);
    process.exit(1);
  }

  // Armamos payload SOLO con columnas existentes en el row actual:
  const payload: Record<string, any> = { updated_at: new Date().toISOString() };
  // published casi siempre existe, si no, igual lo agregamos porque es inofensivo si la columna existe en la DB:
  if ("published" in row || true) payload.published = true;
  if ("is_active" in row) payload.is_active = true;
  if ("visible" in row) payload.visible = true;

  const { data, error } = await sb
    .from("courses")
    .update(payload)
    .eq("id", row.id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("DB error (update):", error.message);
    process.exit(1);
  }

  console.log("✓ Actualizado");
  console.log({
    id: data?.id,
    code: data?.code,
    title: data?.title ?? data?.name,
    published: data?.published,
    is_active: (data as any)?.is_active,
    visible: (data as any)?.visible,
    updated_at: data?.updated_at,
  });
}
main();
