'use client'

import type { AppSettings, Lead, PromptType, LeadStatus } from '@/lib/types'
import { LeadCard } from './LeadCard'

interface LeadGridProps {
  leads: Lead[]
  statuses: Record<number, LeadStatus>
  settings: AppSettings
  onStatusChange: (leadId: number, status: LeadStatus) => void
  onPromptGenerated: (lead: Lead, type: PromptType, result: string) => void
}

export function LeadGrid({ leads, statuses, settings, onStatusChange, onPromptGenerated }: LeadGridProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="text-4xl">🔍</span>
        <p className="text-sm text-[var(--secondary)]">No hay leads con los filtros seleccionados</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {leads.map((lead, i) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          index={i}
          status={statuses[lead.id] ?? 'pending'}
          settings={settings}
          onStatusChange={onStatusChange}
          onPromptGenerated={onPromptGenerated}
        />
      ))}
    </div>
  )
}
