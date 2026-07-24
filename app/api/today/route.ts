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

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get today's task
  const { data: task } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('task_date', { ascending: false })
    .limit(1)
    .single()

  // Get latest submission
  const { data: latestSubmission } = await supabase
    .from('video_submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const thresholdSeconds = (profile?.distraction_threshold_minutes || 30) * 60

  return NextResponse.json({
    task: task
      ? {
          id: task.id,
          task_date: task.task_date,
          status: task.status,
          distraction_seconds: task.distraction_seconds,
          block_active: task.block_active,
          threshold_seconds: thresholdSeconds,
          completed_at: task.completed_at,
        }
      : null,
    latest_submission: latestSubmission
      ? {
          id: latestSubmission.id,
          platform: latestSubmission.platform,
          normalized_url: latestSubmission.normalized_url,
          verified_method: latestSubmission.verified_method,
          is_valid: latestSubmission.is_valid,
          created_at: latestSubmission.created_at,
        }
      : null,
  })
}
