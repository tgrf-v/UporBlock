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

  // Check if token is expired
  if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
    return null
  }

  // Update last_used_at
  await admin
    .from('extension_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', tokenData.id)

  return tokenData.user_id
}

export async function GET(request: Request) {
  const userId = await authenticateExtension(request)

  if (!userId) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
      { status: 401 }
    )
  }

  const admin = createAdminClient()

  // Get profile
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Get or create today's task
  const { data: existingTask } = await admin
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('task_date', { ascending: false })
    .limit(1)
    .single()

  let task = existingTask

  if (!task) {
    // Create new task for today
    const { data: newTask } = await admin
      .from('daily_tasks')
      .insert({
        user_id: userId,
        task_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    task = newTask
  }

  // Get blocked sites
  const { data: blockedSites } = await admin
    .from('blocked_sites')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('priority', { ascending: true })

  // Get allowlists
  const { data: allowlists } = await admin
    .from('upload_allowlists')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('priority', { ascending: true })

  // Calculate threshold in seconds
  const thresholdSeconds = (profile?.distraction_threshold_minutes || 30) * 60

  return NextResponse.json({
    user_id: userId,
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
    settings: {
      timezone: profile?.timezone || 'Asia/Jakarta',
      daily_reset_time: profile?.daily_reset_time || '04:00',
      distraction_threshold_minutes: profile?.distraction_threshold_minutes || 30,
      upload_validity_hours: profile?.upload_validity_hours || 3,
      block_mode: profile?.block_mode || 'block_after_threshold',
      manual_verification_allowed: profile?.manual_verification_allowed ?? true,
      strict_youtube_only: profile?.strict_youtube_only ?? false,
    },
    blocked_sites: blockedSites || [],
    upload_allowlists: allowlists || [],
    rules_version: new Date().toISOString(),
  })
}
