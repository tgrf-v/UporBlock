import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'tasks'
  const status = searchParams.get('status') || 'all'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const offset = (page - 1) * limit

  if (type === 'tasks') {
    let query = supabase
      .from('daily_tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, count, error } = await query
      .order('task_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      items: data,
      total: count,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    })
  }

  if (type === 'submissions') {
    let query = supabase
      .from('video_submissions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    if (status === 'valid') {
      query = query.eq('is_valid', true)
    } else if (status === 'invalid') {
      query = query.eq('is_valid', false)
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      items: data,
      total: count,
      page,
      limit,
      has_more: (count || 0) > offset + limit,
    })
  }

  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message: 'Invalid type parameter' } },
    { status: 400 }
  )
}
