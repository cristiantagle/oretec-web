'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';

type UserRow = {
  id: string;
  full_name: string | null;
  rut: string | null;
  email: string | null;
  company_name: string | null;
  account_type: string | null;
  phone: string | null;
  updated_at: string | null;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const params = useSearchParams();
  const sb = supabaseBrowser();

  const [items, setItems] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number>(parseInt(params.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState<number>(parseInt(params.get('ps') || '20', 10));
  const [search, setSearch] = useState<string>(params.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');
  const abortRef = useRef(new AbortController());

  useEffect(() => {
    abortRef.current = new AbortController();
    (async () => {
      setErr('');
      setLoading(true);
      try {
        const { data: s } = await sb.auth.getSession();
        const token = s?.session?.access_token || '';
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (search.trim()) params.set('search', search.trim());

        const r = await fetch(`/api/admin/users/list?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',            // <<--- manda cookie admin_auth=1
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
          signal: abortRef.current.signal,
        });

        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          setErr(j?.error || `error_${r.status}`);
          setItems([]); setTotal(0);
          return;
        }
        const j = await r.json();
        setItems(j.items || []);
        setTotal(j.total || 0);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setErr(e?.message || 'error');
      } finally {
        setLoading(false);
      }
    })();

    return () => abortRef.current.abort();
  }, [page, pageSize, search, sb]);

  const setRole = async (id: string, makeAdmin: boolean) => {
    setErr('');
    try {
      const r = await fetch('/api/admin/users/set-role', {
        method: 'POST',
        credentials: 'include', // cookie superadmin
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, role: makeAdmin ? 'admin' : 'user' }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || `error_${r.status}`);
      }
      // refrescar lista
      const u = new URL(location.href);
      router.replace(u.toString());
    } catch (e: any) {
      setErr(e?.message || 'error');
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4" style={{color:'#1E3A8A'}}>Administración de Usuarios</h1>

      <div className="flex items-center gap-2 mb-3">
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Buscar por nombre, RUT, email o empresa…"
          className="border rounded px-2 py-1 grow"
        />
        <select value={pageSize} onChange={(e)=>setPageSize(parseInt(e.target.value,10))}
          className="border rounded px-2 py-1">
          <option value="10">10</option><option value="20">20</option><option value="50">50</option>
        </select>
        <button className="btn-secondary" onClick={()=>setPage(1)}>Buscar</button>
        <button className="btn-secondary" onClick={()=>{ setSearch(''); setPage(1); }}>Limpiar</button>
      </div>

      {err && <div className="mb-3 rounded border border-red-200 bg-red-50 text-red-700 p-2 text-sm">{err}</div>}

      <div className="overflow-auto">
        <table className="min-w-full border rounded">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-2 py-1 text-left">Nombre</th>
              <th className="px-2 py-1 text-left">RUT</th>
              <th className="px-2 py-1 text-left">Correo</th>
              <th className="px-2 py-1 text-left">Empresa</th>
              <th className="px-2 py-1 text-left">Rol</th>
              <th className="px-2 py-1 text-left">Teléfono</th>
              <th className="px-2 py-1 text-left">Actualizado</th>
              <th className="px-2 py-1 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td className="px-2 py-2" colSpan={8}>Sin resultados.</td></tr>
            ) : items.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-2 py-1">{u.full_name || '-'}</td>
                <td className="px-2 py-1">{u.rut || '-'}</td>
                <td className="px-2 py-1">{u.email || '-'}</td>
                <td className="px-2 py-1">{u.company_name || '-'}</td>
                <td className="px-2 py-1">{u.account_type || '-'}</td>
                <td className="px-2 py-1">{u.phone || '-'}</td>
                <td className="px-2 py-1">{u.updated_at ? new Date(u.updated_at).toLocaleString() : '-'}</td>
                <td className="px-2 py-1">
                  <div className="flex gap-1">
                    <button className="btn-secondary" onClick={()=>setRole(u.id, true)}>Hacer Admin</button>
                    <button className="btn-secondary" onClick={()=>setRole(u.id, false)}>Hacer Usuario</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button className="btn-secondary" disabled={page<=1 || loading} onClick={()=>setPage(p=>Math.max(1,p-1))}>←</button>
        <span>Página {page}</span>
        <button className="btn-secondary" disabled={loading || items.length < pageSize} onClick={()=>setPage(p=>p+1)}>→</button>
      </div>
    </main>
  );
}
