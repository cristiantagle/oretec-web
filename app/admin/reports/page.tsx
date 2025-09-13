// app/admin/reports/page.tsx
'use client'

import Link from 'next/link'

export default function AdminReportsIndex(){
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold" style={{ color:'#1E3A8A' }}>Reportes</h1>
      <p className="mt-2 text-slate-600">Selecciona un tipo de reporte:</p>

      <div className="mt-4 grid gap-3">
        <Link href="/admin/reports/attendance" className="rounded-xl border p-4 hover:bg-slate-50">
          <div className="font-medium">Asistencia</div>
          <div className="text-sm text-slate-600">Filtra por curso y rango de fechas. Exporta CSV.</div>
        </Link>
        <Link href="/admin/reports/evaluations" className="rounded-xl border p-4 hover:bg-slate-50">
          <div className="font-medium">Evaluaciones</div>
          <div className="text-sm text-slate-600">Notas por curso y alumno. Exporta CSV.</div>
        </Link>
      </div>
    </main>
  )
}
