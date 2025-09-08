"use client"

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
    created_at?: string
}

export default function AdminCoursesPage() {
    const [rows, setRows] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [msg, setMsg] = useState<string>('')

    const [creating, setCreating] = useState(false)
    const [newCourse, setNewCourse] = useState({
        code: '',
        title: '',
        description: '',
        price_clp: '',
        hours: '',
        level: 'Básico' as 'Básico' | 'Intermedio' | 'Avanzado',
        mp_link: '',
        published: true,
    })

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

                const updated = data.course as Course
                setRows(rs => rs.map(r => (r.id === id ? updated : r)))
                setDraft(_d => {
                    const { [id]: _, ...rest } = _d
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

    async function createCourse(e: React.FormEvent) {
        e.preventDefault()
        if (!newCourse.code || !newCourse.title) {
            setMsg('Completa código y título')
            setTimeout(() => setMsg(''), 2500)
            return
        }
        setCreating(true)
        try {
            const resp = await fetch('/api/admin/courses/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCourse),
            })
            const data = await resp.json()
            if (!resp.ok) throw new Error(data?.error || 'Error creando curso')

                const created: Course = data.course
                setRows(rs => [created, ...rs])
                setNewCourse({
                    code: '',
                    title: '',
                    description: '',
                    price_clp: '',
                    hours: '',
                    level: 'Básico',
                    mp_link: '',
                    published: true,
                })
                setMsg('Curso creado')
                setTimeout(() => setMsg(''), 2000)
        } catch (e: any) {
            console.error(e)
            setMsg(`Error creando: ${e.message || e}`)
            setTimeout(() => setMsg(''), 4000)
        } finally {
            setCreating(false)
        }
    }

    async function duplicateCourse(id: string) {
        if (!confirm('¿Duplicar este curso?')) return
            try {
                const resp = await fetch('/api/admin/courses/duplicate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id }),
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data?.error || 'No se pudo duplicar')

                    const created: Course = data.course
                    setRows(rs => [created, ...rs])
                    setMsg('Curso duplicado')
                    setTimeout(() => setMsg(''), 2000)
            } catch (e: any) {
                console.error(e)
                setMsg(`Error duplicando: ${e.message || e}`)
                setTimeout(() => setMsg(''), 4000)
            }
    }

    async function deleteCourse(id: string) {
        if (!confirm('¿Eliminar curso?')) return
            try {
                const resp = await fetch('/api/admin/courses/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id }),
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data?.error || 'No se pudo eliminar')

                    setRows(rs => rs.filter(r => r.id !== id))
                    setMsg('Curso eliminado')
                    setTimeout(() => setMsg(''), 2000)
            } catch (e: any) {
                console.error(e)
                setMsg(`Error eliminando: ${e.message || e}`)
                setTimeout(() => setMsg(''), 4000)
            }
    }

    return (
        <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold" style={{ color: '#1E3A8A' }}>
        Admin - Cursos
        </h1>

        {msg && <div className="mb-4 rounded-xl border p-3 text-sm bg-blue-50 text-blue-700">{msg}</div>}

        {/* Crear curso */}
        <form onSubmit={createCourse} className="mb-6 grid gap-3 rounded-2xl border bg-white p-4">
        <div className="font-semibold text-slate-900">Crear curso</div>
        <div className="grid gap-3 md:grid-cols-2">
        <input
        className="w-full border rounded px-2 py-1"
        value={newCourse.code}
        onChange={(e) => setNewCourse(v => ({ ...v, code: e.target.value.trim() }))}
        placeholder="Código*"
        required
        />
        <input
        className="w-full border rounded px-2 py-1"
        value={newCourse.title}
        onChange={(e) => setNewCourse(v => ({ ...v, title: e.target.value }))}
        placeholder="Título*"
        required
        />
        <input
        type="number"
        className="w-full border rounded px-2 py-1"
        value={newCourse.price_clp}
        onChange={(e) => setNewCourse(v => ({ ...v, price_clp: e.target.value }))}
        placeholder="Precio CLP"
        />
        <input
        type="number"
        className="w-full border rounded px-2 py-1"
        value={newCourse.hours}
        onChange={(e) => setNewCourse(v => ({ ...v, hours: e.target.value }))}
        placeholder="Horas"
        />
        <select
        className="w-full border rounded px-2 py-1"
        value={newCourse.level}
        onChange={(e) => setNewCourse(v => ({ ...v, level: e.target.value as any }))}
        >
        <option>Básico</option>
        <option>Intermedio</option>
        <option>Avanzado</option>
        </select>
        <input
        className="w-full border rounded px-2 py-1"
        value={newCourse.mp_link}
        onChange={(e) => setNewCourse(v => ({ ...v, mp_link: e.target.value }))}
        placeholder="https://mpago.la/..."
        />
        </div>
        <textarea
        className="w-full border rounded px-2 py-1"
        rows={3}
        value={newCourse.description}
        onChange={(e) => setNewCourse(v => ({ ...v, description: e.target.value }))}
        placeholder="Descripción breve del curso…"
        />
        <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
        type="checkbox"
        checked={newCourse.published}
        onChange={(e) => setNewCourse(v => ({ ...v, published: e.target.checked }))}
        />
        Publicado
        </label>
        <button type="submit" disabled={creating} className="btn-primary">
        {creating ? 'Creando…' : 'Crear curso'}
        </button>
        </div>
        </form>

        {/* Tabla */}
        {loading ? (
            <div className="rounded-xl border p-4">Cargando…</div>
        ) : (
            <div className="overflow-x-auto rounded-2xl border bg-white">
            <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
            <th>Código</th>
            <th>Título</th>
            <th>Precio</th>
            <th>Horas</th>
            <th>Nivel</th>
            <th>Publicado</th>
            <th>MP Link</th>
            <th>Guardar</th>
            <th>Acciones</th>
            </tr>
            </thead>
            <tbody className="[&>tr>*]:px-3 [&>tr>*]:py-2">
            {rows.map((r) => {
                const _d = draft[r.id] || {}
                return (
                    <tr key={r.id} className="border-t align-top">
                    <td className="font-mono">{r.code}</td>
                    <td>
                    <input
                    className="w-64 border rounded px-2 py-1"
                    defaultValue={r.title}
                    onChange={(e) => setField(r.id, 'title', e.target.value)}
                    />
                    <div className="mt-1 text-xs text-gray-500">slug: {r.slug}</div>
                    </td>
                    <td>
                    <input
                    type="number"
                    className="w-32 border rounded px-2 py-1"
                    defaultValue={r.price_cents ?? 0}
                    onChange={(e) => setField(r.id, 'price_cents', e.target.value)}
                    />
                    <div className="mt-1 text-xs text-gray-500">{clp(r.price_cents ?? 0)}</div>
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
                    <td>
                    <input
                    className="w-64 border rounded px-2 py-1"
                    defaultValue={r.mp_link ?? ''}
                    onChange={(e) => setField(r.id, 'mp_link', e.target.value)}
                    />
                    </td>
                    <td>
                    <button
                    disabled={!changedIds.has(r.id) || savingId === r.id}
                    onClick={() => save(r.id)}
                    className={`btn-primary ${(!changedIds.has(r.id) || savingId === r.id) ? 'opacity-40' : ''}`}
                    >
                    {savingId === r.id ? 'Guardando…' : 'Guardar'}
                    </button>
                    </td>
                    <td className="space-x-2">
                    <button onClick={() => duplicateCourse(r.id)} className="btn-secondary">
                    Duplicar
                    </button>
                    <button onClick={() => deleteCourse(r.id)} className="btn-danger">
                    Eliminar
                    </button>
                    </td>
                    </tr>
                )
            })}
            {!rows.length && (
                <tr>
                <td colSpan={9} className="py-8 text-center text-gray-500">No hay cursos.</td>
                </tr>
            )}
            </tbody>
            </table>
            </div>
        )}
        </main>
    )
}
