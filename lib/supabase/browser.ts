import { createClient } from '@supabase/supabase-js'

export function supabaseBrowser() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url) throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL')
        if (!anon) throw new Error('Falta NEXT_PUBLIC_SUPABASE_ANON_KEY')
            return createClient(url, anon, { auth: { persistSession: false } })
}
