'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Video, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

interface Submission {
  id: string
  platform: string
  original_url: string
  normalized_url: string
  title: string | null
  is_valid: boolean
  verified_method: string
  rejection_reason: string | null
  created_at: string
}

export function SubmissionsList() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const params = new URLSearchParams({
        type: 'submissions',
        page: page.toString(),
        limit: '10',
      })
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/history?${params}`)
      const data = await res.json()

      if (!cancelled && res.ok) {
        setSubmissions(data.items)
        setHasMore(data.has_more)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page, statusFilter])

  const getStatusBadge = (submission: Submission) => {
    if (submission.is_valid) {
      return (
        <Badge variant="default" className="bg-[var(--live)]">
          <CheckCircle className="size-3 mr-1" />
          Valid
        </Badge>
      )
    }
    if (submission.verified_method === 'manual') {
      return (
        <Badge variant="secondary">
          <Clock className="size-3 mr-1" />
          Pending
        </Badge>
      )
    }
    return (
      <Badge variant="destructive">
        <XCircle className="size-3 mr-1" />
        Invalid
      </Badge>
    )
  }

  const getPlatformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      youtube: 'bg-red-100 text-red-700',
      tiktok: 'bg-gray-100 text-gray-700',
      instagram: 'bg-pink-100 text-pink-700',
    }
    return (
      <Badge variant="outline" className={colors[platform] || ''}>
        {platform}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="size-5" />
            Riwayat Video
          </CardTitle>
          <div className="flex gap-2">
            {['all', 'valid', 'invalid'].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatusFilter(s)
                  setPage(1)
                }}
              >
                {s === 'all' ? 'Semua' : s === 'valid' ? 'Valid' : 'Invalid'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Belum ada video yang dikirim</div>
        ) : (
          <>
            <div className="space-y-2">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusBadge(submission)}
                    <div>
                      <p className="font-medium">{submission.title || 'Video'}</p>
                      <p className="text-sm text-muted-foreground font-mono truncate max-w-md">
                        {submission.original_url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPlatformBadge(submission.platform)}
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(submission.created_at).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {submission.verified_method === 'youtube_api' ? 'Auto' : 'Manual'}
                      </p>
                    </div>
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
