'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  getStoredSettings,
  mergeRemoteSettings,
  saveSettings,
  toRemoteSettings,
} from '@/lib/settings'
import type { AppSettings, RemoteAppSettings } from '@/lib/types'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const localSettings = getStoredSettings()
    setSettings(localSettings)
    setLoaded(true)

    const syncFromRemote = async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' })
        if (!res.ok) return
        const remote = (await res.json()) as Partial<RemoteAppSettings>
        if (cancelled) return
        const merged = mergeRemoteSettings(localSettings, remote)
        setSettings(merged)
        saveSettings(merged)
      } catch {
        // local-only mode
      }
    }

    syncFromRemote()

    return () => {
      cancelled = true
    }
  }, [])

  const updateSettings = useCallback((next: AppSettings) => {
    const normalized: AppSettings = {
      ...next,
      geminiApiKey: next.aiApiKey,
    }

    setSettings(normalized)
    saveSettings(normalized)

    fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toRemoteSettings(normalized)),
    }).catch(() => {
      // local-only mode
    })
  }, [])

  return { settings, updateSettings, loaded }
}
