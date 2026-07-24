import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const { data: submission, error } = await supabase
    .from('video_submissions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !submission) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Submission tidak ditemukan' } },
      { status: 404 }
    )
  }

  return NextResponse.json({
    submission: {
      id: submission.id,
      platform: submission.platform,
      original_url: submission.original_url,
      normalized_url: submission.normalized_url,
      title: submission.title,
      privacy_status: submission.privacy_status,
      duration_seconds: submission.duration_seconds,
      published_at: submission.published_at,
      is_valid: submission.is_valid,
      verified_method: submission.verified_method,
      rejection_reason: submission.rejection_reason,
      created_at: submission.created_at,
    },
  })
}
