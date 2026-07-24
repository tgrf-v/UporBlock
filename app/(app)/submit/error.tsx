'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function SubmitError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground mb-4">
          {error.message || 'Gagal memuat halaman submit'}
        </p>
        <Button onClick={reset} variant="outline">
          Coba Lagi
        </Button>
      </div>
    </div>
  )
}
