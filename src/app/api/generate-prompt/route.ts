export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { generatePrompt } from '@/lib/ai'
import { getSupabase } from '@/lib/supabase'
import type { GeneratePromptRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  let body: GeneratePromptRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 })
  }

  const { lead, type } = body

  if (!lead || !type) {
    return NextResponse.json(
      { error: 'Faltan campos: lead y type son obligatorios' },
      { status: 400 }
    )
  }

  if (type !== 'whatsapp' && type !== 'web') {
    return NextResponse.json({ error: 'type debe ser "whatsapp" o "web"' }, { status: 400 })
  }

  try {
    const headerGeminiKey = request.headers.get('x-gemini-key') ?? undefined
    const headerSupabaseUrl = request.headers.get('x-supabase-url') ?? undefined
    const headerSupabaseAnonKey = request.headers.get('x-supabase-anon-key') ?? undefined

    const result = await generatePrompt(lead, type, {
      provider: body.aiProvider,
      apiKey: body.apiKey ?? body.geminiKey ?? headerGeminiKey,
      model: body.model,
      developerProfile: body.developerProfile,
    })

    if (body.saveToDb ?? true) {
      // Save to DB — fire-and-forget, wrapped so it never throws even if Supabase isn't configured
      try {
        getSupabase({
          url: body.supabaseUrl ?? headerSupabaseUrl,
          anonKey: body.supabaseAnonKey ?? headerSupabaseAnonKey,
        })
          .from('generated_prompts')
          .insert({ lead_id: lead.id, type, content: result })
          .then(({ error }) => {
            if (error) console.warn('[LeadRadar] Could not save prompt:', error.message)
          })
      } catch {
        // Supabase not configured — skip silently
      }
    }

    return NextResponse.json({ result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
