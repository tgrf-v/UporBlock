import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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

  const body = await request.json()
  const { note } = body

  // Get the submission
  const { data: submission, error: fetchError } = await supabase
    .from('video_submissions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !submission) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Submission tidak ditemukan' } },
      { status: 404 }
    )
  }

  if (submission.is_valid) {
    return NextResponse.json(
      { error: { code: 'ALREADY_VALID', message: 'Submission sudah valid' } },
      { status: 400 }
    )
  }

  // Update with manual validation
  const { data: updated, error: updateError } = await supabase
    .from('video_submissions')
    .update({
      is_valid: true,
      verified_method: 'manual',
      verified_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: updateError.message } },
      { status: 500 }
    )
  }

  // Update daily task status
  if (submission.daily_task_id) {
    await supabase
      .from('daily_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        block_active: false,
      })
      .eq('id', submission.daily_task_id)
  }

  return NextResponse.json({
    submission: {
      id: updated.id,
      is_valid: updated.is_valid,
      verified_method: updated.verified_method,
      verified_at: updated.verified_at,
    },
    note: note || 'Divalidasi secara manual',
  })
}
