'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ShieldCheck } from 'lucide-react'

interface Allowlist {
  id: string
  label: string
  pattern: string
  pattern_type: string
  is_active: boolean
  priority: number
}

export function AllowlistsForm({ allowlists }: { allowlists: Allowlist[] }) {
  const [formData, setFormData] = useState({
    label: '',
    pattern: '',
    pattern_type: 'wildcard',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allowlistsList, setAllowlistsList] = useState(allowlists)
  const router = useRouter()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/allowlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error?.message || 'Gagal menambahkan allowlist')
      setLoading(false)
      return
    }

    setAllowlistsList([...allowlistsList, data.allowlist])
    setFormData({ label: '', pattern: '', pattern_type: 'wildcard' })
    setLoading(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus allowlist ini?')) return

    const res = await fetch(`/api/allowlists/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      setError('Gagal menghapus allowlist')
      return
    }

    setAllowlistsList(allowlistsList.filter((a) => a.id !== id))
    router.refresh()
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/allowlists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })

    if (!res.ok) {
      setError('Gagal mengupdate allowlist')
      return
    }

    setAllowlistsList(
      allowlistsList.map((a) => (a.id === id ? { ...a, is_active: !isActive } : a))
    )
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Tambah Allowlist Upload
          </CardTitle>
          <CardDescription>
            URL yang tetap bisa diakses meskipun situs utama diblokir
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAdd}>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="allow-label">Label</Label>
                <Input
                  id="allow-label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="YouTube Studio"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allow-pattern_type">Tipe Pattern</Label>
                <select
                  id="allow-pattern_type"
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
              <Label htmlFor="allow-pattern">Pattern URL</Label>
              <Input
                id="allow-pattern"
                value={formData.pattern}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                placeholder="https://studio.youtube.com/*"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              <Plus className="size-4" data-icon="inline-start" />
              {loading ? 'Menambahkan...' : 'Tambah Allowlist'}
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
          <CardTitle>Daftar Allowlist</CardTitle>
          <CardDescription>{allowlistsList.length} URL terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          {allowlistsList.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Belum ada allowlist
            </p>
          ) : (
            <div className="space-y-2">
              {allowlistsList.map((allowlist) => (
                <div
                  key={allowlist.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={allowlist.is_active ? 'default' : 'secondary'}>
                      {allowlist.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                    <div>
                      <p className="font-medium">{allowlist.label}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {allowlist.pattern}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(allowlist.id, allowlist.is_active)}
                    >
                      {allowlist.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(allowlist.id)}
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
