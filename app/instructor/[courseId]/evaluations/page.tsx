// app/instructor/[courseId]/evaluations/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'

type Row = { enrollment_id:string; full_name:string; email:string; item_name:string; score:number; max_score:number }

export default function InstructorEvaluationsPage(){
  const { courseId } = useParams<{courseId:string}>()
  const supabase = useMemo(()=>supabaseBrowser(),[])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    // Placeholder de alumnos
    setRows([
      { enrollment_id:'e1', full_name:'Alumno Uno', email:'uno@ejemplo.cl', item_name:'Prueba 1', score:18, max_score:20 },
      { enrollment_id:'e2', full_name:'Alumno Dos', email:'dos@ejemplo.cl', item_name:'Prueba 1', score:12, max_score:20 },
    ])
  },[courseId])

  function setField(i:number, key:keyof Row, val:any){
    setRows(prev => prev.map((r,idx)=> idx===i ? {...r, [key]: val} : r))
  }

  async function save(){
    setLoading(true); setMsg('')
    try {
      const t = (await supabase.auth.getSession()).data.session?.access_token
      const r = await fetch('/api/instructor/evaluations/upsert', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(t?{Authorization:`Bearer ${t}`}:{}) },
        body: JSON.stringify({ courseId, items: rows }),
      })
      if (!r.ok) throw new Error('No se pudo guardar')
      setMsg('Evaluaciones guardadas')
    } catch(e:any){
      setMsg(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold" style={{ color:'#1E3A8A' }}>Evaluaciones · Curso {courseId}</h1>

      <div className="mt-3">
        <button className="btn-primary" onClick={save} disabled={loading}>{loading?'Guardando…':'Guardar'}</button>
      </div>

      {msg && <div className="mt-3 text-sm text-slate-700">{msg}</div>}

      <div className="mt-4 overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b">
            <th className="px-3 py-2 text-left">Alumno</th>
            <th className="px-3 py-2 text-left">Correo</th>
            <th className="px-3 py-2 text-left">Ítem</th>
            <th className="px-3 py-2 text-left">Puntaje</th>
            <th className="px-3 py-2 text-left">Máximo</th>
          </tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={r.enrollment_id} className="border-b">
                <td className="px-3 py-2">{r.full_name}</td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">
                  <input className="w-full rounded border px-2 py-1" value={r.item_name} onChange={e=>setField(i,'item_name', e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <input type="number" className="w-24 rounded border px-2 py-1" value={r.score} onChange={e=>setField(i,'score', Number(e.target.value))} />
                </td>
                <td className="px-3 py-2">
                  <input type="number" className="w-24 rounded border px-2 py-1" value={r.max_score} onChange={e=>setField(i,'max_score', Number(e.target.value))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
