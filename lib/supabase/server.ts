import { createClient } from '@supabase/supabase-js'

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL en .env.local')
    if (!serviceRole) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en .env.local')

      // Service Role: SOLO en el servidor (rutas /api). Nunca en el cliente.
      return createClient(url, serviceRole, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
}
