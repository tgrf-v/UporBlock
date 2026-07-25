# UporBlock

Sistem pemblokiran gangguan digital — browser extension + web dashboard + Supabase backend.

Blokir situs yang mengganggu setelah batas waktu tertentu. Unggah video YouTube produktif untuk membuka kembali akses.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **UI:** shadcn/ui, Space Grotesk + Unbounded + JetBrains Mono
- **Backend:** Supabase (PostgreSQL, RLS, Auth)
- **Extension:** Chrome/Edge Extension (Manifest V3)
- **Video:** YouTube Data API v3

## Features

- Blokir situs berdasarkan domain, wildcard, atau regex
- Deteksi waktu aktif / idle secara real-time
- Threshold gangguan yang bisa dikonfigurasi
- Mode blokir: reminder atau blokir penuh
- Unggah video YouTube produktif untuk membuka blokir
- Verifikasi otomatis via YouTube Data API
- Statistik harian, streak, dan riwayat lengkap
- Pairing extension via kode 6 karakter
- Dark mode "Studio Lockout" dengan tema oranye

## Getting Started

### Prerequisites

- Node.js 18+
- Akun Supabase (gratis)
- YouTube Data API v3 key

### Install

```bash
git clone https://github.com/tgrf-v/UporBlock.git
cd UporBlock
npm install
```

### Environment Variables

Copy `.env.local.example` ke `.env.local` dan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
YOUTUBE_API_KEY=AIzaSy...
```

### Database

Buka Supabase SQL Editor dan jalankan isi `supabase/migrations/0001_init.sql`.

### Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Load Extension

1. Buka `chrome://extensions/`
2. Aktifkan Developer mode
3. Klik "Load unpacked" → pilih folder `extension/`

## Project Structure

```
UporBlock/
├── app/                     # Next.js App Router
│   ├── (app)/               # Protected routes (sidebar layout)
│   │   ├── dashboard/       # Dashboard utama
│   │   ├── settings/        # Pengaturan
│   │   ├── sites/           # Blokir situs & allowlist
│   │   ├── submit/          # Kirim video YouTube
│   │   ├── history/         # Riwayat & statistik
│   │   └── connect-extension/ # Pairing extension
│   ├── (auth)/              # Login
│   └── api/                 # API routes
│       └── extension/       # Extension token-auth routes
├── components/              # React components
│   ├── forms/               # Form components
│   ├── history/             # Stats & history components
│   ├── layout/              # Sidebar, mobile nav
│   └── ui/                  # shadcn/ui primitives
├── extension/               # Chrome Extension (plain JS)
│   ├── background.js        # Service worker
│   ├── popup.html/js        # Extension popup
│   ├── blocked.html/js      # Blocked page
│   └── lib/                 # Extension helpers
├── lib/                     # Shared utilities
│   ├── supabase/            # Supabase clients
│   └── youtube.ts           # YouTube API helpers
└── supabase/
    └── migrations/          # Database schema
```

## Commands

```bash
npm run dev      # Dev server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Architecture

```
[Chrome Extension] <--token auth--> [Next.js API Routes] <--Supabase JS--> [Supabase/PostgreSQL]
                                          |
                                    [YouTube Data API]
                                          |
                                    [Web Dashboard (React)]
```

## License

Private
