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
  const { block_active, status } = body

  const admin = createAdminClient()

  // Get current task
  const { data: task } = await admin
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('task_date', { ascending: false })
    .limit(1)
    .single()

  if (!task) {
    return NextResponse.json(
      { error: { code: 'TASK_NOT_FOUND', message: 'Task tidak ditemukan' } },
      { status: 404 }
    )
  }

  // Update task
  const { error } = await admin
    .from('daily_tasks')
    .update({
      block_active: block_active,
      status: status || task.status,
    })
    .eq('id', task.id)

  if (error) {
    return NextResponse.json(
      { error: { code: 'DATABASE_ERROR', message: error.message } },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    task: {
      status: status || task.status,
      block_active: block_active,
    },
  })
}
