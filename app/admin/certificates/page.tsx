// app/admin/certificates/page.tsx
'use client'

import { useMemo, useState } from 'react'
import { makeCertificatePdf, type CertData } from '@/lib/cert/makeCertificate'
import { supabaseBrowser } from '@/lib/supabase/browser'
import Link from 'next/link'

export default function AdminCertificatesPage() {
  const supabase = useMemo(()=>supabaseBrowser(),[])
  const [downloading, setDownloading] = useState(false)

  const [alumno, setAlumno] = useState('')
  const [curso, setCurso] = useState('')
  const [horas, setHoras] = useState('8')
  const [nota, setNota] = useState('6.0')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10))
  const [instructor, setInstructor] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [rutEmpresa, setRutEmpresa] = useState('')
  const [folio, setFolio] = useState(() => String(Date.now()))
  const verifyBase = '/api/certificates/verify'
  const logoUrl = '/images/logo-oretec.png'
  const firmaUrl = '/images/cert-firma.png' // opcional; si no existe, no rompe

  async function descargar() {
    setDownloading(true)
    try {
      // Opcional: comprobar sesión (solo admin)
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        alert('Debes iniciar sesión para emitir certificados.')
        return
      }
      const payload: CertData = {
        alumno, curso, horas, nota, fecha, instructor,
        empresa: empresa || undefined,
        rutEmpresa: rutEmpresa || undefined,
        folio,
        verifyUrl: verifyBase,
        logoUrl,
        firmaUrl
      }
      const bytes = await makeCertificatePdf(payload)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificado_${folio}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e:any) {
      console.error(e)
      alert(e?.message || 'No se pudo generar el PDF')
    } finally {
      setDownloading(false)
    }
  }

  function demo() {
    setAlumno('Yasna Cabello Soto')
    setCurso('Trabajo en Altura')
    setHoras('8')
    setNota('6.5')
    setFecha('2025-09-01')
    setInstructor('Juan Pérez')
    setEmpresa('Adebo')
    setRutEmpresa('16.737.300-3')
    setFolio(String(Date.now()))
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color:'#1E3A8A' }}>Emisión de Certificados</h1>
        <Link href="/admin/reports" className="btn-secondary">← Volver a Reportes</Link>
      </div>

      <p className="text-sm text-slate-600 mb-2">
        Genera certificados de asistencia con nota, firma y QR de verificación. (MVP local)
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Alumno</label>
          <input className="rounded border px-3 py-2" value={alumno} onChange={e=>setAlumno(e.target.value)} placeholder="Nombre completo" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Curso</label>
          <input className="rounded border px-3 py-2" value={curso} onChange={e=>setCurso(e.target.value)} placeholder="Ej: Trabajo en Altura" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Horas</label>
          <input className="rounded border px-3 py-2" value={horas} onChange={e=>setHoras(e.target.value)} placeholder="Ej: 8" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Nota</label>
          <input className="rounded border px-3 py-2" value={nota} onChange={e=>setNota(e.target.value)} placeholder="Ej: 6.0" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Fecha</label>
          <input className="rounded border px-3 py-2" type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Instructor/a</label>
          <input className="rounded border px-3 py-2" value={instructor} onChange={e=>setInstructor(e.target.value)} placeholder="Ej: Juan Pérez" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Empresa (opcional)</label>
          <input className="rounded border px-3 py-2" value={empresa} onChange={e=>setEmpresa(e.target.value)} placeholder="Ej: Adebo" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">RUT Empresa (opcional)</label>
          <input className="rounded border px-3 py-2" value={rutEmpresa} onChange={e=>setRutEmpresa(e.target.value)} placeholder="Ej: 16.737.300-3" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-700">Folio</label>
          <input className="rounded border px-3 py-2" value={folio} onChange={e=>setFolio(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="btn-secondary" type="button" onClick={demo}>Completar demo</button>
        <button className="btn-primary" onClick={descargar} disabled={downloading}>
          {downloading ? 'Generando…' : 'Descargar PDF'}
        </button>
      </div>

      <div className="mt-6 rounded-xl border bg-blue-50 p-3 text-sm text-blue-900">
        Consejo: coloca una imagen de firma en <code>/public/images/cert-firma.png</code> (PNG con fondo transparente) para que aparezca en el PDF.
      </div>
    </main>
  )
}
