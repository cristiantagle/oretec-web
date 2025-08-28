import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function isAuthorized(req: Request): boolean {
    const cookieVal = cookies().get('admin_auth')?.value
    if (cookieVal === '1') return true

        const auth = req.headers.get('authorization') || ''
        if (auth && process.env.ADMIN_TOKEN && auth === `Bearer ${process.env.ADMIN_TOKEN}`) return true

            return false
}

export async function POST(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({} as any))
    const id = body?.id as string | undefined
    if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { data, error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
    .select() // devuelve filas borradas

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, deleted: data })
}
