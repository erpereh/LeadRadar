export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { DEFAULT_REMOTE_SETTINGS } from '@/lib/settings'
import type { RemoteAppSettings } from '@/lib/types'

const SETTINGS_SCOPE = 'global'

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('app_settings')
      .select('*')
      .eq('scope', SETTINGS_SCOPE)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(DEFAULT_REMOTE_SETTINGS)
    }

    return NextResponse.json(normalizeSettings(data))
  } catch {
    return NextResponse.json(DEFAULT_REMOTE_SETTINGS)
  }
}

export async function PATCH(request: NextRequest) {
  let body: Partial<RemoteAppSettings>

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body invalido' }, { status: 400 })
  }

  const payload = {
    scope: SETTINGS_SCOPE,
    ai_provider: body.aiProvider ?? DEFAULT_REMOTE_SETTINGS.aiProvider,
    whatsapp_model: body.whatsappModel ?? DEFAULT_REMOTE_SETTINGS.whatsappModel,
    web_model: body.webModel ?? DEFAULT_REMOTE_SETTINGS.webModel,
    search_model: body.searchModel ?? DEFAULT_REMOTE_SETTINGS.searchModel,
    save_prompts_to_db: body.savePromptsToDb ?? DEFAULT_REMOTE_SETTINGS.savePromptsToDb,
    show_leads_without_phone: body.showLeadsWithoutPhone ?? DEFAULT_REMOTE_SETTINGS.showLeadsWithoutPhone,
    developer_profile: body.developerProfile ?? DEFAULT_REMOTE_SETTINGS.developerProfile,
    updated_at: new Date().toISOString(),
  }

  try {
    const { data, error } = await getSupabase()
      .from('app_settings')
      .upsert(payload, { onConflict: 'scope' })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(normalizeSettings(data))
  } catch {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 })
  }
}

function normalizeSettings(row: Record<string, unknown>): RemoteAppSettings {
  return {
    aiProvider: String(row.ai_provider ?? DEFAULT_REMOTE_SETTINGS.aiProvider) as RemoteAppSettings['aiProvider'],
    whatsappModel: String(row.whatsapp_model ?? DEFAULT_REMOTE_SETTINGS.whatsappModel),
    webModel: String(row.web_model ?? DEFAULT_REMOTE_SETTINGS.webModel),
    searchModel: String(row.search_model ?? DEFAULT_REMOTE_SETTINGS.searchModel),
    savePromptsToDb: Boolean(row.save_prompts_to_db ?? DEFAULT_REMOTE_SETTINGS.savePromptsToDb),
    showLeadsWithoutPhone: Boolean(row.show_leads_without_phone ?? DEFAULT_REMOTE_SETTINGS.showLeadsWithoutPhone),
    developerProfile: (row.developer_profile as RemoteAppSettings['developerProfile']) ?? DEFAULT_REMOTE_SETTINGS.developerProfile,
  }
}
