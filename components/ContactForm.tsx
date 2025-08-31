
"use client"

import { useState } from "react"

export default function ContactForm() {
  const [sending, setSending] = useState(false)
  const [ok, setOk] = useState<null | boolean>(null)
  const [msg, setMsg] = useState<string>("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setSending(true); setOk(null); setMsg("")
    try {
      const r = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j?.error || "No se pudo enviar")
      setOk(true); setMsg("¡Recibido! Te contactaremos pronto.")
      form.reset()
    } catch (e: any) {
      setOk(false); setMsg(e?.message || "Error al enviar")
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card shadow-soft p-6 grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-700 mb-1">Nombre *</label>
          <input name="name" required className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Email *</label>
          <input name="email" required type="email" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Teléfono</label>
          <input name="phone" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Empresa</label>
          <input name="company" className="w-full rounded border px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-700 mb-1">Mensaje *</label>
        <textarea name="message" required rows={4} className="w-full rounded border px-3 py-2" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={sending} className="btn-primary">
          {sending ? "Enviando…" : "Enviar"}
        </button>
        {ok === true && <span className="text-green-700 text-sm">{msg}</span>}
        {ok === false && <span className="text-red-700 text-sm">{msg}</span>}
      </div>
    </form>
  )
}

