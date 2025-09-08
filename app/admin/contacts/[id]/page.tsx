"use client"
import { useEffect, useState } from "react";
import Link from "next/link";

type Contact = {
  id: string;
  created_at: string;
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
  status: "new" | "in_progress" | "done";
  archived: boolean;
  admin_notes: string | null; // ← usar admin_notes
};

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [row, setRow] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>(""); // draft local
  const [savedMsg, setSavedMsg] = useState<string>("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/contacts/get?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      if (!r.ok) throw new Error(await r.text().catch(() => `HTTP ${r.status}`));
      const data: Contact = await r.json();
      setRow(data);
      setNotesDraft(data.admin_notes || "");
    } catch (e:any) {
      setError(e?.message ?? "No se pudo cargar el contacto");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function save(fields: Partial<Contact>) {
    if (!row) return;
    setSaving(true);
    try {
      const r = await fetch("/api/admin/contacts/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, ...fields })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "No se pudo guardar");
      // Refrescar estado local
      const merged = { ...row, ...fields };
      setRow(merged as Contact);
      // si guardamos admin_notes, refleja el draft
      if ("admin_notes" in fields) {
        setNotesDraft(fields.admin_notes as string || "");
      }
      setSavedMsg("Guardado");
      setTimeout(() => setSavedMsg(""), 1500);
    } catch (e:any) {
      alert(e?.message ?? "Error guardando");
    } finally {
      setSaving(false);
    }
  }

  const mailto = row?.email
  ? `mailto:${row.email}?subject=${encodeURIComponent(row?.subject || "Consulta")}&body=${encodeURIComponent((row?.message || "") + "\n\n- Enviado desde OreTec")}`
  : null;

  const tel = row?.phone ? `tel:${row.phone}` : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
    <div className="mb-6 flex items-center justify-between">
    <h1 className="text-2xl font-bold" style={{ color: "#1E3A8A" }}>Admin - Contacto</h1>
    <div className="flex gap-2">
    <Link href="/admin/contacts" className="btn-secondary">← Volver</Link>
    <button onClick={load} className="btn-secondary">Recargar</button>
    </div>
    </div>

    {loading ? (
      <div className="rounded-xl border p-4">Cargando…</div>
    ) : error ? (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
    ) : !row ? (
      <div className="rounded-xl border p-4">No encontrado.</div>
    ) : (
      <div className="grid gap-6">

      {/* Cabecera compacta */}
      <section className="card shadow-soft p-5">
      <div className="text-sm text-slate-500">
      {new Date(row.created_at).toLocaleString()}
      </div>
      <h2 className="mt-1 text-xl font-semibold text-slate-900">
      {row.subject || "Consulta"}
      </h2>
      <div className="mt-2 text-slate-700">
      <span className="font-medium">{row.name || "Sin nombre"}</span>
      {row.company && <span className="text-slate-500"> · {row.company}</span>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
      {row.email && (
        <a className="btn-secondary" href={mailto || "#"}>Responder por email</a>
      )}
      {tel && <a className="btn-secondary" href={tel}>Llamar</a>}
      </div>
      </section>

      {/* Mensaje completo */}
      <section className="card shadow-soft p-5">
      <div className="mb-2 text-sm font-medium text-slate-900">Mensaje</div>
      <p className="whitespace-pre-wrap text-slate-700">{row.message || "-"}</p>
      </section>

      {/* Acciones / estado */}
      <section className="card shadow-soft grid gap-4 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1">
      <span className="text-sm text-slate-600">Estado</span>
      <select
      className="rounded border px-2 py-1"
      value={row.status}
      onChange={(e) => save({ status: e.target.value as Contact["status"] })}
      disabled={saving}
      >
      <option value="new">new</option>
      <option value="in_progress">in_progress</option>
      <option value="done">done</option>
      </select>
      </label>

      <label className="mt-1 flex items-center gap-2 sm:mt-0">
      <input
      type="checkbox"
      checked={row.archived}
      onChange={(e) => save({ archived: e.target.checked })}
      disabled={saving}
      />
      <span className="text-sm text-slate-700">Archivado</span>
      </label>
      </div>

      <label className="grid gap-1">
      <span className="text-sm text-slate-600">Notas internas</span>
      <textarea
      rows={4}
      className="rounded border px-2 py-1"
      value={notesDraft}
      onChange={(e) => setNotesDraft(e.target.value)}
      placeholder="Notas internas (no se envían al cliente)"
      disabled={saving}
      />
      <div className="mt-2 flex items-center gap-2">
      <button
      type="button"
      className="btn-primary"
      disabled={saving}
      onClick={() => save({ admin_notes: notesDraft })}
      >
      {saving ? "Guardando…" : "Guardar notas"}
      </button>
      {savedMsg && <span className="text-sm text-blue-700">{savedMsg}</span>}
      </div>
      </label>
      </section>
      </div>
    )}
    </main>
  );
}
