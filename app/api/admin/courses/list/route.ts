import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const admin = cookies().get('admin_auth')?.value === '1'
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

            const supabase = supabaseServer()
            const { data, error } = await supabase
            .from('courses')
            .select('id, code, slug, title, description, price_cents, hours, level, mp_link, published')
            .order('title', { ascending: true })

            if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 })

                return new NextResponse(JSON.stringify(data ?? []), {
                    status: 200,
                    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
                })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
    }
}
