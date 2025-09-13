// app/instructor/[courseId]/attendance/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'

type Row = { enrollment_id:string; full_name:string; email:string; status:'present'|'absent'|'late' }

export default function InstructorAttendancePage(){
  const { courseId } = useParams<{courseId:string}>()
  const supabase = useMemo(()=>supabaseBrowser(),[])
  const [date, setDate] = useState<string>('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    // Cargar listado de inscritos (placeholder)
    setRows([
      { enrollment_id:'e1', full_name:'Alumno Uno', email:'uno@ejemplo.cl', status:'present' },
      { enrollment_id:'e2', full_name:'Alumno Dos', email:'dos@ejemplo.cl', status:'absent' },
    ])
  },[courseId])

  async function save(){
    setLoading(true); setMsg('')
    try {
      const t = (await supabase.auth.getSession()).data.session?.access_token
      const r = await fetch('/api/instructor/attendance/upsert', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(t?{Authorization:`Bearer ${t}`}:{}) },
        body: JSON.stringify({ courseId, class_date: date, items: rows }),
      })
      if (!r.ok) throw new Error('No se pudo guardar')
      setMsg('Asistencia guardada')
    } catch(e:any){
      setMsg(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  function setStatus(i:number, v:Row['status']){
    setRows(prev => prev.map((r,idx)=> idx===i ? {...r,status:v} : r))
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold" style={{ color:'#1E3A8A' }}>Asistencia · Curso {courseId}</h1>

      <div className="mt-3 flex items-center gap-2">
        <input type="date" className="rounded border px-3 py-2" value={date} onChange={e=>setDate(e.target.value)} />
        <button className="btn-primary" onClick={save} disabled={!date || loading}>{loading?'Guardando…':'Guardar'}</button>
      </div>

      {msg && <div className="mt-3 text-sm text-slate-700">{msg}</div>}

      <div className="mt-4 overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b">
            <th className="px-3 py-2 text-left">Alumno</th>
            <th className="px-3 py-2 text-left">Correo</th>
            <th className="px-3 py-2 text-left">Estado</th>
          </tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={r.enrollment_id} className="border-b">
                <td className="px-3 py-2">{r.full_name}</td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">
                  <select className="rounded border px-2 py-1" value={r.status} onChange={e=>setStatus(i, e.target.value as Row['status'])}>
                    <option value="present">Presente</option>
                    <option value="absent">Ausente</option>
                    <option value="late">Atraso</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
