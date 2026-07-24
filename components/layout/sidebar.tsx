'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Globe, Settings, Video, History, Plug, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sites', label: 'Situs Blokir', icon: Globe },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
  { href: '/submit', label: 'Kirim Video', icon: Video },
  { href: '/history', label: 'Riwayat', icon: History },
  { href: '/connect-extension', label: 'Ekstensi', icon: Plug },
]

interface SidebarProps {
  email: string
}

export function Sidebar({ email }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r bg-card">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="size-8 rounded-md bg-emerald-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </div>
        <span className="text-lg font-bold">UporBlock</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t px-3 py-4">
        <div className="px-3 mb-3">
          <p className="text-sm font-medium truncate">{email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
