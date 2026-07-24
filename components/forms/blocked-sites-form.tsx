'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Globe } from 'lucide-react'

interface BlockedSite {
  id: string
  label: string
  pattern: string
  pattern_type: string
  is_active: boolean
  priority: number
}

export function BlockedSitesForm({ sites }: { sites: BlockedSite[] }) {
  const [formData, setFormData] = useState({
    label: '',
    pattern: '',
    pattern_type: 'wildcard',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sitesList, setSitesList] = useState(sites)
  const router = useRouter()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/blocked-sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error?.message || 'Gagal menambahkan situs')
      setLoading(false)
      return
    }

    setSitesList([...sitesList, data.site])
    setFormData({ label: '', pattern: '', pattern_type: 'wildcard' })
    setLoading(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus situs ini?')) return

    const res = await fetch(`/api/blocked-sites/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      setError('Gagal menghapus situs')
      return
    }

    setSitesList(sitesList.filter((s) => s.id !== id))
    router.refresh()
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/blocked-sites/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })

    if (!res.ok) {
      setError('Gagal mengupdate situs')
      return
    }

    setSitesList(
      sitesList.map((s) => (s.id === id ? { ...s, is_active: !isActive } : s))
    )
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Situs Blokir</CardTitle>
          <CardDescription>Tambahkan website yang ingin diblokir</CardDescription>
        </CardHeader>
        <form onSubmit={handleAdd}>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="YouTube Shorts"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pattern_type">Tipe Pattern</Label>
                <select
                  id="pattern_type"
                  value={formData.pattern_type}
                  onChange={(e) => setFormData({ ...formData, pattern_type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="wildcard">Wildcard</option>
                  <option value="domain">Domain</option>
                  <option value="url_prefix">URL Prefix</option>
                  <option value="regex">Regex</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern URL</Label>
              <Input
                id="pattern"
                value={formData.pattern}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                placeholder="https://www.youtube.com/shorts*"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              <Plus className="size-4" data-icon="inline-start" />
              {loading ? 'Menambahkan...' : 'Tambah Situs'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="size-5" />
            Daftar Situs Blokir
          </CardTitle>
          <CardDescription>{sitesList.length} situs terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          {sitesList.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Belum ada situs yang diblokir
            </p>
          ) : (
            <div className="space-y-2">
              {sitesList.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={site.is_active ? 'default' : 'secondary'}>
                      {site.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                    <div>
                      <p className="font-medium">{site.label}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {site.pattern}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(site.id, site.is_active)}
                    >
                      {site.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(site.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
