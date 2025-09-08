/* eslint-disable @next/next/no-img-element */
"use client"
import { useState } from 'react'
import SectionTitle from '@/components/SectionTitle'
import Link from 'next/link'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    hp: '', // honeypot anti-spam (dejar vacío)
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    try {
      const r = await fetch('/api/public/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data?.error || 'No se pudo enviar el mensaje')
      setOk(true)
      setForm({ name: '', email: '', phone: '', company: '', message: '', hp: '' })
    } catch (e: any) {
      setErr(e?.message || 'Error al enviar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <SectionTitle subtitle="¿Tienes dudas o necesitas una propuesta a medida? Escríbenos y te contactamos.">
        Contáctanos
      </SectionTitle>

      <div className="grid items-stretch gap-8 md:grid-cols-2">
        {/* Panel formulario */}
        <div className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-soft">
          {/* halo suave */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-[1px] rounded-[18px]"
            style={{ boxShadow: '0 0 0 1px rgba(30,58,138,0.08)' }}
          />
          {ok ? (
            <div className="text-center py-10">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-700 text-xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">¡Mensaje enviado!</h3>
              <p className="mt-1 text-slate-600">Gracias por escribirnos. Te responderemos a la brevedad.</p>
              <div className="mt-5 flex justify-center gap-3">
                <Link href="/courses" className="btn-primary">Ver cursos</Link>
                <Link href="/" className="btn-secondary">Volver al inicio</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4">
              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {err}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-600">Nombre *</label>
                  <input
                    required
                    className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Email *</label>
                  <input
                    type="email"
                    required
                    className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="tu@correo.cl"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-600">Teléfono</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Empresa</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600">Mensaje *</label>
                <textarea
                  required
                  rows={4}
                  className="mt-1 w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-200"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Cuéntanos brevemente qué necesitas…"
                />
              </div>

              {/* honeypot (oculto) */}
              <input
                type="text"
                value={form.hp}
                onChange={(e) => setForm({ ...form, hp: e.target.value })}
                className="hidden"
                autoComplete="off"
                tabIndex={-1}
              />

              <div className="pt-1">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Ilustración SVG y puntos de confianza */}
        <div className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-soft">
          <div className="absolute inset-0 -z-10 bg-oret-gradient" />
          <img
            src="/images/contact-abstract.svg"
            alt="Contacto OreTec"
            className="mx-auto h-64 w-auto"
            loading="eager"
          />
          <ul className="mt-6 grid gap-3 text-sm text-slate-700">
            <li>• Respuesta en horario hábil</li>
            <li>• Propuestas a medida para empresas</li>
            <li>• 100% online - Certificación digital</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
