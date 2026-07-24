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

  // Get all daily tasks
  const { data: tasks } = await supabase
    .from('daily_tasks')
    .select('task_date, status, distraction_seconds, completed_at')
    .eq('user_id', user.id)
    .order('task_date', { ascending: false })

  // Get all submissions
  const { data: submissions } = await supabase
    .from('video_submissions')
    .select('id, created_at, is_valid')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const allTasks = tasks || []
  const allSubmissions = submissions || []

  // Calculate stats
  const totalDays = allTasks.length
  const completedDays = allTasks.filter(t => t.status === 'completed').length
  const blockedDays = allTasks.filter(t => t.status === 'blocked').length
  const incompleteDays = allTasks.filter(t => t.status === 'incomplete').length
  const totalDistractionSeconds = allTasks.reduce((sum, t) => sum + t.distraction_seconds, 0)
  const avgDistractionSeconds = totalDays > 0 ? Math.round(totalDistractionSeconds / totalDays) : 0
  const totalSubmissions = allSubmissions.length
  const validSubmissions = allSubmissions.filter(s => s.is_valid).length

  // Calculate current streak (consecutive completed days from today backwards)
  let currentStreak = 0
  let bestStreak = 0
  let tempStreak = 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build a map of dates for quick lookup
  const taskMap = new Map(allTasks.map(t => [t.task_date, t.status]))

  // Check current streak from today backwards
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]

    if (taskMap.get(dateStr) === 'completed') {
      currentStreak++
    } else {
      break
    }
  }

  // Calculate best streak overall
  const sortedDates = allTasks
    .map(t => t.task_date)
    .sort()
    .reverse()

  for (const dateStr of sortedDates) {
    if (taskMap.get(dateStr) === 'completed') {
      tempStreak++
      bestStreak = Math.max(bestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  // Get last 30 days of data for chart
  const last30Days = []
  for (let i = 29; i >= 0; i--) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    const task = allTasks.find(t => t.task_date === dateStr)

    last30Days.push({
      date: dateStr,
      distraction_seconds: task?.distraction_seconds || 0,
      status: task?.status || 'no_data',
    })
  }

  return NextResponse.json({
    stats: {
      total_days: totalDays,
      completed_days: completedDays,
      blocked_days: blockedDays,
      incomplete_days: incompleteDays,
      completion_rate: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
      total_distraction_seconds: totalDistractionSeconds,
      avg_distraction_seconds: avgDistractionSeconds,
      current_streak: currentStreak,
      best_streak: bestStreak,
      total_submissions: totalSubmissions,
      valid_submissions: validSubmissions,
    },
    chart_data: last30Days,
  })
}
