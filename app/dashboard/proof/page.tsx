'use client'
import { useEffect, useState } from 'react'

type Course = { id: string; title: string; code: string }

export default function ProofPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [courseId, setCourseId] = useState('')
  const [paymentProof, setPaymentProof] = useState('')
  const [userId, setUserId] = useState('') // en producción, viene del Auth

  useEffect(() => {
    fetch('/api/public/courses').then(r=>r.json()).then(setCourses)
  }, [])

  async function submit() {
    if (!userId || !courseId || !paymentProof) {
      alert('Completa todos los campos'); return
    }
    const resp = await fetch('/api/order/create-and-proof', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ userId, courseId, paymentProof })
    })
    const data = await resp.json()
    if (data.ok) alert('Comprobante enviado. Quedó en revisión.')
    else alert(data.error || 'Error')
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold mb-4" style={{color:'#1E3A8A'}}>Enviar comprobante</h1>

      <label className="block text-sm mb-1">Tu User ID (temporal)</label>
      <input value={userId} onChange={e=>setUserId(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" placeholder="uuid de tu perfil" />

      <label className="block text-sm mb-1">Curso</label>
      <select value={courseId} onChange={e=>setCourseId(e.target.value)} className="w-full border rounded px-3 py-2 mb-3">
        <option value="">Selecciona…</option>
        {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
      </select>

      <label className="block text-sm mb-1">Comprobante (folio o URL)</label>
      <input value={paymentProof} onChange={e=>setPaymentProof(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" placeholder="Ej: N° operación o link" />

      <button onClick={submit} className="rounded-xl px-4 py-2 text-white" style={{background:'#1E3A8A'}}>Enviar</button>
    </main>
  )
}
