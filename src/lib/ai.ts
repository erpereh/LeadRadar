import type { AiProvider, DeveloperProfile, Lead, PromptType } from './types'
import { fetchWithTimeout } from './fetchWithTimeout'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

interface GeneratePromptOptions {
  provider?: AiProvider
  apiKey?: string
  model?: string
  developerProfile?: DeveloperProfile
}

function buildSystemPrompt(lead: Lead, type: PromptType, profile?: DeveloperProfile): string {
  const nombre = profile?.nombre ?? 'David'
  const ciudad = profile?.ciudad ?? 'Madrid'
  const proyecto = profile?.proyectoReferencia ?? 'Focus Club Vallecas (gym)'
  const precioMin = profile?.precioMin ?? 400
  const precioMax = profile?.precioMax ?? 800

  if (type === 'whatsapp') {
    return `Eres un experto en ventas de webs para pequeños negocios locales en Madrid.
Tu cliente es ${nombre}, desarrollador web freelance de ${ciudad}.
Precio orientativo: ${precioMin}-${precioMax}€. Proyecto anterior de referencia: ${proyecto}.
Genera un mensaje de WhatsApp de prospección de máximo 6 líneas.
Incluye: la nota real y número de reseñas de Google, 1 pain point específico para SU sector,
1 resultado concreto que ${nombre} haría para ellos, propuesta de reunión breve de 20 min sin presión.
Tono informal pero profesional, como vecino del barrio. Máximo 2 emojis.
Devuelve SOLO el texto del WhatsApp, sin explicaciones ni títulos.`
  }

  return `Eres un experto desarrollador web freelance especializado en negocios locales en Madrid.
Genera un prompt detallado y completo para construir la web de este negocio con Claude Code o Cursor.
El prompt debe incluir:

1. CONTEXTO DEL NEGOCIO — nombre, sector, dirección, zona, teléfono, presencia digital actual
2. PÚBLICO OBJETIVO — audiencia específica del negocio basada en sus reseñas y sector
3. TONO Y BRANDING — personalidad de la marca, colores sugeridos coherentes con el sector, tipografía recomendada
4. PÁGINAS Y SECCIONES — lista exacta de páginas que necesita este negocio concreto (no genérico)
5. FUNCIONALIDADES CLAVE — reservas online, catálogo, WhatsApp flotante, formulario de contacto, galería, mapa, etc. Solo las que aplican a este negocio
6. SEO LOCAL — palabras clave específicas para su sector + zona de Madrid que deben aparecer en la web
7. COPY DE EJEMPLO — propón textos reales para el hero, el about y el CTA principal basándote en sus reseñas reales
8. STACK SUGERIDO — Next.js + Tailwind + Vercel, con notas específicas si necesita algo extra (ej: sistema de reservas)
9. REFERENCIAS DE DISEÑO — describe el estilo visual ideal para este negocio concreto

El resultado debe ser un prompt listo para pegar en Claude Code que genere una web completa y profesional.
Basa todo en la información real del negocio proporcionada. No uses frases genéricas.
Devuelve SOLO el prompt, sin explicaciones previas ni títulos.`
}

function buildLeadContext(lead: Lead): string {
  return `
Negocio: ${lead.nombre}
Categoría: ${lead.categoria}
Zona: ${lead.zona}
Dirección: ${lead.direccion}
Teléfono: ${lead.telefono}
Nota Google: ${lead.nota} estrellas (${lead.nReseñas} reseñas)
Presencia digital: ${lead.presenciaDigital}

Branding:
- Tono: ${lead.branding.tono}
- Audiencia: ${lead.branding.audiencia}
- Pain point: ${lead.branding.painPoint}
- Propuesta: ${lead.branding.propuesta}

Reseñas destacadas:
${lead.reseñas.map((r, i) => `${i + 1}. "${r}"`).join('\n')}
`.trim()
}

export async function generatePrompt(
  lead: Lead,
  type: PromptType,
  options: GeneratePromptOptions = {}
): Promise<string> {
  const provider = options.provider ?? 'groq'
  const apiKey = options.apiKey
  const model = options.model ?? (provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-2.0-flash-lite')

  if (!apiKey) throw new Error('AI_API_KEY no configurada')

  const systemPrompt = buildSystemPrompt(lead, type, options.developerProfile)
  const userContent = buildLeadContext(lead)

  if (provider === 'gemini') {
    return generateWithGemini(apiKey, model, `${systemPrompt}\n\n---\n\n${userContent}`)
  }

  return generateWithGroq(apiKey, model, systemPrompt, userContent)
}

async function generateWithGemini(apiKey: string, model: string, content: string): Promise<string> {
  const response = await fetchWithTimeout(
    `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: content }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
      }),
    },
    10000
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${response.status} — ${error}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Respuesta vacía de Gemini')
  return text.trim()
}

async function generateWithGroq(apiKey: string, model: string, systemPrompt: string, userContent: string): Promise<string> {
  const response = await fetchWithTimeout(
    GROQ_API_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      }),
    },
    10000
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${response.status} — ${error}`)
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('Respuesta vacía de Groq')
  return String(text).trim()
}
