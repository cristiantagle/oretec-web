'use client'

import { useState } from 'react'
import { makeCertificate, type CertData } from '@/lib/cert/makeCertificate'

export default function AdminCertificatesPage(){
  const [form, setForm] = useState<CertData>({
    alumno: '',
    rut: '',
    curso: '',
    horas: 8,
    nota: 6.5,
    fecha: new Date().toISOString().slice(0,10),
    instructor: '',
    folio: '',
    verificacionUrl: 'https://oretec.cl/cert/validar?folio=XXXX',
    logoUrl: '/images/logo-oretec.png',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  function set<K extends keyof CertData>(key: K, val: CertData[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handlePreview(){
    setLoading(true); setError('')
    try{
      const blob = await makeCertificate(form)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch(e:any){
      setError(e?.message || 'No se pudo generar el PDF')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload(){
    setLoading(true); setError('')
    try{
      const blob = await makeCertificate(form)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeAlumno = (form.alumno || 'certificado').replace(/[^\w\-]+/g,'_')
      a.download = `certificado_${safeAlumno}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch(e:any){
      setError(e?.message || 'No se pudo generar el PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold" style={{ color:'#1E3A8A' }}>Certificados</h1>
      <p className="mt-1 text-slate-600 text-sm">
        Genera certificados de asistencia con nota y firma, listos para descargar en PDF.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm text-slate-600">Alumno</label>
          <input className="rounded border px-3 py-2" value={form.alumno} onChange={e=>set('alumno', e.target.value)} placeholder="Nombre Apellido" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-600">RUT (opcional)</label>
          <input className="rounded border px-3 py-2" value={form.rut||''} onChange={e=>set('rut', e.target.value)} placeholder="12.345.678-9" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-600">Curso</label>
          <input className="rounded border px-3 py-2" value={form.curso} onChange={e=>set('curso', e.target.value)} placeholder="Nombre del curso" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-600">Horas (opcional)</label>
          <input type="number" min={0} className="rounded border px-3 py-2" value={form.horas??''} onChange={e=>set('horas', e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-600">Nota (opcional)</label>
          <input type="number" step="0.1" className="rounded border px-3 py-2" value={form.nota??''} onChange={e=>set('nota', e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-600">Fecha de término</label>
          <input type="date" className="rounded border px-3 py-2" value={form.fecha} onChange={e=>set('fecha', e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-600">Instructor (opcional)</label>
          <input className="rounded border px-3 py-2" value={form.instructor??''} onChange={e=>set('instructor', e.target.value)} placeholder="Nombre del instructor" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-600">Folio (opcional)</label>
          <input className="rounded border px-3 py-2" value={form.folio??''} onChange={e=>set('folio', e.target.value)} placeholder="ID único" />
        </div>
        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm text-slate-600">URL de verificación (QR)</label>
          <input className="rounded border px-3 py-2" value={form.verificacionUrl??''} onChange={e=>set('verificacionUrl', e.target.value)} placeholder="https://oretec.cl/cert/validar?folio=XXXX" />
        </div>
      </div>

      {error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-4 flex gap-2">
        <button className="btn-secondary" onClick={handlePreview} disabled={loading}>Vista previa</button>
        <button className="btn-primary" onClick={handleDownload} disabled={loading}>Descargar PDF</button>
      </div>

      <div className="mt-6 rounded-xl border bg-blue-50/50 p-3 text-sm text-slate-700">
        <strong>Nota:</strong> Este MVP genera el PDF en el navegador. Para folios firmados y verificación en línea,
        luego podemos mover la lógica a una API (server) y firmar con clave privada.
      </div>
    </main>
  )
}
