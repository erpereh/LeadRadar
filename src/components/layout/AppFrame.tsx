'use client'

import { Sidebar } from './Sidebar'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface AppFrameProps {
  title: string
  subtitle: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function AppFrame({ title, subtitle, children, actions }: AppFrameProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] animate-page-fade">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[var(--border)] bg-[var(--card)]">
          <div>
            <h1 className="text-lg font-bold text-[var(--text)]">{title}</h1>
            <p className="text-xs text-[var(--secondary)] mt-0.5">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <ThemeToggle />
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6">{children}</section>
      </main>
    </div>
  )
}
