'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plug, Copy, Check, RefreshCw } from 'lucide-react'

export function ConnectExtensionForm() {
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const generateCode = async () => {
    setLoading(true)
    setError(null)
    setPairingCode(null)

    try {
      const res = await fetch('/api/extension/pairing-codes', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message || 'Gagal membuat kode')
        setLoading(false)
        return
      }

      setPairingCode(data.code)
      setExpiresAt(data.expires_at)
      setLoading(false)
    } catch {
      setError('Terjadi kesalahan')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!expiresAt) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000))

      setTimeLeft(remaining)

      if (remaining <= 0) {
        setPairingCode(null)
        setExpiresAt(null)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const copyCode = async () => {
    if (!pairingCode) return

    await navigator.clipboard.writeText(pairingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-5" />
            Hubungkan Ekstensi
          </CardTitle>
          <CardDescription>
            Generate kode pairing untuk menghubungkan ekstensi browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pairingCode ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Masukkan kode ini di ekstensi UporBlock:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-3xl font-mono font-bold tracking-widest bg-muted px-6 py-3 rounded-lg">
                    {pairingCode}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyCode}
                  >
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Kode berlaku selama{' '}
                <span className="font-mono font-medium">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Klik tombol di bawah untuk generate kode pairing
              </p>
              <Button onClick={generateCode} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Kode'}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        {pairingCode && (
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={generateCode}
              disabled={loading}
            >
              <RefreshCw className="size-4" data-icon="inline-start" />
              Generate Kode Baru
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cara Menghubungkan</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Install ekstensi UporBlock di Chrome/Edge</li>
            <li>Klik ikon ekstensi di toolbar browser</li>
            <li>Masukkan kode pairing yang sudah di-generate</li>
            <li>Klik &quot;Hubungkan&quot; di ekstensi</li>
            <li>Ekstensi akan otomatis sync data dari server</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
