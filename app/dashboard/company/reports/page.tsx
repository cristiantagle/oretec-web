// app/dashboard/company/reports/page.tsx
'use client'

import { useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import { toCSV, downloadCSV } from '@/lib/export/csv'

type Row = {
  employee_name: string
  employee_email: string
  course_title: string
  attendance_pct: number
  avg_score: number
  passed: boolean
}

export default function CompanyReportsPage(){
  const supabase = useMemo(()=>supabaseBrowser(),[])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchData(){
    setLoading(true)
    try {
      const t = (await supabase.auth.getSession()).data.session?.access_token
      // Endpoint futuro: /api/company/reports/summary
      // Placeholder:
      setRows([
        { employee_name:'Trabajador Uno', employee_email:'uno@empresa.cl', course_title:'Altura', attendance_pct: 95, avg_score: 18.5, passed:true },
        { employee_name:'Trabajador Dos', employee_email:'dos@empresa.cl', course_title:'Altura', attendance_pct: 70, avg_score: 12.0, passed:false },
      ])
    } finally {
      setLoading(false)
    }
  }

  function exportCSV(){
    const csv = toCSV(rows, ['employee_name','employee_email','course_title','attendance_pct','avg_score','passed'])
    downloadCSV('reporte_empresa.csv', csv)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold" style={{ color:'#1E3A8A' }}>Reportes de Empresa</h1>
      <p className="mt-1 text-slate-600">Resumen de asistencia y evaluaciones de tus inscritos.</p>

      <div className="mt-3 flex gap-2">
        <button className="btn-primary" onClick={fetchData} disabled={loading}>{loading?'Cargando…':'Cargar'}</button>
        <button className="btn-secondary" onClick={exportCSV} disabled={!rows.length}>Exportar CSV</button>
      </div>

      <div className="mt-4 overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b">
            <th className="px-3 py-2 text-left">Nombre</th>
            <th className="px-3 py-2 text-left">Correo</th>
            <th className="px-3 py-2 text-left">Curso</th>
            <th className="px-3 py-2 text-left">Asistencia %</th>
            <th className="px-3 py-2 text-left">Nota prom.</th>
            <th className="px-3 py-2 text-left">Aprobado</th>
          </tr></thead>
          <tbody>
            {rows.length===0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Sin datos</td></tr>}
            {rows.map((r,i)=>(
              <tr key={i} className="border-b">
                <td className="px-3 py-2">{r.employee_name}</td>
                <td className="px-3 py-2">{r.employee_email}</td>
                <td className="px-3 py-2">{r.course_title}</td>
                <td className="px-3 py-2">{r.attendance_pct}%</td>
                <td className="px-3 py-2">{r.avg_score}</td>
                <td className="px-3 py-2">{r.passed ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
