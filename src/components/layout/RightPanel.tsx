'use client'

import { useEffect, useState } from 'react'
import type { Lead, Zona, LeadStatus, SavedPrompt } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'

interface RightPanelProps {
  leads: Lead[]
  activeZone: Zona
  statuses: Record<number, LeadStatus>
  onZoneChange: (zone: Zona) => void
}

const STATUS_TO_BADGE: Record<LeadStatus, 'pending' | 'contacted' | 'interested' | 'default'> = {
  pending: 'pending',
  contacted: 'contacted',
  interested: 'interested',
  not_interested: 'default',
  converted: 'interested',
}

const QUICK_ZONES: Zona[] = ['Ensanche de Vallecas', 'Villa de Vallecas', 'El Cañaveral']

const ZONA_SHORT: Record<string, string> = {
  'Ensanche de Vallecas': 'Ensanche',
  'Villa de Vallecas': 'Villa',
  'El Cañaveral': 'Cañaveral',
  'Vicálvaro': 'Vicálvaro',
}

export function RightPanel({ leads, activeZone, statuses, onZoneChange }: RightPanelProps) {
  const [recentPrompts, setRecentPrompts] = useState<(SavedPrompt & { nombre: string })[]>([])

  useEffect(() => {
    // Fetch last 6 generated prompts across all leads
    const fetchRecent = async () => {
      try {
        // Fetch from each lead's prompts and merge — use a simple approach
        const results = await Promise.all(
          leads.slice(0, 5).map(async (lead) => {
            const res = await fetch(`/api/leads/${lead.id}/prompts`)
            if (!res.ok) return []
            const prompts: SavedPrompt[] = await res.json()
            return prompts.map((p) => ({ ...p, nombre: lead.nombre }))
          })
        )
        const flat = results
          .flat()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6)
        setRecentPrompts(flat)
      } catch {
        // Silently fail if Supabase not configured
      }
    }
    fetchRecent()
  }, [leads])

  // Show leads sorted by status relevance (pending first, then contacted, etc.)
  const recentLeads = [...leads]
    .sort((a, b) => {
      const order: LeadStatus[] = ['pending', 'contacted', 'interested', 'converted', 'not_interested']
      return order.indexOf(statuses[a.id] ?? 'pending') - order.indexOf(statuses[b.id] ?? 'pending')
    })
    .slice(0, 6)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })

  return (
    <aside className="
      w-72 h-full flex flex-col gap-4 py-5 px-4 shrink-0 overflow-y-auto
      border-l border-[var(--border)] bg-[var(--card)]
    ">
      {/* Actividad reciente */}
      <div className="glass-card-solid p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-sm text-[var(--text)]">Actividad reciente</h2>
            <p className="text-xs text-[var(--secondary)] mt-0.5">
              {recentPrompts.length > 0 ? 'Últimos prompts generados' : 'Estado de los leads'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {recentPrompts.length > 0
            ? recentPrompts.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm
                    bg-gradient-to-br from-violet-100 to-purple-100
                    dark:from-violet-900/40 dark:to-purple-900/40
                  ">
                    {p.type === 'whatsapp' ? '💬' : '🌐'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text)] truncate">{p.nombre}</p>
                    <p className="text-xs text-[var(--secondary)]">{formatDate(p.created_at)}</p>
                  </div>
                  <span className="text-xs text-[var(--secondary)] shrink-0">
                    {p.type === 'whatsapp' ? 'WA' : 'Web'}
                  </span>
                </div>
              ))
            : recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3">
                  <div className="
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold
                    bg-gradient-to-br from-violet-100 to-purple-100
                    dark:from-violet-900/40 dark:to-purple-900/40
                    text-violet-600 dark:text-violet-300
                  ">
                    {lead.nombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text)] truncate">{lead.nombre}</p>
                    <p className="text-xs text-[var(--secondary)]">{lead.categoria}</p>
                  </div>
                  <Badge variant={STATUS_TO_BADGE[statuses[lead.id] ?? 'pending']}>
                    {STATUS_LABELS[statuses[lead.id] ?? 'pending'].split(' ')[0]}
                  </Badge>
                </div>
              ))}
        </div>
      </div>

      {/* Tip */}
      <div className="glass-card p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-100 dark:border-violet-800/30">
        <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">
          Estrategia recomendada
        </p>
        <p className="text-xs text-violet-600 dark:text-violet-400 leading-relaxed">
          Los negocios con más de 100 reseñas y sin web tienen mayor probabilidad de conversión.
        </p>
      </div>

      {/* Acceso rápido */}
      <div className="glass-card-solid p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-[var(--text)]">Acceso rápido</h2>
          <span className="text-xs text-[var(--secondary)]">Zonas</span>
        </div>
        <div className="flex flex-col gap-2">
          {QUICK_ZONES.map((zone) => (
            <button
              key={zone}
              onClick={() => onZoneChange(activeZone === zone ? 'Todas' : zone)}
              className={`
                flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium
                transition-all duration-200
                ${activeZone === zone
                  ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-sm'
                  : 'bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--border)]'
                }
              `}
            >
              <span>{ZONA_SHORT[zone] ?? zone}</span>
              <span className={activeZone === zone ? 'text-violet-200' : 'text-[var(--secondary)]'}>
                {leads.filter((l) => l.zona === zone).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card-solid p-4">
        <p className="text-sm font-semibold text-[var(--text)] mb-3">Pipeline</p>
        {(['pending', 'contacted', 'interested', 'converted'] as LeadStatus[]).map((s) => {
          const count = leads.filter((lead) => (statuses[lead.id] ?? 'pending') === s).length
          const pct = leads.length > 0 ? (count / leads.length) * 100 : 0
          return (
            <div key={s} className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[var(--secondary)] w-24 shrink-0">{STATUS_LABELS[s]}</span>
              <div className="flex-1 h-1.5 bg-[var(--bg)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-[var(--text)] w-4 shrink-0">{count}</span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
