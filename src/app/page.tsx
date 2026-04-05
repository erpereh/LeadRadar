'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Categoria, Lead, LeadStatus, PromptType, Zona } from '@/lib/types'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightPanel } from '@/components/layout/RightPanel'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { ZoneFilter } from '@/components/dashboard/ZoneFilter'
import { CategoryFilter } from '@/components/dashboard/CategoryFilter'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { LeadGrid } from '@/components/leads/LeadGrid'
import { LeadDetailPanel } from '@/components/leads/LeadDetailPanel'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useMergedLeads } from '@/hooks/useMergedLeads'
import { useSettings } from '@/hooks/useSettings'
import { useToast } from '@/components/ui/ToastProvider'

interface DetailState {
  lead: Lead
  type: PromptType
  result: string
}

export default function DashboardPage() {
  const { leads: allLeads } = useMergedLeads()
  const { settings } = useSettings()
  const { showToast } = useToast()

  const [activeZone, setActiveZone] = useState<Zona>('Todas')
  const [activeCategory, setActiveCategory] = useState<Categoria>('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [focusSearch, setFocusSearch] = useState(false)
  const [detail, setDetail] = useState<DetailState | null>(null)
  const [statuses, setStatuses] = useState<Record<number, LeadStatus>>({})

  const searchRef = useRef<HTMLInputElement | null>(null)

  const leads = useMemo(() => {
    if (settings.showLeadsWithoutPhone) return allLeads
    return allLeads.filter((lead) => lead.telefono.trim().length > 0)
  }, [allLeads, settings.showLeadsWithoutPhone])

  const fetchStatuses = useCallback(async () => {
    try {
      const res = await fetch('/api/leads/status')
      if (res.ok) {
        const data = (await res.json()) as Record<number, LeadStatus>
        setStatuses(data)
      }
    } catch {
      // fallback local only
    }
  }, [])

  useEffect(() => {
    fetchStatuses()
  }, [fetchStatuses])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/') return
      const tagName = (event.target as HTMLElement)?.tagName
      if (tagName === 'INPUT' || tagName === 'TEXTAREA') return
      event.preventDefault()
      searchRef.current?.focus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return leads.filter((lead) => {
      const zoneMatch = activeZone === 'Todas' || lead.zona === activeZone
      const catMatch = activeCategory === 'Todas' || lead.categoria === activeCategory
      const searchMatch =
        !q ||
        lead.nombre.toLowerCase().includes(q) ||
        lead.categoria.toLowerCase().includes(q) ||
        lead.zona.toLowerCase().includes(q) ||
        lead.presenciaDigital.toLowerCase().includes(q)
      return zoneMatch && catMatch && searchMatch
    })
  }, [activeZone, activeCategory, leads, searchQuery])

  const suggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return []
    return leads
      .filter((lead) => lead.nombre.toLowerCase().includes(q) || lead.categoria.toLowerCase().includes(q) || lead.zona.toLowerCase().includes(q))
      .slice(0, 5)
  }, [leads, searchQuery])

  const handlePromptGenerated = (lead: Lead, type: PromptType, result: string) => {
    setDetail({ lead, type, result })
  }

  const handleStatusChange = (leadId: number, status: LeadStatus) => {
    setStatuses((prev) => ({ ...prev, [leadId]: status }))
  }

  const handleCategoryClick = (cat: Categoria) => {
    setActiveCategory(cat)
  }

  const scrollToLead = (leadId: number) => {
    const element = document.getElementById(`lead-card-${leadId}`)
    if (!element) return
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFocusSearch(false)
    showToast('Lead localizada en la lista', 'info')
  }

  const hasActiveFilters = activeZone !== 'Todas' || activeCategory !== 'Todas' || searchQuery !== ''

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] animate-page-fade">
      <a href="#dashboard-main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-[var(--card)] px-3 py-2 rounded-lg z-50">
        Ir al contenido principal
      </a>
      <Sidebar />

      <main id="dashboard-main" className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[var(--border)] bg-[var(--card)]">
          <div>
            <h1 className="text-lg font-bold text-[var(--text)]">Lead Dashboard</h1>
            <p className="text-xs text-[var(--secondary)] mt-0.5">
              {activeZone === 'Todas' ? 'Todas las zonas' : activeZone} · {filteredLeads.length} lead
              {filteredLeads.length !== 1 ? 's' : ''} encontrado{filteredLeads.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary)] pointer-events-none"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onFocus={() => setFocusSearch(true)}
                onBlur={() => window.setTimeout(() => setFocusSearch(false), 120)}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar leads... (/)"
                className="pl-8 pr-4 py-1.5 rounded-xl text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--secondary)] focus:outline-none focus:border-violet-400 transition-colors w-44 focus:w-56 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--secondary)] hover:text-[var(--text)]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}

              {focusSearch && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-card-solid p-1 z-40">
                  {suggestions.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => scrollToLead(lead.id)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg)] transition-colors"
                    >
                      <p className="text-xs text-[var(--text)] font-medium">{lead.nombre}</p>
                      <p className="text-[11px] text-[var(--secondary)]">{lead.categoria} · {lead.zona}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <MetricCards leads={leads} />

          <div>
            <p className="text-xs font-medium text-[var(--secondary)] mb-2 uppercase tracking-wide">Filtrar por zona</p>
            <ZoneFilter active={activeZone} onChange={setActiveZone} />
          </div>

          <div className="flex gap-5 items-start">
            <div className="w-72 shrink-0">
              <CategoryChart leads={leads} activeCategory={activeCategory} onCategoryClick={handleCategoryClick} />
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <p className="text-xs font-medium text-[var(--secondary)] mb-2 uppercase tracking-wide">Filtrar por categoría</p>
                <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
              </div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--secondary)]">
                    Mostrando <span className="font-semibold text-violet-600 dark:text-violet-400">{filteredLeads.length}</span> de {leads.length} leads
                  </span>
                  <button
                    onClick={() => {
                      setActiveZone('Todas')
                      setActiveCategory('Todas')
                      setSearchQuery('')
                    }}
                    className="text-xs text-[var(--secondary)] hover:text-[var(--text)] underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--secondary)] mb-3 uppercase tracking-wide">
              Leads · {filteredLeads.length} resultado{filteredLeads.length !== 1 ? 's' : ''}
            </p>
            <LeadGrid
              leads={filteredLeads}
              statuses={statuses}
              settings={settings}
              onStatusChange={handleStatusChange}
              onPromptGenerated={handlePromptGenerated}
            />
          </div>
        </div>
      </main>

      <RightPanel leads={leads} activeZone={activeZone} statuses={statuses} onZoneChange={setActiveZone} />

      {detail && (
        <LeadDetailPanel
          lead={detail.lead}
          promptType={detail.type}
          promptResult={detail.result}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  )
}
