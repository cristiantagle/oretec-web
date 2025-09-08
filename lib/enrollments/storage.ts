import { supabaseServer } from "@/lib/supabase/server";

/** Nombre del bucket donde guardamos inscripciones JSON */
export const ENROLL_BUCKET = "enrollments";

/** Asegura que exista el bucket (idempotente). */
export async function ensureBucket() {
  const sb = supabaseServer();
  // Intentamos crear con public=false; si ya existe, ignoramos error.
  // @ts-ignore: typings de storage pueden variar
  const { error } = await sb.storage.createBucket(ENROLL_BUCKET, { public: false });
  if (error && !String(error.message || "").toLowerCase().includes("already exists")) {
    // No abortamos: si no se puede crear pero ya existe o no tenemos permiso,
    // el put/list fallará y caerá el endpoint con un error, que veremos en logs.
  }
}

export type StoredEnrollment = {
  id: string;
  user_id: string;
  course_id: string;
  qty: number;
  status: "pending" | "confirmed" | "cancelled";
  paid: boolean;
  payer_email: string | null;
  created_at: string;
  updated_at: string;
  backend: "storage";
};

/** Crea y guarda una inscripción como JSON en Storage. */
export async function putEnrollmentStorage(input: {
  user_id: string;
  course_id: string;
  qty: number;
  payer_email: string | null;
}) {
  await ensureBucket();

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const doc: StoredEnrollment = {
    id,
    user_id: input.user_id,
    course_id: input.course_id,
    qty: input.qty,
    status: "pending",
    paid: false,
    payer_email: input.payer_email,
    created_at: now,
    updated_at: now,
    backend: "storage",
  };

  const path = `${input.user_id}/${now}-${id}.json`;

  const sb = supabaseServer();
  // @ts-ignore
  const { error } = await sb.storage.from(ENROLL_BUCKET).upload(path, new Blob([JSON.stringify(doc)], { type: "application/json" }), {
    upsert: false,
    contentType: "application/json",
  });

  if (error) throw new Error(`storage_upload_failed: ${error.message}`);

  return doc;
}

/** Lista inscripciones (JSON) para un usuario desde Storage. */
export async function listMyEnrollmentsStorage(user_id: string) {
  await ensureBucket();
  const sb = supabaseServer();

  // Listamos el "directorio" del usuario
  // @ts-ignore
  const { data: list, error: listErr } = await sb.storage.from(ENROLL_BUCKET).list(`${user_id}`, { limit: 100, offset: 0 });
  if (listErr) throw new Error(`storage_list_failed: ${listErr.message}`);

  const files = Array.isArray(list) ? list : [];
  const results: StoredEnrollment[] = [];

  for (const f of files) {
    if (!f?.name?.endsWith(".json")) continue;
    const key = `${user_id}/${f.name}`;
    // @ts-ignore
    const { data, error } = await sb.storage.from(ENROLL_BUCKET).download(key);
    if (error) continue;
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      results.push(parsed);
    } catch {
      // ignorar corruptos
    }
  }

  // Más recientes primero por created_at
  results.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
  return results;
}

