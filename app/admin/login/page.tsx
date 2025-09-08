"use client"
import { useEffect, useState } from "react";

export default function AdminLoginPage() {
    const [token, setToken] = useState("");
    const [error, setError] = useState<string|null>(null);
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetch("/api/admin/login").finally(() => setReady(true)); }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault(); setError(null); setLoading(true);
        try {
            const res = await fetch("/api/admin/login", {
                method:"POST", headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({ token }),
            });
            if (res.ok) { window.location.href = "/admin"; return; }
            const data = await res.json().catch(()=>({}));
            setError(data?.error ?? "Error de autenticación");
        } catch { setError("No se pudo conectar con el servidor"); }
        finally { setLoading(false); }
    }

    return (
        <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
        <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow">
        <h1 className="text-lg font-semibold">Acceso administrador</h1>
        {!ready ? <p className="mt-2 text-sm text-slate-500">Cargando…</p> : (
            <>
            <p className="mt-1 text-sm text-slate-500">Ingresa tu token de administrador.</p>
            <input type="password" value={token} onChange={(e)=>setToken(e.target.value)}
            placeholder="ADMIN_TOKEN" className="mt-4 w-full rounded-lg border p-2" />
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
            <button type="submit" disabled={loading} className="mt-4 w-full rounded-lg bg-slate-900 p-2 text-white disabled:opacity-60">
            {loading ? "Verificando..." : "Entrar"}
            </button>
            </>
        )}
        </form>
        </div>
    );
}
