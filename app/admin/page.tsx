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
            setRows(data || [])
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
    } // 👈 aquí faltaba cerrar la llave correctamente

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
        {/* 🔗 Botón a la gestión de cursos */}
        <Link
        href="/admin/courses"
        className="px-4 py-2 rounded-xl text-white"
        style={{ background:'#1E3A8A' }}
        >
        Gestionar cursos
        </Link>
        </div>

        {loading ? 'Cargando…' : (
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
            <tr>
            <th className="p-2">Fecha</th>
            <th className="p-2">Alumno</th>
            <th className="p-2">Curso</th>
            <th className="p-2">Monto</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Comprobante</th>
            <th className="p-2">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {rows.map(r => (
                <tr key={r.order_id} className="border-t">
                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2">{r.user_name || r.user_email}</td>
                <td className="p-2">{r.course_title} ({r.course_code})</td>
                <td className="p-2">{clp(r.price_cents ?? 0)}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">
                {r.payment_proof ? (
                    <a className="text-blue-600 underline" href={r.payment_proof} target="_blank">Ver</a>
                ) : '-'}
                </td>
                <td className="p-2">
                {r.status !== 'paid' && (
                    <>
                    <button
                    onClick={() => approve(r.order_id)}
                    className="mr-2 px-3 py-1 rounded text-white"
                    style={{background:'#1E3A8A'}}
                    >
                    Aprobar
                    </button>
                    <button
                    onClick={() => reject(r.order_id)}
                    className="px-3 py-1 rounded border"
                    style={{borderColor:'#1E3A8A', color:'#1E3A8A'}}
                    >
                    Rechazar
                    </button>
                    </>
                )}
                </td>
                </tr>
            ))}
            {!rows.length && (
                <tr><td colSpan={7} className="text-center text-gray-500 py-6">No hay órdenes.</td></tr>
            )}
            </tbody>
            </table>
            </div>
        )}
        </main>
    )
}
