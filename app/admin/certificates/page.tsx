// app/admin/certificates/page.tsx
'use client'
import { useState } from 'react'
import { makeCertificate } from '@/lib/cert/makeCertificate'

export default function AdminCertificatesPage() {
  const [downloading, setDownloading] = useState(false)
  const [ok, setOk] = useState('')

  async function generarEjemplo() {
    setDownloading(true); setOk('')
    try {
      const blob = await makeCertificate({
        alumno: 'Juan Pérez',
        rut: '11.111.111-1',
        curso: 'Trabajo en Altura',
        horas: 24,
        nota: 6.2,
        fecha: '2025-09-10',
        instructor: 'María González',
        folio: 'OT-2025-0001',
        verificacionUrl: 'https://oretec.cl/cert/validar?folio=OT-2025-0001',
        logoUrl: '/images/logo-oretec.png',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'certificado.pdf'
      a.click()
      setOk('Certificado generado.')
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (e:any) {
      alert(e?.message || 'Error al generar certificado')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold" style={{ color:'#1E3A8A' }}>Certificados</h1>
      <p className="mt-2 text-slate-700">
        Genera certificados de asistencia con nota, firma e identificación por QR.
      </p>

      <div className="mt-4">
        <button className="btn-primary" onClick={generarEjemplo} disabled={downloading}>
          {downloading ? 'Generando…' : 'Generar certificado de ejemplo'}
        </button>
        {ok && <div className="mt-2 text-green-700">{ok}</div>}
      </div>
    </main>
  )
}
