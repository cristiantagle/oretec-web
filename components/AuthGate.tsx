'use client'

// Redirige a /login si no hay sesión activa. Minimal e independiente.
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/browser'

export default function AuthGate() {
  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const supabase = supabaseBrowser()
        const { data } = await supabase.auth.getSession()
        const haySesion = !!data?.session
        if (!haySesion && vivo) {
          const ret = encodeURIComponent(pathname || '/dashboard')
          router.replace('/login?next=' + ret)
        }
      } catch (_) { /* no-op */ }
    })()
    return () => { vivo = false }
  }, [router, pathname])
  return null
}
