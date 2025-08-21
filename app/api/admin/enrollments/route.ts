import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function supabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Faltan envs de Supabase')
        return createClient(url, key)
}

export async function GET() {
    try {
        const sb = supabaseAdmin()
        const { data, error } = await sb.from('admin_enrollments_list').select('*')
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
            return NextResponse.json(data ?? [])
    } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? 'Unknown server error' }, { status: 500 })
    }
}
