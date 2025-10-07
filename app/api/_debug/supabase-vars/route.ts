import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (process.env.ALLOW_DEBUG !== '1') {
    return new Response('not_found', { status: 404 })
  }

  const url = new URL(req.url)
  const probe = url.searchParams.get('probe') === '1'

  const envs = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_ANON_KEY: !!(process as any).env?.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
  }

  const resolvedUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) || null
  const resolvedService = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE) || null
  const resolvedAnon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (process as any).env?.SUPABASE_ANON_KEY) || null

  const result: any = {
    ok: true,
    envs,
    resolved: {
      url_present: !!resolvedUrl,
      service_present: !!resolvedService,
      anon_present: !!resolvedAnon,
    },
  }

  if (probe && resolvedUrl && resolvedService) {
    try {
      const fixedUrl = resolvedUrl.startsWith('http') ? resolvedUrl : `https://${resolvedUrl}`
      const db = createClient(fixedUrl, resolvedService, { auth: { persistSession: false, autoRefreshToken: false } })
      const r = await db.from('courses').select('id').limit(1)
      result.probe_service = { error: r.error?.message || null, got: r.data?.length || 0 }
    } catch (e: any) {
      result.probe_service = { fatal: String(e?.message || e) }
    }
  }

  if (probe && resolvedUrl && resolvedAnon) {
    try {
      const fixedUrl = resolvedUrl.startsWith('http') ? resolvedUrl : `https://${resolvedUrl}`
      const db = createClient(fixedUrl, resolvedAnon, { auth: { persistSession: false, autoRefreshToken: false } })
      const r = await db.from('courses').select('id').limit(1)
      result.probe_anon = { error: r.error?.message || null, got: r.data?.length || 0 }
    } catch (e: any) {
      result.probe_anon = { fatal: String(e?.message || e) }
    }
  }

  return NextResponse.json(result)
}

