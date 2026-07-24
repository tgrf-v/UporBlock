'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save } from 'lucide-react'

interface Profile {
  id: string
  timezone: string
  daily_reset_time: string
  distraction_threshold_minutes: number
  upload_validity_hours: number
  idle_timeout_minutes: number
  block_mode: string
  manual_verification_allowed: boolean
  strict_youtube_only: boolean
  require_shorts: boolean
  max_shorts_duration_seconds: number | null
}

export function SettingsForm({ profile }: { profile: Profile }) {
  const [formData, setFormData] = useState({
    timezone: profile.timezone,
    daily_reset_time: profile.daily_reset_time,
    distraction_threshold_minutes: profile.distraction_threshold_minutes,
    upload_validity_hours: profile.upload_validity_hours,
    idle_timeout_minutes: profile.idle_timeout_minutes,
    block_mode: profile.block_mode,
    manual_verification_allowed: profile.manual_verification_allowed,
    strict_youtube_only: profile.strict_youtube_only,
    require_shorts: profile.require_shorts,
    max_shorts_duration_seconds: profile.max_shorts_duration_seconds || 180,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error?.message || 'Gagal menyimpan pengaturan')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Umum</CardTitle>
          <CardDescription>Atur threshold, waktu reset, dan mode blocking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                placeholder="Asia/Jakarta"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily_reset_time">Waktu Reset Harian</Label>
              <Input
                id="daily_reset_time"
                type="time"
                value={formData.daily_reset_time}
                onChange={(e) => setFormData({ ...formData, daily_reset_time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="distraction_threshold_minutes">Threshold Distraksi (menit)</Label>
              <Input
                id="distraction_threshold_minutes"
                type="number"
                min="1"
                value={formData.distraction_threshold_minutes}
                onChange={(e) => setFormData({ ...formData, distraction_threshold_minutes: parseInt(e.target.value) || 30 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload_validity_hours">Validitas Upload (jam)</Label>
              <Input
                id="upload_validity_hours"
                type="number"
                min="1"
                value={formData.upload_validity_hours}
                onChange={(e) => setFormData({ ...formData, upload_validity_hours: parseInt(e.target.value) || 3 })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="idle_timeout_minutes">Idle Timeout (menit)</Label>
              <Input
                id="idle_timeout_minutes"
                type="number"
                min="1"
                value={formData.idle_timeout_minutes}
                onChange={(e) => setFormData({ ...formData, idle_timeout_minutes: parseInt(e.target.value) || 2 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="block_mode">Mode Blocking</Label>
              <select
                id="block_mode"
                value={formData.block_mode}
                onChange={(e) => setFormData({ ...formData, block_mode: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="block_after_threshold">Block Setelah Threshold</option>
                <option value="reminder_only">Reminder Saja</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Verifikasi</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="manual_verification_allowed"
                checked={formData.manual_verification_allowed}
                onChange={(e) => setFormData({ ...formData, manual_verification_allowed: e.target.checked })}
                className="size-4 rounded border-gray-300"
              />
              <Label htmlFor="manual_verification_allowed" className="font-normal">
                Izinkan verifikasi manual (Instagram/TikTok)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="strict_youtube_only"
                checked={formData.strict_youtube_only}
                onChange={(e) => setFormData({ ...formData, strict_youtube_only: e.target.checked })}
                className="size-4 rounded border-gray-300"
              />
              <Label htmlFor="strict_youtube_only" className="font-normal">
                Hanya YouTube (strict mode)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="require_shorts"
                checked={formData.require_shorts}
                onChange={(e) => setFormData({ ...formData, require_shorts: e.target.checked })}
                className="size-4 rounded border-gray-300"
              />
              <Label htmlFor="require_shorts" className="font-normal">
                Wajib YouTube Shorts
              </Label>
            </div>
          </div>

          {formData.require_shorts && (
            <div className="space-y-2">
              <Label htmlFor="max_shorts_duration_seconds">Max Durasi Shorts (detik)</Label>
              <Input
                id="max_shorts_duration_seconds"
                type="number"
                min="1"
                value={formData.max_shorts_duration_seconds}
                onChange={(e) => setFormData({ ...formData, max_shorts_duration_seconds: parseInt(e.target.value) || 180 })}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {error && (
            <Alert variant="destructive" className="flex-1 mr-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="flex-1 mr-4">
              <AlertDescription>Pengaturan berhasil disimpan!</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={loading}>
            <Save className="size-4" data-icon="inline-start" />
            {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
