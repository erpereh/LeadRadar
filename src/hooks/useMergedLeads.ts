'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { LEADS } from '@/lib/leads'
import { getCustomLeads, setCustomLeads } from '@/lib/customLeads'
import type { Lead } from '@/lib/types'

export function useMergedLeads() {
  const [customLeads, setCustomLeadState] = useState<Lead[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setCustomLeadState(getCustomLeads())
    setReady(true)
  }, [])

  const leads = useMemo(() => [...LEADS, ...customLeads], [customLeads])

  const setCustomLeadsValue = useCallback((next: Lead[]) => {
    setCustomLeadState(next)
    setCustomLeads(next)
  }, [])

  return {
    leads,
    customLeads,
    setCustomLeads: setCustomLeadsValue,
    ready,
  }
}
