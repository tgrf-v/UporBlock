import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldOff, Clock, Video, ArrowRight, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6 text-primary-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <span className="text-xl font-bold">UporBlock</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/login">
              <Button>Mulai Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
            <Zap className="size-4" />
            Kontrol Diri untuk Produktivitas
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
            Blokir Distraksi,{' '}
            <span className="text-primary">Upload Produktif</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Aplikasi kontrol diri yang memblokir situs distraksi dan memaksa kamu upload video produktif setelah melewati batas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Mulai Sekarang
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Login
              </Button>
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-20 border-t">
          <h2 className="text-3xl font-bold text-center mb-12">Cara Kerja</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-6">
              <div className="size-14 rounded-full bg-accent flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-accent-foreground">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Install Ekstensi</h3>
              <p className="text-muted-foreground">
                Pasang ekstensi UporBlock di Chrome atau Edge
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="size-14 rounded-full bg-accent flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-accent-foreground">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Atur Blokir</h3>
              <p className="text-muted-foreground">
                Pilih situs yang ingin diblokir dan atur threshold
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="size-14 rounded-full bg-accent flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-accent-foreground">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Produktif</h3>
              <p className="text-muted-foreground">
                Setelah blokir, upload video produktif untuk buka akses
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20 border-t bg-muted/30">
          <h2 className="text-3xl font-bold text-center mb-12">Fitur Utama</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border">
              <ShieldOff className="size-10 text-primary" />
              <h3 className="font-semibold">Blokir Distraksi</h3>
              <p className="text-sm text-muted-foreground text-center">
                Blokir YouTube, Instagram, TikTok saat jam kerja
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border">
              <Clock className="size-10 text-primary" />
              <h3 className="font-semibold">Track Waktu</h3>
              <p className="text-sm text-muted-foreground text-center">
                Pantau berapa lama kamu di situs distraksi
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border">
              <Video className="size-10 text-primary" />
              <h3 className="font-semibold">Upload Produktif</h3>
              <p className="text-sm text-muted-foreground text-center">
                Setelah blokir, upload video produktif untuk buka akses
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20 border-t">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Siap Produktif?</h2>
            <p className="text-muted-foreground mb-8">
              Mulai kendalikan waktu kamu sekarang. Gratis, tanpa kartu kredit.
            </p>
            <Link href="/login">
              <Button size="lg">
                Mulai Gratis
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>UporBlock - Kontrol Diri untuk Produktivitas</p>
        </div>
      </footer>
    </div>
  )
}
