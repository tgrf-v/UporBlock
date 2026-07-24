import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/forms/settings-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shield, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/dashboard')
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-1">
          <Clock className="size-4" />
          <span className="text-sm">
            Reset harian: {profile.daily_reset_time} ({profile.timezone})
          </span>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <SettingsForm profile={profile} />

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Info Blocking
            </CardTitle>
            <CardDescription>Cara kerja blocking</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Block Mode:</strong>{' '}
              {profile.block_mode === 'block_after_threshold'
                ? 'Situs akan diblokir setelah threshold tercapai'
                : 'Hanya menampilkan reminder, tidak memblokir'}
            </p>
            <p>
              <strong>Threshold:</strong> {profile.distraction_threshold_minutes} menit waktu aktif di situs distraksi
            </p>
            <p>
              <strong>Upload Validity:</strong> {profile.upload_validity_hours} jam setelah upload
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
