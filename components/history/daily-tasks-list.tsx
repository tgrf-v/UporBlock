'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

interface DailyTask {
  id: string
  task_date: string
  status: string
  distraction_seconds: number
  block_active: boolean
  completed_at: string | null
  created_at: string
}

export function DailyTasksList() {
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const params = new URLSearchParams({
        type: 'tasks',
        page: page.toString(),
        limit: '10',
      })
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/history?${params}`)
      const data = await res.json()

      if (!cancelled && res.ok) {
        setTasks(data.items)
        setHasMore(data.has_more)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-[var(--live)]">
            <CheckCircle className="size-3 mr-1" />
            Selesai
          </Badge>
        )
      case 'blocked':
        return (
          <Badge variant="destructive">
            <XCircle className="size-3 mr-1" />
            Blocked
          </Badge>
        )
      case 'warning':
        return (
          <Badge variant="secondary" className="bg-[var(--warn)]">
            <Clock className="size-3 mr-1" />
            Warning
          </Badge>
        )
      default:
        return <Badge variant="outline">Incomplete</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Riwayat Harian
          </CardTitle>
          <div className="flex gap-2">
            {['all', 'completed', 'blocked', 'incomplete'].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatusFilter(s)
                  setPage(1)
                }}
              >
                {s === 'all' ? 'Semua' : s === 'completed' ? 'Selesai' : s === 'blocked' ? 'Blocked' : 'Incomplete'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada riwayat</div>
        ) : (
          <>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    {getStatusBadge(task.status)}
                    <div>
                      <p className="font-medium">{formatDate(task.task_date)}</p>
                      <p className="text-sm text-muted-foreground">
                        Distraksi: {formatTime(task.distraction_seconds)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {task.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Selesai: {new Date(task.completed_at).toLocaleTimeString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="size-4" />
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">Halaman {page}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => setPage(page + 1)}
              >
                Selanjutnya
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
