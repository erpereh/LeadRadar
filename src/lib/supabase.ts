import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { LeadStatus, Note, PromptType, SavedPrompt } from './types'

interface SupabaseCredentials {
  url?: string
  anonKey?: string
}

const clients = new Map<string, SupabaseClient>()

function resolveCredentials(credentials?: SupabaseCredentials) {
  return {
    url: credentials?.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: credentials?.anonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

export function getSupabase(credentials?: SupabaseCredentials): SupabaseClient {
  const { url, anonKey } = resolveCredentials(credentials)

  if (!url || !anonKey) {
    throw new Error(
      '[LeadRadar] Supabase not configured. ' +
        'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local'
    )
  }

  const cacheKey = `${url}::${anonKey}`
  const cached = clients.get(cacheKey)
  if (cached) return cached

  const client = createClient(url, anonKey)
  clients.set(cacheKey, client)
  return client
}

export function getSupabaseSafe(credentials?: SupabaseCredentials): SupabaseClient | null {
  try {
    return getSupabase(credentials)
  } catch {
    return null
  }
}

export async function getLeadStatus(leadId: number, credentials?: SupabaseCredentials): Promise<LeadStatus> {
  const client = getSupabaseSafe(credentials)
  if (!client) return 'pending'

  const { data, error } = await client
    .from('lead_status')
    .select('status')
    .eq('lead_id', leadId)
    .maybeSingle()

  if (error || !data?.status) return 'pending'
  return data.status as LeadStatus
}

export async function setLeadStatus(leadId: number, status: LeadStatus, credentials?: SupabaseCredentials): Promise<void> {
  const client = getSupabase(credentials)
  const { error } = await client
    .from('lead_status')
    .upsert({ lead_id: leadId, status, updated_at: new Date().toISOString() }, { onConflict: 'lead_id' })

  if (error) throw new Error(error.message)
}

export async function getNotes(leadId: number, credentials?: SupabaseCredentials): Promise<Note[]> {
  const client = getSupabase(credentials)
  const { data, error } = await client
    .from('notes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function addNote(leadId: number, content: string, credentials?: SupabaseCredentials): Promise<void> {
  const client = getSupabase(credentials)
  const { error } = await client.from('notes').insert({ lead_id: leadId, content })
  if (error) throw new Error(error.message)
}

export async function savePrompt(
  leadId: number,
  type: PromptType,
  content: string,
  credentials?: SupabaseCredentials
): Promise<void> {
  const client = getSupabase(credentials)
  const { error } = await client.from('generated_prompts').insert({ lead_id: leadId, type, content })
  if (error) throw new Error(error.message)
}

export async function getPrompts(limit = 200, credentials?: SupabaseCredentials): Promise<SavedPrompt[]> {
  const client = getSupabase(credentials)
  const { data, error } = await client
    .from('generated_prompts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function deletePrompt(id: string, credentials?: SupabaseCredentials): Promise<void> {
  const client = getSupabase(credentials)
  const { error } = await client.from('generated_prompts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
