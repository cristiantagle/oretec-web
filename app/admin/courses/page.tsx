'use client'
import { useEffect, useMemo, useState } from 'react'

type Course = {
    id: string
    code: string
    slug: string
    title: string
    description: string | null
    price_cents: number | null
    hours: number | null
    level: string
    mp_link: string | null
    published: boolean
}

export default function AdminCoursesPage() {
    const [rows, setRows] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [msg, setMsg] = useState<string>('')

    const clp = (n: number) =>
    (n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

    async function load() {
        setLoading(true)
        try {
            const resp = await fetch('/api/admin/courses/list', { cache: 'no-store' })
            if (!resp.ok) throw new Error(await resp.text())
                const data: Course[] = await resp.json()
                setRows(data)
        } catch (e) {
            console.error(e)
            setRows([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const [draft, setDraft] = useState<Record<string, Partial<Course>>>({})

    function setField(id: string, key: keyof Course, value: any) {
        setDraft(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }))
    }

    async function save(id: string) {
        const payload = { id, ...draft[id] }
        setSavingId(id)
        try {
            const resp = await fetch('/api/admin/courses/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await resp.json()
            if (!resp.ok) throw new Error(data?.error || 'Error actualizando')

                // actualizar fila en memoria
                const updated = data.course as Course
                setRows(rs => rs.map(r => (r.id === id ? updated : r)))
                setDraft(d => {
                    const { [id]: _, ...rest } = d
                    return rest
                })
                setMsg('Curso actualizado')
                setTimeout(() => setMsg(''), 2000)
        } catch (e: any) {
            console.error(e)
            setMsg(`Error: ${e.message || e}`)
            setTimeout(() => setMsg(''), 4000)
        } finally {
            setSavingId(null)
        }
    }

    const changedIds = useMemo(() => new Set(Object.keys(draft)), [draft])

    return (
        <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1E3A8A' }}>
        Admin — Cursos
        </h1>

        {msg && <div className="mb-4 rounded-xl border p-3 text-sm bg-blue-50 text-blue-700">{msg}</div>}

        {loading ? (
            <div className="rounded-xl border p-4">Cargando…</div>
        ) : (
            <div className="overflow-x-auto rounded-2xl border">
            <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
            <th>Código</th>
            <th>Título</th>
            <th>Precio (CLP)</th>
            <th>Horas</th>
            <th>Nivel</th>
            <th>Publicado</th>
            <th>MP Link</th>
            <th>Guardar</th>
            </tr>
            </thead>
            <tbody className="[&>tr>*]:px-3 [&>tr>*]:py-2">
            {rows.map((r) => {
                const d = draft[r.id] || {}
                const priceValue = d.price_cents ?? r.price_cents ?? 0
                const hoursValue = d.hours ?? r.hours ?? 0
                return (
                    <tr key={r.id} className="border-t align-top">
                    <td className="font-mono">{r.code}</td>
                    <td>
                    <input
                    className="w-64 border rounded px-2 py-1"
                    defaultValue={r.title}
                    onChange={(e) => setField(r.id, 'title', e.target.value)}
                    />
                    <div className="text-xs text-gray-500 mt-1">slug: {r.slug}</div>
                    </td>
                    <td>
                    <input
                    type="number"
                    className="w-32 border rounded px-2 py-1"
                    defaultValue={r.price_cents ?? 0}
                    onChange={(e) => setField(r.id, 'price_cents', e.target.value)}
                    />
                    <div className="text-xs text-gray-500 mt-1">{clp(Number(priceValue) || 0)}</div>
                    </td>
                    <td>
                    <input
                    type="number"
                    className="w-20 border rounded px-2 py-1"
                    defaultValue={r.hours ?? 0}
                    onChange={(e) => setField(r.id, 'hours', e.target.value)}
                    />
                    </td>
                    <td>
                    <select
                    className="border rounded px-2 py-1"
                    defaultValue={r.level}
                    onChange={(e) => setField(r.id, 'level', e.target.value)}
                    >
                    <option>Básico</option>
                    <option>Intermedio</option>
                    <option>Avanzado</option>
                    </select>
                    </td>
                    <td>
                    <input
                    type="checkbox"
                    defaultChecked={r.published}
                    onChange={(e) => setField(r.id, 'published', e.target.checked)}
                    />
                    </td>
                    <td className="max-w-[240px]">
                    <input
                    className="w-64 border rounded px-2 py-1"
                    defaultValue={r.mp_link ?? ''}
                    onChange={(e) => setField(r.id, 'mp_link', e.target.value)}
                    />
                    </td>
                    <td className="whitespace-nowrap">
                    <button
                    disabled={!changedIds.has(r.id) || savingId === r.id}
                    onClick={() => save(r.id)}
                    className={`px-3 py-1 rounded text-white ${!changedIds.has(r.id) || savingId === r.id ? 'opacity-40' : ''}`}
                    style={{ background: '#1E3A8A' }}
                    >
                    {savingId === r.id ? 'Guardando…' : 'Guardar'}
                    </button>
                    </td>
                    </tr>
                )
            })}
            {!rows.length && (
                <tr>
                <td colSpan={8} className="text-center text-gray-500 py-8">No hay cursos.</td>
                </tr>
            )}
            </tbody>
            </table>
            </div>
        )}
        </main>
    )
}
