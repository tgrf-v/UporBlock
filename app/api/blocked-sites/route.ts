import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const body = await request.json()

  const { label, pattern, pattern_type } = body

  if (!label || !pattern) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Label dan pattern harus diisi' } },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('blocked_sites')
    .insert({
      user_id: user.id,
      label,
      pattern,
      pattern_type: pattern_type || 'wildcard',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: { code: 'DATABASE_ERROR', message: error.message } },
      { status: 500 }
    )
  }

  return NextResponse.json({ site: data })
}
