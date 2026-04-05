export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import type { SearchLeadResult, SearchLeadsRequest } from '@/lib/types'
import { fetchWithTimeout } from '@/lib/fetchWithTimeout'

const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 5
const requestLog = new Map<string, number[]>()

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = requestLog.get(ip) ?? []
  const recent = timestamps.filter((ts) => now - ts < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(ip, recent)
    return true
  }

  requestLog.set(ip, [...recent, now])
  return false
}

function extractJsonArray(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    const start = raw.indexOf('[')
    const end = raw.lastIndexOf(']')
    if (start === -1 || end === -1 || end <= start) return []
    try {
      const parsed = JSON.parse(raw.slice(start, end + 1))
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
}

function sanitizeLead(input: unknown, zona: string, categoria: string): SearchLeadResult | null {
  if (!input || typeof input !== 'object') return null
  const item = input as Record<string, unknown>

  const nombre = String(item.nombre ?? '').trim()
  const direccion = String(item.direccion ?? '').trim()
  const telefono = String(item.telefono ?? '').trim()
  const presenciaDigital = String(item.presenciaDigital ?? '').trim()

  const notaRaw = Number(item.nota ?? 0)
  const nota = Number.isFinite(notaRaw) ? Math.max(0, Math.min(5, notaRaw)) : 0

  const nResenasRaw = Number(item.nReseñas ?? item.nResenas ?? 0)
  const nReseñas = Number.isFinite(nResenasRaw) ? Math.max(0, Math.round(nResenasRaw)) : 0

  if (!nombre || !direccion) return null

  return {
    nombre,
    categoria: String(item.categoria ?? categoria),
    zona: String(item.zona ?? zona),
    direccion,
    telefono,
    nota,
    nReseñas,
    presenciaDigital: presenciaDigital || 'Google Maps. Web no encontrada.',
  }
}

export async function POST(request: NextRequest) {
  const ip = getIp(request)
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Demasiadas búsquedas. Espera un minuto.' }, { status: 429 })
  }

  let body: SearchLeadsRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  }

  if (!body.zona || !body.categoria) {
    return NextResponse.json({ error: 'zona y categoria son obligatorios' }, { status: 400 })
  }

  const provider = body.aiProvider ?? 'groq'
  const apiKey = body.apiKey ?? body.geminiKey
  const model = body.model ?? (provider === 'groq' ? 'groq/compound-mini' : 'gemini-2.0-flash')

  if (!apiKey) {
    return NextResponse.json({ error: 'AI API key no configurada' }, { status: 500 })
  }

  const queryLine = body.query ? `Consulta adicional del usuario: ${body.query}` : ''
  const prompt = `Busca negocios reales de ${body.categoria} en ${body.zona}, Madrid que tengan presencia en Google Maps pero no tengan pagina web propia.
Para cada negocio devuelve: nombre, categoria, zona, direccion, telefono, nota, nReseñas, presenciaDigital.
Solo negocios reales y verificables. Si no encuentras telefono o nota, usa cadena vacia o 0.
${queryLine}
Devuelve EXCLUSIVAMENTE un JSON array valido, sin markdown ni texto adicional.`

  try {
    const response = provider === 'gemini'
      ? await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              tools: [{ google_search: {} }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
              },
            }),
          },
          10000
        )
      : await fetchWithTimeout(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              temperature: 0.3,
              max_tokens: 2048,
              messages: [
                {
                  role: 'system',
                  content:
                    'Devuelve exclusivamente JSON array valido, sin markdown. Nunca agregues texto fuera del JSON.',
                },
                { role: 'user', content: prompt },
              ],
            }),
          },
          10000
        )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Gemini error: ${response.status} ${errorText}` }, { status: 500 })
    }

    const data = await response.json()
    const text = provider === 'gemini'
      ? data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('\n') ?? ''
      : data?.choices?.[0]?.message?.content ?? ''

    const parsed = extractJsonArray(text)
    const results = parsed
      .map((item) => sanitizeLead(item, body.zona, body.categoria))
      .filter((item): item is SearchLeadResult => item !== null)

    return NextResponse.json(results)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
