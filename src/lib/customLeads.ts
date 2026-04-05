import type { Lead } from './types'

export const CUSTOM_LEADS_KEY = 'leadradar_custom_leads_v1'
const CUSTOM_LEADS_MIN_ID = 100

export function getCustomLeads(): Lead[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CUSTOM_LEADS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Lead[]
    return parsed.filter((lead) => lead.id >= CUSTOM_LEADS_MIN_ID)
  } catch {
    return []
  }
}

export function setCustomLeads(leads: Lead[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CUSTOM_LEADS_KEY, JSON.stringify(leads.filter((lead) => lead.id >= CUSTOM_LEADS_MIN_ID)))
}

export function nextCustomLeadId(existing: Lead[]): number {
  const maxId = existing.reduce((acc, lead) => Math.max(acc, lead.id), CUSTOM_LEADS_MIN_ID - 1)
  return Math.max(CUSTOM_LEADS_MIN_ID, maxId + 1)
}

export function isCustomLead(leadId: number): boolean {
  return leadId >= CUSTOM_LEADS_MIN_ID
}
