export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'
import type { AiProvider } from '@/lib/types'

interface PingBody {
  aiProvider?: AiProvider
  apiKey?: string
  model?: string
}

export async function POST(request: NextRequest) {
  let body: PingBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Body inválido' }, { status: 400 })
  }

  const provider = body.aiProvider ?? 'groq'
  const apiKey = body.apiKey

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'API key no configurada' }, { status: 400 })
  }

  const model = body.model ?? (provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-2.0-flash-lite')
  const startedAt = Date.now()

  try {
    if (provider === 'gemini') {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Responde solo: OK' }] }],
            generationConfig: { temperature: 0, maxOutputTokens: 8 },
          }),
        },
        10000
      )

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json({ ok: false, error: `Gemini ${response.status}: ${errorText}` }, { status: 400 })
      }
    } else {
      const response = await fetchWithTimeout(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            temperature: 0,
            max_tokens: 8,
            messages: [{ role: 'user', content: 'Responde solo: OK' }],
          }),
        },
        10000
      )

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json({ ok: false, error: `Groq ${response.status}: ${errorText}` }, { status: 400 })
      }
    }

    return NextResponse.json({
      ok: true,
      model,
      provider,
      latencyMs: Date.now() - startedAt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
