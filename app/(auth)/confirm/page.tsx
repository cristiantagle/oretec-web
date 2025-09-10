'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function ConfirmPage() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = supabaseBrowser()
  const [msg, setMsg] = useState('Confirmando tu cuenta…')

  useEffect(() => {
    (async () => {
      try {
        const token = params.get('access_token')
        if (!token) {
          setMsg('Token no encontrado en la URL.')
          return
        }
        // Supabase guarda sesión automáticamente si detecta el token
        await supabase.auth.getSession()
        setMsg('Cuenta confirmada. Redirigiendo…')
        setTimeout(() => router.replace('/dashboard'), 1500)
      } catch (e: any) {
        setMsg('Error al confirmar: ' + (e?.message ?? String(e)))
      }
    })()
  }, [params, router, supabase])

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-xl border bg-white p-6 shadow text-center">
        {msg}
      </div>
    </main>
  )
}
