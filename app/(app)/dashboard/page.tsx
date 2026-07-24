import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings, Globe, History, Plug, Video } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: task } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', user!.id)
    .order('task_date', { ascending: false })
    .limit(1)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-[var(--live)]">Completed</Badge>
      case 'blocked':
        return <Badge variant="destructive">Blocked</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>
      default:
        return <Badge variant="outline">Incomplete</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang kembali, {user!.email}</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Hari Ini</CardTitle>
            <CardDescription>Track progress kamu hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            {task ? (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(task.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Waktu Distraksi</span>
                  <span className="font-mono">{formatTime(task.distraction_seconds)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Threshold</span>
                  <span className="font-mono">{profile?.distraction_threshold_minutes || 30} menit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Block Aktif</span>
                  <Badge variant={task.block_active ? "destructive" : "outline"}>
                    {task.block_active ? "Ya" : "Tidak"}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Belum ada data untuk hari ini.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/settings">
                <Button variant="outline">
                  <Settings className="size-4" data-icon="inline-start" />
                  Pengaturan
                </Button>
              </Link>
              <Link href="/sites">
                <Button variant="outline">
                  <Globe className="size-4" data-icon="inline-start" />
                  Kelola Situs
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="outline">
                  <History className="size-4" data-icon="inline-start" />
                  Riwayat
                </Button>
              </Link>
              <Link href="/submit">
                <Button variant={task?.status === 'blocked' ? 'default' : 'outline'}>
                  <Video className="size-4" data-icon="inline-start" />
                  Kirim Video
                </Button>
              </Link>
              <Link href="/connect-extension">
                <Button>
                  <Plug className="size-4" data-icon="inline-start" />
                  Ekstensi
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cara Pakai</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Install ekstensi UporBlock di Chrome/Edge</li>
              <li>Hubungkan ekstensi dengan akunmu</li>
              <li>Atur situs yang ingin diblokir di pengaturan</li>
              <li>Gunakan browser seperti biasa</li>
              <li>Jika melebihi batas, upload video produktif</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
