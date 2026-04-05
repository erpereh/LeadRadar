'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { getStoredSettings } from '@/lib/settings'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

type ConnectionState = 'connected' | 'offline' | 'not_configured'

function RadarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" opacity="0.35" />
      <path d="M12 4a8 8 0 0 1 8 8" />
      <path d="M12 8a4 4 0 0 1 4 4" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <path d="M12 12l5-5" />
      <path d="M5 18h14" opacity="0.7" />
    </svg>
  )
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h7v8H3z" />
        <path d="M14 3h7v5h-7z" />
        <path d="M14 11h7v10h-7z" />
        <path d="M3 14h7v7H3z" />
      </svg>
    ),
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8h3" />
        <path d="M20 12h3" />
        <path d="M20 16h3" />
      </svg>
    ),
  },
  {
    label: 'Buscar',
    href: '/buscar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
        <path d="M11 7v4l2.5 2.5" opacity="0.65" />
      </svg>
    ),
  },
  {
    label: 'Historial',
    href: '/historial',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
        <path d="M12 3v2" opacity="0.65" />
      </svg>
    ),
  },
  {
    label: 'Ajustes',
    href: '/ajustes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.4V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-1-1.4 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.4-1H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.4-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.4V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.4h.1a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.4 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1z" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [connection, setConnection] = useState<ConnectionState>('not_configured')

  useEffect(() => {
    let cancelled = false

    const checkConnection = async () => {
      const settings = getStoredSettings()
      const hasLocalConfig = Boolean(settings.supabaseUrl && settings.supabaseAnonKey)

      try {
        const res = await fetch('/api/verify-supabase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: settings.supabaseUrl || undefined,
            anonKey: settings.supabaseAnonKey || undefined,
          }),
        })
        const data = (await res.json()) as { connected?: boolean; configured?: boolean }
        if (cancelled) return

        if (data.connected) {
          setConnection('connected')
        } else if (hasLocalConfig || data.configured) {
          setConnection('offline')
        } else {
          setConnection('not_configured')
        }
      } catch {
        if (!cancelled) {
          setConnection(hasLocalConfig ? 'offline' : 'not_configured')
        }
      }
    }

    checkConnection()
    const interval = window.setInterval(checkConnection, 20000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  const connectionLabel = useMemo(() => {
    if (connection === 'connected') return 'Supabase conectado'
    if (connection === 'offline') return 'Supabase sin conexion'
    return 'Configura Supabase en Ajustes'
  }, [connection])

  return (
    <aside className="w-16 h-full flex flex-col items-center py-5 gap-2 shrink-0 bg-[var(--card)] border-r border-[var(--border)]">
      <Link
        href="/"
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40"
      >
        <RadarIcon />
      </Link>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-br from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40'
                  : 'text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--border)]'
              }`}
            >
              {item.icon}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2 mt-auto items-center">
        <div
          className={`w-3 h-3 rounded-full border border-white/50 ${
            connection === 'connected' ? 'bg-emerald-500' : connection === 'offline' ? 'bg-red-500' : 'bg-gray-400'
          }`}
          title={connectionLabel}
          aria-label={connectionLabel}
        />

        <button
          title="Notificaciones"
          aria-label="Notificaciones"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all duration-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
          D
        </div>
      </div>
    </aside>
  )
}
