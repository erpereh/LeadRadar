export interface Branding {
  tono: string
  audiencia: string
  painPoint: string
  propuesta: string
}

export interface Lead {
  id: number
  nombre: string
  categoria: string
  zona: string
  direccion: string
  telefono: string
  nota: number
  nReseñas: number
  presenciaDigital: string
  branding: Branding
  reseñas: string[]
}

export type Zona =
  | 'Todas'
  | 'Ensanche de Vallecas'
  | 'Villa de Vallecas'
  | 'El Cañaveral'
  | 'Vicálvaro'
  | 'Vallecas'
  | 'Puente de Vallecas'
  | 'Moratalaz'
  | 'Personalizada'

export type Categoria =
  | 'Todas'
  | 'Estética'
  | 'Peluquería'
  | 'Barbería'
  | 'Comercio'
  | 'Restaurante'
  | 'Inmobiliaria'
  | 'Taller'
  | 'Fisioterapia'
  | 'Academia'
  | 'Gestoría'
  | 'Cualquiera'

export type PromptType = 'whatsapp' | 'web'

export type LeadStatus = 'pending' | 'contacted' | 'interested' | 'not_interested' | 'converted'

export interface Note {
  id: string
  lead_id: number
  content: string
  created_at: string
}

export interface SavedPrompt {
  id: string
  lead_id: number
  type: PromptType
  content: string
  created_at: string
}

export interface GeneratePromptRequest {
  lead: Lead
  type: PromptType
  aiProvider?: AiProvider
  apiKey?: string
  model?: string
  geminiKey?: string
  saveToDb?: boolean
  supabaseUrl?: string
  supabaseAnonKey?: string
  developerProfile?: DeveloperProfile
}

export interface GeneratePromptResponse {
  result: string
}

export interface DeveloperProfile {
  nombre: string
  ciudad: string
  proyectoReferencia: string
  precioMin: number
  precioMax: number
}

export interface AppSettings {
  aiProvider: AiProvider
  aiApiKey: string
  geminiApiKey: string
  supabaseUrl: string
  supabaseAnonKey: string
  whatsappModel: string
  webModel: string
  searchModel: string
  savePromptsToDb: boolean
  showLeadsWithoutPhone: boolean
  developerProfile: DeveloperProfile
}

export interface RemoteAppSettings {
  aiProvider: AiProvider
  whatsappModel: string
  webModel: string
  searchModel: string
  savePromptsToDb: boolean
  showLeadsWithoutPhone: boolean
  developerProfile: DeveloperProfile
}

export type AiProvider = 'groq' | 'gemini'

export interface SearchLeadsRequest {
  zona: string
  categoria: string
  query?: string
  aiProvider?: AiProvider
  apiKey?: string
  geminiKey?: string
  model?: string
}

export interface SearchLeadResult {
  nombre: string
  categoria: string
  zona: string
  direccion: string
  telefono: string
  nota: number
  nReseñas: number
  presenciaDigital: string
}

export interface PromptRecord extends SavedPrompt {
  lead_nombre?: string
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  pending: 'Pendiente',
  contacted: 'Contactado',
  interested: 'Interesado',
  not_interested: 'No interesado',
  converted: 'Convertido',
}

export const STATUS_ORDER: LeadStatus[] = [
  'pending',
  'contacted',
  'interested',
  'converted',
  'not_interested',
]
