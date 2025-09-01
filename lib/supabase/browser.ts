'use client'

import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase para el navegador con sesión persistente.
 * - Usa las env públicas (URL + ANON)
 * - autoRefreshToken habilitado
 * - persistSession habilitado (localStorage)
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
    throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnon) {
    throw new Error('Falta NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/** Singleton del cliente para evitar múltiples instancias */
export const supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
})

export function supabaseBrowser() {
    return supabase
}
