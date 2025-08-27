'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Row = {
  order_id: string
  status: 'pending' | 'pending_review' | 'paid' | 'failed'
  created_at: string
  payment_proof: string | null
  payment_notes: string | null
  user_email: string | null
  user_name: string | null
  course_code: string | null
  course_title: string | null
  price_cents: number | null
}

export default function AdminPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const resp = await fetch('/api/admin/list', { cache: 'no-store' })
      const data = await resp.json()
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function approve(id: string) {
    if (!confirm('¿Aprobar y matricular?')) return
      await fetch('/api/admin/orders/approve', {
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ orderId: id })
      })
      await load()
  }

  async function reject(id: string) {
    const note = prompt('Motivo de rechazo:') || ''
    await fetch('/api/admin/orders/reject', {
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ orderId: id, note })
    })
    await load()
  }

  const clp = (n: number) =>
  (n || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
    <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold" style={{color:'#1E3A8A'}}>
    Panel Admin — Órdenes
    </h1>

    <div className="flex items-center gap-3">
    <Link
    href="/admin/courses"
    className="px-4 py-2 rounded-xl text-white"
    style={{ background:'#1E3A8A' }}
    >
    Gestionar cursos
    </Link>

    {/* Logout por POST -> /api/admin/logout (redirige al home "/") */}
    <form action="/api/admin/logout" method="post">
    <button
    type="submit"
    className="px-3 py-2 rounded-xl border"
    style={{ borderColor:'#1E3A8A', color:'#1E3A8A' }}
    >
    Cerrar sesión
    </button>
    </form>
    </div>
    </div>

    {loading ? (
      <div className="rounded-xl border p-4">Cargando…</div>
    ) : (
      <div className="overflow-x-auto rounded-2xl border">
      <table className="min-w-full text-sm">
      <thead className="bg-gray-50">
      <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
      <th>Fecha</th>
      <th>Alumno</th>
      <th>Curso</th>
      <th>Monto</th>
      <th>Estado</th>
      <th>Comprobante</th>
      <th>Acciones</th>
      </tr>
      </thead>
      <tbody className="[&>tr>*]:px-3 [&>tr>*]:py-2">
      {rows.map((r) => (
        <tr key={r.order_id} className="border-t">
        <td>{new Date(r.created_at).toLocaleString()}</td>
        <td>{r.user_name || r.user_email || '—'}</td>
        <td>{r.course_title ? `${r.course_title} (${r.course_code})` : '—'}</td>
        <td>{clp(r.price_cents ?? 0)}</td>
        <td>
        <span
        className={`px-2 py-0.5 rounded-full text-xs ${
          r.status === 'paid'
          ? 'bg-green-100 text-green-700'
          : r.status === 'failed'
          ? 'bg-red-100 text-red-700'
          : 'bg-gray-100 text-gray-700'
        }`}
        >
        {r.status}
        </span>
        </td>
        <td>
        {r.payment_proof ? (
          <a
          className="text-blue-600 underline"
          href={r.payment_proof}
          target="_blank"
          rel="noopener noreferrer"
          >
          Ver
          </a>
        ) : (
          '—'
        )}
        </td>
        <td className="space-x-2">
        {r.status !== 'paid' && (
          <>
          <button
          onClick={() => approve(r.order_id)}
          className="px-3 py-1 rounded text-white"
          style={{ background: '#1E3A8A' }}
          >
          Aprobar
          </button>
          <button
          onClick={() => reject(r.order_id)}
          className="px-3 py-1 rounded border"
          style={{ borderColor:'#1E3A8A', color:'#1E3A8A' }}
          >
          Rechazar
          </button>
          </>
        )}
        </td>
        </tr>
      ))}
      {!rows.length && (
        <tr>
        <td colSpan={7} className="text-center text-gray-500 py-8">
        No hay órdenes aún.
        </td>
        </tr>
      )}
      </tbody>
      </table>
      </div>
    )}
    </main>
  )
}
