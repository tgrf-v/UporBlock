import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: { code: 'DATABASE_ERROR', message: error.message } },
      { status: 500 }
    )
  }

  return NextResponse.json({ settings: data })
}

export async function PUT(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const body = await request.json()

  const { error } = await supabase
    .from('profiles')
    .update({
      timezone: body.timezone,
      daily_reset_time: body.daily_reset_time,
      distraction_threshold_minutes: body.distraction_threshold_minutes,
      upload_validity_hours: body.upload_validity_hours,
      block_mode: body.block_mode,
      manual_verification_allowed: body.manual_verification_allowed,
      strict_youtube_only: body.strict_youtube_only,
      require_shorts: body.require_shorts,
      max_shorts_duration_seconds: body.max_shorts_duration_seconds,
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json(
      { error: { code: 'DATABASE_ERROR', message: error.message } },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
