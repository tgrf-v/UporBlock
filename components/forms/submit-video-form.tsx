'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Video, CheckCircle, XCircle, Clock } from 'lucide-react'

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

export function SubmitVideoForm({ submissions }: { submissions: Submission[] }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submissionsList, setSubmissionsList] = useState(submissions)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error?.message || 'Gagal mengirim video')
      setLoading(false)
      return
    }

    const submission = data.submission

    if (submission.is_valid) {
      setSuccess('Video berhasil diverifikasi! Status hari ini: Completed')
    } else if (submission.verified_method === 'manual') {
      setSuccess('Video berhasil dikirim. Menunggu validasi manual.')
    } else {
      setSuccess('Video berhasil dikirim.')
    }

    setSubmissionsList([submission, ...submissionsList])
    setUrl('')
    setLoading(false)
    router.refresh()
  }

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="size-5" />
            Kirim Video Produktif
          </CardTitle>
          <CardDescription>
            Kirim link YouTube video produktif untuk membuka akses
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL YouTube</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <p className="text-sm text-muted-foreground">
                Video harus public/unlisted, minimal 30 detik, dan dipublish dalam 24 jam terakhir
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Video'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Submission</CardTitle>
          <CardDescription>{submissionsList.length} video terkirim</CardDescription>
        </CardHeader>
        <CardContent>
          {submissionsList.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Belum ada video yang dikirim
            </p>
          ) : (
            <div className="space-y-2">
              {submissionsList.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusBadge(submission)}
                    <div>
                      <p className="font-medium">{submission.title || 'Video YouTube'}</p>
                      <p className="text-sm text-muted-foreground font-mono truncate max-w-md">
                        {submission.original_url}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(submission.created_at).toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submission.verified_method === 'youtube_api' ? 'Auto' : 'Manual'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
