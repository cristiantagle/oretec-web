import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  const supabase = supabaseServer()
  const { data, error } = await supabase
    .from('courses')
    .select('id, code, title')
    .eq('published', true)
    .order('code')
  if (error) return NextResponse.json([])
  return NextResponse.json(data)
}
