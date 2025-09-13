// app/admin/reports/evaluations/page.tsx
'use client'

import { useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import { toCSV, downloadCSV } from '@/lib/export/csv'
import { toXLS, downloadXLS } from '@/lib/export/xls'

type Row = {
  student_name: string
  student_email: string
  course_title: string
  item_name: string
  score: number
  max_score: number
  passed: boolean
}

export default function AdminEvaluationsReport(){
  const supabase = useMemo(()=>supabaseBrowser(),[])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [course, setCourse] = useState<string>('')

  async function fetchReport(){
    setLoading(true); setError('')
    try {
      const t = (await supabase.auth.getSession()).data.session?.access_token
      const qs = new URLSearchParams()
      if (course) qs.set('courseId', course)
      const r = await fetch('/api/admin/reports/evaluations?'+qs.toString(), {
        headers: t ? { Authorization: `Bearer ${t}` } : {},
        cache: 'no-store'
      })
      if (r.status === 404) {
        setRows([
          { student_name:'Ejemplo Uno', student_email:'uno@ejemplo.cl', course_title:'Curso Ejemplo', item_name:'Prueba 1', score:18, max_score:20, passed:true },
          { student_name:'Ejemplo Dos', student_email:'dos@ejemplo.cl', course_title:'Curso Ejemplo', item_name:'Prueba 1', score:10, max_score:20, passed:false },
        ])
        return
      }
      const j = await r.json()
      setRows(Array.isArray(j?.items) ? j.items : [])
    } catch(e:any){
      setError(e?.message || 'Error de red')
    } finally {
      setLoading(false)
    }
  }

  function exportCSV(){
    const csv = toCSV(rows, ['student_name','student_email','course_title','item_name','score','max_score','passed'])
    downloadCSV('reporte_evaluaciones.csv', csv)
  }
  function exportXLS(){
    const xls = toXLS(rows, ['student_name','student_email','course_title','item_name','score','max_score','passed'], 'Evaluaciones')
    downloadXLS('reporte_evaluaciones.xls', xls)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold" style={{ color:'#1E3A8A' }}>Reporte de Evaluaciones</h1>

      <div className="mt-4 flex gap-2">
        <input className="rounded border px-3 py-2" placeholder="ID o slug de curso" value={course} onChange={e=>setCourse(e.target.value)} />
        <button className="btn-primary" onClick={fetchReport} disabled={loading}>{loading?'Cargando…':'Buscar'}</button>
      </div>

      {error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-4 overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b">
            <th className="px-3 py-2 text-left">Alumno</th>
            <th className="px-3 py-2 text-left">Correo</th>
            <th className="px-3 py-2 text-left">Curso</th>
            <th className="px-3 py-2 text-left">Ítem</th>
            <th className="px-3 py-2 text-left">Puntaje</th>
            <th className="px-3 py-2 text-left">Máximo</th>
            <th className="px-3 py-2 text-left">Aprobado</th>
          </tr></thead>
          <tbody>
            {rows.length===0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Sin datos</td></tr>}
            {rows.map((r,i)=>(
              <tr key={i} className="border-b">
                <td className="px-3 py-2">{r.student_name}</td>
                <td className="px-3 py-2">{r.student_email}</td>
                <td className="px-3 py-2">{r.course_title}</td>
                <td className="px-3 py-2">{r.item_name}</td>
                <td className="px-3 py-2">{r.score}</td>
                <td className="px-3 py-2">{r.max_score}</td>
                <td className="px-3 py-2">{r.passed ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex gap-2">
        <button className="btn-secondary" onClick={exportCSV} disabled={!rows.length}>Exportar CSV</button>
        <button className="btn-secondary" onClick={exportXLS} disabled={!rows.length}>Exportar Excel</button>
      </div>
    </main>
  )
}
