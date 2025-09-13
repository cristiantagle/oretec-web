
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { supabaseBrowser } from "@/lib/supabase/browser"

type AccountType = "admin" | "instructor" | "company" | "student"
type Row = {
  id: string
  email: string | null
  full_name: string | null
  rut: string | null
  company_name: string | null
  account_type: AccountType | null
  phone: string | null
  created_at: string | null
  updated_at: string | null
}

export default function UsersReportPanel() {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const abortRef = useRef(new AbortController())

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [kpi, setKpi] = useState<{ total: number; nuevos_30d: number; por_tipo: Record<string, number> } | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)

  const _totalPages = Math.max(1, Math.ceil(total / pageSize))

  async function fetchData(opts?: { page?: number }) {
    const p = opts?.page ?? page
    setLoading(true); setError(null)
    try {
      const { data: sess, error: sErr } = await supabase.auth.getSession()
      if (sErr) throw sErr
      const token = sess.session?.access_token
      if (!token) throw new Error("No autenticado")

      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(pageSize),
      })
      if (from) params.set("from", from)
      if (to) params.set("to", to)
      if (search.trim()) params.set("search", search.trim())

      const r = await fetch(`/api/admin/reports/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: abortRef.current.signal,
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || j?.detail || `status_${r.status}`)

      setKpi(j.kpi)
      setRows(j.items)
      setTotal(j.total)
      setPage(j.page)
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message || "No se pudo cargar el reporte")
      }
    } finally {
      setLoading(false)
    }
  }

  async function exportCSV() {
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token
      if (!token) throw new Error("No autenticado")

      const params = new URLSearchParams()
      if (from) params.set("from", from)
      if (to) params.set("to", to)
      if (search.trim()) params.set("search", search.trim())
      params.set("format", "csv")

      const r = await fetch(`/api/admin/reports/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j?.error || j?.detail || "csv_error")
      }
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "usuarios.csv"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e?.message || String(e))
    }
  }

  useEffect(() => {
    abortRef.current = new AbortController()
    fetchData({ page: 1 })
    return () => abortRef.current.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize])

  return (
    <section className="mt-4">
      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Total usuarios</div>
          <div className="mt-1 text-2xl font-semibold text-blue-950">{kpi?.total ?? "-"}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Nuevos (30 días)</div>
          <div className="mt-1 text-2xl font-semibold text-blue-950">{kpi?.nuevos_30d ?? "-"}</div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Por tipo (Empresa / Estudiante)</div>
          <div className="mt-1 text-sm text-slate-700">
            Empresa: <b>{kpi?.por_tipo?.company ?? 0}</b> · Estudiante: <b>{kpi?.por_tipo?.student ?? 0}</b>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Por tipo (Admin / Relator)</div>
          <div className="mt-1 text-sm text-slate-700">
            Admin: <b>{kpi?.por_tipo?.admin ?? 0}</b> · Relator: <b>{kpi?.por_tipo?.instructor ?? 0}</b>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="date"
          className="rounded border px-3 py-2 text-sm"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="Desde"
        />
        <input
          type="date"
          className="rounded border px-3 py-2 text-sm"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Hasta"
        />
        <input
          className="rounded border px-3 py-2 text-sm"
          placeholder="Buscar por nombre, email, rut, empresa…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") fetchData({ page: 1 }) }}
        />
        <div className="flex gap-2">
          <button
            className="rounded bg-blue-900 px-3 py-2 text-white hover:bg-blue-800 text-sm"
            onClick={() => fetchData({ page: 1 })}
            disabled={loading}
          >
            {loading ? "Cargando…" : "Aplicar"}
          </button>
          <button
            className="rounded border px-3 py-2 text-sm hover:bg-slate-50"
            onClick={exportCSV}
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">RUT</th>
              <th className="px-3 py-2">Correo</th>
              <th className="px-3 py-2">Empresa</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Teléfono</th>
              <th className="px-3 py-2">Creado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2">{u.full_name || "-"}</td>
                <td className="px-3 py-2">{u.rut || "-"}</td>
                <td className="px-3 py-2">{u.email || "-"}</td>
                <td className="px-3 py-2">{u.company_name || "-"}</td>
                <td className="px-3 py-2">{u.account_type || "-"}</td>
                <td className="px-3 py-2">{u.phone || "-"}</td>
                <td className="px-3 py-2">{u.created_at ? new Fecha(u.created_at).toLocaleString() : "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div>Total: <strong>{total}</strong></div>
        <div className="flex items-center gap-2">
          <select
            className="rounded border px-2 py-1"
            value={pageSize}
            onChange={(e) => { const v = Number(e.target.value); setPageSize(v) }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => fetchData({ page: Math.max(1, page - 1) })}
            disabled={page <= 1 || loading}
          >
            Anterior
          </button>
          <span>Página {page} de {Math.max(1, Math.ceil(total / pageSize))}</span>
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => fetchData({ page: Math.min(Math.max(1, Math.ceil(total / pageSize)), page + 1) })}
            disabled={page >= Math.max(1, Math.ceil(total / pageSize)) || loading}
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  )
}
