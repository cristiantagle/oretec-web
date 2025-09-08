"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginForm() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>('')
    const router = useRouter()
    const params = useSearchParams()
    const next = params.get('next') || '/admin'

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const resp = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, next }),
            })
            if (!resp.ok) {
                const j = await resp.json().catch(() => ({}))
                throw new Error(j?.error || 'Error de autenticación')
            }
            const j = await resp.json()
            router.push(j?.next || '/admin')
        } catch (err: any) {
            setError(err.message || 'Error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border p-6">
        <h1 className="text-xl font-bold mb-4" style={{ color: '#1E3A8A' }}>
        Ingreso Admin
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">
        <div>
        <label className="text-sm text-gray-600">Contraseña</label>
        <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-1 w-full border rounded-xl px-3 py-2"
        placeholder="Ingresa tu contraseña"
        required
        />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl px-3 py-2 text-white"
        style={{ background: '#1E3A8A', opacity: loading ? 0.7 : 1 }}
        >
        {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
        </form>
        </div>
        </main>
    )
}
