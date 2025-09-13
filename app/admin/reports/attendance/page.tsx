// app/admin/reports/attendance/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import { toCSV, downloadCSV } from '@/lib/export/csv'
import { toXLS, downloadXLS } from '@/lib/export/xls'

type Row = {
  student_name: string
  student_email: string
  course_title: string
  class_date: string
  status: 'present'|'absent'|'late'
}

const demoRows: Row[] = [
  { student_name:'Ejemplo Uno', student_email:'uno@ejemplo.cl', course_title:'Curso Ejemplo', class_date:'2025-09-01', status:'present' },
  { student_name:'Ejemplo Dos', student_email:'dos@ejemplo.cl', course_title:'Curso Ejemplo', class_date:'2025-09-01', status:'late' },
  { student_name:'Ejemplo Tres', student_email:'tres@ejemplo.cl', course_title:'Curso Ejemplo', class_date:'2025-09-02', status:'absent' },
]

export default function AdminAttendanceReport(){
  const supabase = useMemo(()=>supabaseBrowser(),[])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [course, setCourse] = useState<string>('')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  async function fetchReport(){
    setLoading(true); setError('')
    try {
      const t = (await supabase.auth.getSession()).data.session?.access_token
      const qs = new URLSearchParams()
      if (course) qs.set('courseId', course)
      if (from) qs.set('from', from)
      if (to) qs.set('to', to)
      const r = await fetch('/api/admin/reports/attendance?'+qs.toString(), {
        headers: t ? { Authorization: `Bearer ${t}` } : {},
        cache: 'no-store'
      })
      if (r.status === 404) {
        setRows(demoRows)
        return
      }
      const j = await r.json()
      const list = Array.isArray(j?.items) ? j.items : []
      setRows(list.length ? list : [])
    } catch(e:any){
      setError(e?.message || 'Error de red')
    } finally {
      setLoading(false)
    }
  }

  function useDemo(){
    setRows(demoRows)
  }

  function exportCSV(){
    const csv = toCSV(rows, ['student_name','student_email','course_title','class_date','status'])
    downloadCSV('reporte_asistencia.csv', csv)
  }
  function exportXLS(){
    const xls = toXLS(rows, ['student_name','student_email','course_title','class_date','status'], 'Asistencia')
    downloadXLS('reporte_asistencia.xls', xls)
  }

  useEffect(()=>{},[])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold" style={{ color:'#1E3A8A' }}>Reporte de Asistencia</h1>

      <div className="mt-4 grid gap-2 md:grid-cols-5">
        <input className="rounded border px-3 py-2" placeholder="ID o slug de curso" value={course} onChange={e=>setCourse(e.target.value)} />
        <input className="rounded border px-3 py-2" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <input className="rounded border px-3 py-2" type="date" value={to} onChange={e=>setTo(e.target.value)} />
        <button className="btn-primary" onClick={fetchReport} disabled={loading}>{loading?'Cargando…':'Buscar'}</button>
        <button className="btn-secondary" onClick={useDemo} type="button">Demo</button>
      </div>

      {error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-4 overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b">
            <th className="px-3 py-2 text-left">Alumno</th>
            <th className="px-3 py-2 text-left">Correo</th>
            <th className="px-3 py-2 text-left">Curso</th>
            <th className="px-3 py-2 text-left">Fecha</th>
            <th className="px-3 py-2 text-left">Estado</th>
          </tr></thead>
          <tbody>
            {rows.length===0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={5}>Sin datos</td></tr>}
            {rows.map((r,i)=>(
              <tr key={i} className="border-b">
                <td className="px-3 py-2">{r.student_name}</td>
                <td className="px-3 py-2">{r.student_email}</td>
                <td className="px-3 py-2">{r.course_title}</td>
                <td className="px-3 py-2">{r.class_date}</td>
                <td className="px-3 py-2">{r.status}</td>
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
