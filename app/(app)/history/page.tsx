import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCard } from '@/components/history/stats-card'
import { DailyTasksList } from '@/components/history/daily-tasks-list'
import { SubmissionsList } from '@/components/history/submissions-list'

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: tasks } = await supabase
    .from('daily_tasks')
    .select('task_date, status, distraction_seconds, completed_at')
    .eq('user_id', user.id)
    .order('task_date', { ascending: false })

  const { data: submissions } = await supabase
    .from('video_submissions')
    .select('id, created_at, is_valid')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const allTasks = tasks || []
  const allSubmissions = submissions || []

  const totalDays = allTasks.length
  const completedDays = allTasks.filter(t => t.status === 'completed').length
  const blockedDays = allTasks.filter(t => t.status === 'blocked').length
  const incompleteDays = allTasks.filter(t => t.status === 'incomplete').length
  const totalDistractionSeconds = allTasks.reduce((sum, t) => sum + t.distraction_seconds, 0)
  const avgDistractionSeconds = totalDays > 0 ? Math.round(totalDistractionSeconds / totalDays) : 0
  const totalSubmissions = allSubmissions.length
  const validSubmissions = allSubmissions.filter(s => s.is_valid).length

  let currentStreak = 0
  let bestStreak = 0
  let tempStreak = 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const taskMap = new Map(allTasks.map(t => [t.task_date, t.status]))

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

  const stats = {
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
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Riwayat</h1>
        <p className="text-muted-foreground">Statistik dan riwayat aktivitas kamu</p>
      </div>

      <div className="max-w-4xl space-y-6">
        <StatsCard stats={stats} />
        <DailyTasksList />
        <SubmissionsList />
      </div>
    </div>
  )
}
