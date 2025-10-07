import { createClient } from '@supabase/supabase-js'

function normalizeUrl(input?: string | null): string | null {
  if (!input) return null
  const s = input.trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

export function supabaseServer() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const url = normalizeUrl(rawUrl)
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

  if (!url) throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL (o SUPABASE_URL) en variables de entorno')
  if (!serviceRole) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en variables de entorno')

  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
