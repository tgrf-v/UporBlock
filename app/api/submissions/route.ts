import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeYouTubeUrl, extractVideoId, getVideoMetadata, validateVideo } from '@/lib/youtube'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const { data: submissions, error } = await supabase
    .from('video_submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    )
  }

  return NextResponse.json({ submissions })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const body = await request.json()
  const { url } = body

  if (!url || typeof url !== 'string') {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'URL wajib diisi' } },
      { status: 400 }
    )
  }

  const videoId = extractVideoId(url)
  if (!videoId) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'URL YouTube tidak valid' } },
      { status: 400 }
    )
  }

  const normalizedUrl = normalizeYouTubeUrl(url)
  if (!normalizedUrl) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Gagal menormalisasi URL' } },
      { status: 400 }
    )
  }

  // Get today's date in user timezone (simplified: use UTC)
  const today = new Date().toISOString().split('T')[0]

  // Check if user already has a valid submission today
  const { data: existingSubmission } = await supabase
    .from('video_submissions')
    .select('id')
    .eq('user_id', user.id)
    .eq('task_date', today)
    .eq('is_valid', true)
    .single()

  if (existingSubmission) {
    return NextResponse.json(
      { error: { code: 'DUPLICATE', message: 'Kamu sudah mengirim video valid hari ini' } },
      { status: 409 }
    )
  }

  // Check if this video URL was already used
  const { data: usedUrl } = await supabase
    .from('video_submissions')
    .select('id')
    .eq('user_id', user.id)
    .eq('normalized_url', normalizedUrl)
    .single()

  if (usedUrl) {
    return NextResponse.json(
      { error: { code: 'DUPLICATE', message: 'Video ini sudah pernah digunakan' } },
      { status: 409 }
    )
  }

  // Get video metadata from YouTube
  let videoMetadata = null
  let verifiedMethod = 'manual'
  let isValid = false
  let rejectionReason = null

  try {
    const metadata = await getVideoMetadata(videoId)
    if (!metadata) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Video tidak ditemukan' } },
        { status: 404 }
      )
    }

    videoMetadata = metadata

    const validation = validateVideo(metadata)
    if (validation.valid) {
      isValid = true
      verifiedMethod = 'youtube_api'
    } else {
      rejectionReason = validation.reason
    }
  } catch {
    // YouTube API failed, fall back to manual validation
    verifiedMethod = 'manual'
  }

  // Get today's task
  const { data: task } = await supabase
    .from('daily_tasks')
    .select('id')
    .eq('user_id', user.id)
    .eq('task_date', today)
    .single()

  // Create submission
  const { data: submission, error } = await supabase
    .from('video_submissions')
    .insert({
      user_id: user.id,
      task_date: today,
      daily_task_id: task?.id || null,
      platform: 'youtube',
      original_url: url,
      normalized_url: normalizedUrl,
      external_video_id: videoId,
      title: videoMetadata?.title || null,
      privacy_status: videoMetadata?.privacyStatus || null,
      duration_seconds: videoMetadata?.duration || null,
      published_at: videoMetadata?.publishedAt || null,
      verified_at: isValid ? new Date().toISOString() : null,
      verified_method: verifiedMethod,
      is_valid: isValid,
      rejection_reason: rejectionReason,
      raw_metadata: videoMetadata || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    )
  }

  // If valid, update daily_tasks status to completed
  if (isValid && task) {
    await supabase
      .from('daily_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        block_active: false,
      })
      .eq('id', task.id)
  }

  return NextResponse.json({
    submission: {
      id: submission.id,
      platform: submission.platform,
      original_url: submission.original_url,
      normalized_url: submission.normalized_url,
      title: submission.title,
      is_valid: submission.is_valid,
      verified_method: submission.verified_method,
      rejection_reason: submission.rejection_reason,
      created_at: submission.created_at,
    },
  })
}
