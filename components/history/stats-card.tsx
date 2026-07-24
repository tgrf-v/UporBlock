import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, XCircle, Clock, Flame, Video, TrendingUp } from 'lucide-react'

interface Stats {
  total_days: number
  completed_days: number
  blocked_days: number
  incomplete_days: number
  completion_rate: number
  total_distraction_seconds: number
  avg_distraction_seconds: number
  current_streak: number
  best_streak: number
  total_submissions: number
  valid_submissions: number
}

function formatSeconds(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs > 0) return `${hrs}j ${mins}m`
  return `${mins}m`
}

function StatItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className={`p-2 rounded-md ${color || 'bg-muted'}`}>
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}

export function StatsCard({ stats }: { stats: Stats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5" />
          Statistik
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatItem
            icon={Calendar}
            label="Total Hari"
            value={stats.total_days}
          />
          <StatItem
            icon={CheckCircle}
            label="Selesai"
            value={`${stats.completed_days} (${stats.completion_rate}%)`}
            color="bg-[var(--live)]/20 text-[var(--live)]"
          />
          <StatItem
            icon={XCircle}
            label="Blocked"
            value={stats.blocked_days}
            color="bg-[var(--alarm)]/20 text-[var(--alarm)]"
          />
          <StatItem
            icon={Clock}
            label="Total Distraksi"
            value={formatSeconds(stats.total_distraction_seconds)}
          />
          <StatItem
            icon={Clock}
            label="Rata-rata/Hari"
            value={formatSeconds(stats.avg_distraction_seconds)}
          />
          <StatItem
            icon={Flame}
            label="Streak Saat Ini"
            value={`${stats.current_streak} hari`}
            color="bg-[var(--signal)]/20 text-[var(--signal)]"
          />
          <StatItem
            icon={Flame}
            label="Best Streak"
            value={`${stats.best_streak} hari`}
            color="bg-[var(--warn)]/20 text-[var(--warn)]"
          />
          <StatItem
            icon={Video}
            label="Video Dikirim"
            value={stats.total_submissions}
          />
          <StatItem
            icon={CheckCircle}
            label="Video Valid"
            value={stats.valid_submissions}
            color="bg-[var(--live)]/20 text-[var(--live)]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
