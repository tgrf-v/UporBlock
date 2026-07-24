import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'crypto'

async function authenticateExtension(request: Request) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)

  if (!token.startsWith('upb_')) {
    return null
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')

  const admin = createAdminClient()

  const { data: tokenData, error } = await admin
    .from('extension_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .is('revoked_at', null)
    .single()

  if (error || !tokenData) {
    return null
  }

  if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
    return null
  }

  await admin
    .from('extension_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', tokenData.id)

  return tokenData.user_id
}

export async function POST(request: Request) {
  const userId = await authenticateExtension(request)

  if (!userId) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
      { status: 401 }
    )
  }

  const body = await request.json()
  const { events } = body

  if (!events || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Events harus diisi' } },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Get profile for task date calculation
  const { data: profile } = await admin
    .from('profiles')
    .select('timezone, daily_reset_time, distraction_threshold_minutes')
    .eq('id', userId)
    .single()

  // Calculate task date
  const timezone = profile?.timezone || 'UTC'
  const resetTime = profile?.daily_reset_time || '04:00'

  const now = new Date()
  const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  const [resetHours, resetMinutes] = resetTime.split(':').map(Number)
  const resetDate = new Date(localTime)
  resetDate.setHours(resetHours, resetMinutes, 0, 0)

  let taskDate: string
  if (localTime < resetDate) {
    const yesterday = new Date(localTime)
    yesterday.setDate(yesterday.getDate() - 1)
    taskDate = yesterday.toISOString().split('T')[0]
  } else {
    taskDate = localTime.toISOString().split('T')[0]
  }

  // Insert events
  for (const event of events) {
    await admin
      .from('distraction_events')
      .insert({
        user_id: userId,
        task_date: taskDate,
        client_event_id: event.client_event_id,
        host: event.host,
        url_normalized: event.url_normalized,
        pattern_matched: event.pattern_matched,
        started_at: event.started_at,
        ended_at: event.ended_at,
        duration_seconds: event.duration_seconds,
      })
      .select()
      .single()
  }

  // Get updated task
  const { data: task } = await admin
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('task_date', taskDate)
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
    enforce: task?.block_active || false,
  })
}
