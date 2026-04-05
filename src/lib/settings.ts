import type { AppSettings, RemoteAppSettings } from './types'

export const SETTINGS_STORAGE_KEY = 'leadradar_settings_v1'

export const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: 'groq',
  aiApiKey: '',
  geminiApiKey: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  whatsappModel: 'llama-3.3-70b-versatile',
  webModel: 'llama-3.3-70b-versatile',
  searchModel: 'groq/compound-mini',
  savePromptsToDb: true,
  showLeadsWithoutPhone: true,
  developerProfile: {
    nombre: 'David',
    ciudad: 'Madrid',
    proyectoReferencia: 'Focus Club Vallecas',
    precioMin: 400,
    precioMax: 800,
  },
}

export const DEFAULT_REMOTE_SETTINGS: RemoteAppSettings = {
  aiProvider: DEFAULT_SETTINGS.aiProvider,
  whatsappModel: DEFAULT_SETTINGS.whatsappModel,
  webModel: DEFAULT_SETTINGS.webModel,
  searchModel: DEFAULT_SETTINGS.searchModel,
  savePromptsToDb: DEFAULT_SETTINGS.savePromptsToDb,
  showLeadsWithoutPhone: DEFAULT_SETTINGS.showLeadsWithoutPhone,
  developerProfile: DEFAULT_SETTINGS.developerProfile,
}

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    const legacyKey = parsed.aiApiKey || parsed.geminiApiKey || ''
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      aiApiKey: legacyKey,
      geminiApiKey: legacyKey,
      developerProfile: {
        ...DEFAULT_SETTINGS.developerProfile,
        ...(parsed.developerProfile ?? {}),
      },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function toRemoteSettings(settings: AppSettings): RemoteAppSettings {
  return {
    aiProvider: settings.aiProvider,
    whatsappModel: settings.whatsappModel,
    webModel: settings.webModel,
    searchModel: settings.searchModel,
    savePromptsToDb: settings.savePromptsToDb,
    showLeadsWithoutPhone: settings.showLeadsWithoutPhone,
    developerProfile: settings.developerProfile,
  }
}

export function mergeRemoteSettings(local: AppSettings, remote?: Partial<RemoteAppSettings>): AppSettings {
  if (!remote) return local
  return {
    ...local,
    aiProvider: remote.aiProvider ?? local.aiProvider,
    whatsappModel: remote.whatsappModel ?? local.whatsappModel,
    webModel: remote.webModel ?? local.webModel,
    searchModel: remote.searchModel ?? local.searchModel,
    savePromptsToDb: remote.savePromptsToDb ?? local.savePromptsToDb,
    showLeadsWithoutPhone: remote.showLeadsWithoutPhone ?? local.showLeadsWithoutPhone,
    developerProfile: {
      ...local.developerProfile,
      ...(remote.developerProfile ?? {}),
    },
  }
}
