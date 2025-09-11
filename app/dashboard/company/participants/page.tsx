// app/dashboard/company/participants/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';
import CompanyParticipantsHelp from '@/components/CompanyParticipantsHelp';

type Course = {
  id: string;
  code?: string | null;
  slug?: string | null;
  title: string;
  published?: boolean | null;
};

type Row = {
  full_name: string;
  email: string;
  rut?: string;
  phone?: string;
};

function b64(data: any) {
  try { return typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(JSON.stringify(data)))) : ''; }
  catch { return ''; }
}

export default function CompanyParticipantsPage(){
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [meName, setMeName] = useState<string>('');
  const [meType, setMeType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<string>('');
  const [rows, setRows] = useState<Row[]>([{ full_name: '', email: '' }]);
  const [error, setError] = useState<string>('');
  const savingRef = useRef(false);

  // Cargar identidad y validar que sea empresa
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (!token) { router.replace('/login'); return; }

        // Traer perfil
        const r = await fetch('/api/profile/get', { headers: { Authorization: `Bearer ${token}` }, cache:'no-store' });
        if (r.status === 401) { router.replace('/login'); return; }
        if (!r.ok) { setError('No se pudo obtener el perfil'); return; }
        const p = await r.json();
        setMeName(p?.full_name || '');
        setMeType(p?.account_type || '');

        if (String(p?.account_type||'').toLowerCase() !== 'company') {
          setError('Esta vista es exclusiva para cuentas de tipo Empresa.');
          return;
        }

        // Traer cursos publicados
        const rc = await fetch('/api/public/courses', { cache:'no-store' });
        const jc = rc.ok ? await rc.json() : [];
        const list: Course[] = Array.isArray(jc) ? jc
          .filter((c:any)=> c?.published !== false)
          .map((c:any)=>({ id: String(c.id ?? c.code ?? c.slug ?? ''), code:c.code??null, slug:c.slug??null, title: String(c.title ?? c.name ?? 'Curso') , published: c.published })) : [];
        setCourses(list);
        if (list.length && !courseId) setCourseId(list[0].id);

        // Cargar borrador si existe
        try {
          const draftRaw = localStorage.getItem('company_participants_draft');
          if (draftRaw) {
            const draft = JSON.parse(draftRaw);
            if (Array.isArray(draft?.rows) && draft.rows.length) setRows(draft.rows);
            if (draft?.courseId && typeof draft.courseId === 'string') setCourseId(draft.courseId);
          }
        } catch {}
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar borrador
  useEffect(() => {
    if (loading) return;
    if (savingRef.current) return;
    const payload = { courseId, rows };
    try { localStorage.setItem('company_participants_draft', JSON.stringify(payload)); } catch {}
  }, [courseId, rows, loading]);

  function addRow(){ setRows(prev => [...prev, { full_name:'', email:'' }]); }
  function delRow(idx:number){ setRows(prev => prev.filter((_,i)=> i!==idx)); }
  function setField(idx:number, key:keyof Row, val:string){
    setRows(prev => prev.map((r,i)=> i===idx ? { ...r, [key]: val } : r));
  }

  function validate(): string | null {
    if (!courseId) return 'Selecciona un curso';
    const cleaned = rows.map(r => ({
      ...r,
      full_name: (r.full_name||'').trim(),
      email: (r.email||'').trim().toLowerCase(),
      rut: (r.rut||'').trim(),
      phone: (r.phone||'').trim(),
    }));
    if (!cleaned.length) return 'Agrega al menos un participante';
    for (const [i,r] of cleaned.entries()){
      if (!r.full_name) return `Falta nombre en fila ${i+1}`;
      if (!r.email) return `Falta correo en fila ${i+1}`;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) return `Correo inválido en fila ${i+1}`;
    }
    const emails = cleaned.map(r=>r.email);
    const dup = emails.find((e,i)=> emails.indexOf(e)!==i);
    if (dup) return `Correo duplicado: ${dup}`;
    return null;
  }

  function goToCheckout(){
    setError('');
    const v = validate();
    if (v) { setError(v); return; }

    // Encontrar slug del curso (o code) para enviar a su página
    const c = courses.find(c => c.id === courseId);
    const slug = c?.slug || c?.code || c?.id;

    // Codificar participantes en la URL
    const payload = { courseId, participants: rows };
    const q = new URLSearchParams({ participants: b64(payload) }).toString();

    router.push(`/courses/${encodeURIComponent(String(slug))}?${q}`);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-xl border p-4">Cargando…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        <Link href="/dashboard" className="btn-secondary">← Volver</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color:'#1E3A8A' }}>Participantes de Empresa</h1>
        <Link href="/dashboard" className="btn-secondary">← Volver</Link>
      </div>

      <section className="card shadow-soft p-5 grid gap-4">
        <div className="text-sm text-slate-600">
          <div><span className="text-slate-500">Empresa:</span> <span className="font-medium">{meName || '-'}</span></div>
          <div><span className="text-slate-500">Tipo de cuenta:</span> <span className="font-medium">{meType || '-'}</span></div>
        </div>

        <div className="grid gap-1">
          <label className="text-sm text-slate-700">Curso</label>
          <select
            className="rounded border px-3 py-2"
            value={courseId}
            onChange={e=> setCourseId(e.target.value)}
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="mt-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-medium">Participantes</div>
            <button type="button" className="btn-secondary" onClick={addRow}>+ Agregar</button>
          </div>

          <div className="rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-slate-50">
                  <th className="py-2 px-3">Nombre completo</th>
                  <th className="py-2 px-3">Correo</th>
                  <th className="py-2 px-3">RUT</th>
                  <th className="py-2 px-3">Teléfono</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r,idx)=>(
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-3">
                      <input className="rounded border px-2 py-1 w-full"
                        value={r.full_name}
                        onChange={e=>setField(idx,'full_name', e.target.value)}
                        placeholder="Ej: Ana Pérez"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input className="rounded border px-2 py-1 w-full"
                        value={r.email}
                        onChange={e=>setField(idx,'email', e.target.value)}
                        placeholder="nombre@empresa.cl"
                        type="email"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input className="rounded border px-2 py-1 w-full"
                        value={r.rut || ''}
                        onChange={e=>setField(idx,'rut', e.target.value)}
                        placeholder="12.345.678-9"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input className="rounded border px-2 py-1 w-full"
                        value={r.phone || ''}
                        onChange={e=>setField(idx,'phone', e.target.value)}
                        placeholder="+56 9 1234 5678"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button className="btn-secondary" onClick={()=>delRow(idx)} title="Eliminar fila">Eliminar</button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td className="py-6 px-3 text-center text-slate-500" colSpan={5}>Sin participantes. Agrega con “+ Agregar”.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <CompanyParticipantsHelp />

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Los datos se guardan como borrador en este navegador.
          </div>
          <button type="button" className="btn-primary" onClick={goToCheckout}>
            Continuar a compra
          </button>
        </div>
      </section>
    </main>
  );
}
