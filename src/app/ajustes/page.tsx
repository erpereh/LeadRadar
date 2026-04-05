'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { AppFrame } from '@/components/layout/AppFrame'
import { useSettings } from '@/hooks/useSettings'
import { useMergedLeads } from '@/hooks/useMergedLeads'
import type { AppSettings } from '@/lib/types'
import { useToast } from '@/components/ui/ToastProvider'

interface DbStats {
  leadStatus: number
  notes: number
  prompts: number
}

export default function AjustesPage() {
  const { settings, updateSettings } = useSettings()
  const { leads } = useMergedLeads()
  const { showToast } = useToast()
  const { resolvedTheme, setTheme } = useTheme()

  const [draft, setDraft] = useState<AppSettings>(settings)
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [dbStats, setDbStats] = useState<DbStats | null>(null)
  const [aiPingLoading, setAiPingLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setDraft(settings)
  }, [settings])

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  const saveAll = () => {
    updateSettings(draft)
    showToast('Ajustes guardados', 'success')
  }

  const verifyGemini = async () => {
    setGeminiStatus('idle')
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: leads[0],
          type: 'whatsapp',
          aiProvider: draft.aiProvider,
          apiKey: draft.aiApiKey || undefined,
          model: draft.whatsappModel,
          saveToDb: false,
          developerProfile: draft.developerProfile,
        }),
      })
      setGeminiStatus(res.ok ? 'ok' : 'fail')
    } catch {
      setGeminiStatus('fail')
    }
  }

  const pingAiProvider = async () => {
    setAiPingLoading(true)
    try {
      const model = draft.whatsappModel || (draft.aiProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-2.0-flash-lite')
      const response = await fetch('/api/ai/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiProvider: draft.aiProvider,
          apiKey: draft.aiApiKey || undefined,
          model,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        const errorText = data?.error ? String(data.error) : 'No se pudo conectar con el proveedor'
        showToast(`Fallo IA: ${errorText}`, 'error')
        return
      }

      showToast(`IA OK (${data.model}) · ${data.latencyMs}ms`, 'success')
    } catch {
      showToast('No se pudo probar el proveedor IA', 'error')
    } finally {
      setAiPingLoading(false)
    }
  }

  const verifySupabase = async () => {
    setSupabaseStatus('idle')
    try {
      const res = await fetch('/api/verify-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: draft.supabaseUrl || undefined, anonKey: draft.supabaseAnonKey || undefined }),
      })
      const data = await res.json()
      setSupabaseStatus(data.connected ? 'ok' : 'fail')
    } catch {
      setSupabaseStatus('fail')
    }
  }

  const verifySchema = async () => {
    try {
      const res = await fetch('/api/verify-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: draft.supabaseUrl || undefined,
          anonKey: draft.supabaseAnonKey || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.connected) {
        throw new Error('No se pudo verificar el esquema')
      }
      showToast(`Esquema verificado (${(data.tables ?? []).join(', ')})`, 'success')
    } catch {
      showToast('No se pudo verificar el esquema', 'error')
    }
  }

  const loadDbStats = async () => {
    try {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('No disponible')
      const data = (await res.json()) as DbStats
      setDbStats(data)
      showToast('Estadisticas actualizadas', 'success')
    } catch {
      showToast('No se pudieron cargar las estadisticas', 'error')
    }
  }

  const exportCsv = async () => {
    try {
      const statusRes = await fetch('/api/leads/status')
      const statuses = statusRes.ok ? (await statusRes.json()) as Record<number, string> : {}
      const rows = [
        'id,nombre,categoria,zona,direccion,telefono,nota,nReseñas,status',
        ...leads.map((lead) => [
          lead.id,
          safeCsv(lead.nombre),
          safeCsv(lead.categoria),
          safeCsv(lead.zona),
          safeCsv(lead.direccion),
          safeCsv(lead.telefono),
          lead.nota,
          lead.nReseñas,
          statuses[lead.id] ?? 'pending',
        ].join(',')),
      ]
      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'leadradar-leads.csv'
      link.click()
      URL.revokeObjectURL(url)
      showToast('CSV exportado', 'success')
    } catch {
      showToast('No se pudo exportar CSV', 'error')
    }
  }

  return (
    <AppFrame title="Ajustes" subtitle="Configura APIs, perfil y preferencias de la app">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="glass-card-solid p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text)]">Conexiones API</h2>

          <div className="space-y-2">
            <p className="text-xs text-[var(--secondary)]">PROVEEDOR IA</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <select
                value={draft.aiProvider}
                onChange={(e) => setDraft({ ...draft, aiProvider: e.target.value as AppSettings['aiProvider'] })}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs"
              >
                <option value="groq">Groq</option>
                <option value="gemini">Gemini</option>
              </select>
              <input
                type="password"
                value={draft.aiApiKey}
                onChange={(e) => setDraft({ ...draft, aiApiKey: e.target.value, geminiApiKey: e.target.value })}
                className="md:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs"
                placeholder={draft.aiProvider === 'groq' ? 'gsk_...' : 'AIza...'}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={draft.whatsappModel} onChange={(e) => setDraft({ ...draft, whatsappModel: e.target.value })} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs" placeholder="Modelo WhatsApp" />
              <input value={draft.webModel} onChange={(e) => setDraft({ ...draft, webModel: e.target.value })} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs" placeholder="Modelo Web" />
              <input value={draft.searchModel} onChange={(e) => setDraft({ ...draft, searchModel: e.target.value })} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs" placeholder="Modelo Busqueda" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={verifyGemini} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs">Verificar</button>
              <button onClick={pingAiProvider} disabled={aiPingLoading} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs disabled:opacity-50">
                {aiPingLoading ? 'Probando...' : 'Probar IA'}
              </button>
              <button onClick={saveAll} className="rounded-lg bg-violet-600 text-white px-3 py-1.5 text-xs">Guardar</button>
              <span className="text-xs text-[var(--secondary)]">Estado: {geminiStatus === 'ok' ? '✅ Conectado' : geminiStatus === 'fail' ? '❌ Sin configurar' : '—'}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--secondary)]">SUPABASE</p>
            <input value={draft.supabaseUrl} onChange={(e) => setDraft({ ...draft, supabaseUrl: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm" placeholder="https://xxx.supabase.co" />
            <input type="password" value={draft.supabaseAnonKey} onChange={(e) => setDraft({ ...draft, supabaseAnonKey: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm" placeholder="eyJ..." />
            <div className="flex items-center gap-2">
              <button onClick={verifySupabase} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs">Verificar conexión</button>
              <button onClick={saveAll} className="rounded-lg bg-violet-600 text-white px-3 py-1.5 text-xs">Guardar</button>
              <span className="text-xs text-[var(--secondary)]">Estado: {supabaseStatus === 'ok' ? '✅ Conectado' : supabaseStatus === 'fail' ? '❌ Sin configurar' : '—'}</span>
            </div>
          </div>
        </section>

        <section className="glass-card-solid p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text)]">Perfil del desarrollador</h2>
          <input value={draft.developerProfile.nombre} onChange={(e) => setDraft({ ...draft, developerProfile: { ...draft.developerProfile, nombre: e.target.value } })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm" placeholder="Nombre" />
          <input value={draft.developerProfile.ciudad} onChange={(e) => setDraft({ ...draft, developerProfile: { ...draft.developerProfile, ciudad: e.target.value } })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm" placeholder="Ciudad" />
          <input value={draft.developerProfile.proyectoReferencia} onChange={(e) => setDraft({ ...draft, developerProfile: { ...draft.developerProfile, proyectoReferencia: e.target.value } })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm" placeholder="Proyecto referencia" />

          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={draft.developerProfile.precioMin} onChange={(e) => setDraft({ ...draft, developerProfile: { ...draft.developerProfile, precioMin: Number(e.target.value) || 0 } })} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm" placeholder="Precio minimo" />
            <input type="number" value={draft.developerProfile.precioMax} onChange={(e) => setDraft({ ...draft, developerProfile: { ...draft.developerProfile, precioMax: Number(e.target.value) || 0 } })} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm" placeholder="Precio maximo" />
          </div>

          <h3 className="text-sm font-semibold text-[var(--text)] pt-2 border-t border-[var(--border)]">Preferencias</h3>
          <label className="flex items-center justify-between text-sm text-[var(--text)]">
            Tema
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="text-xs rounded-lg border border-[var(--border)] px-3 py-1.5">
              {mounted ? (isDark ? 'Modo oscuro' : 'Modo claro') : 'Tema'}
            </button>
          </label>
          <label className="flex items-center justify-between text-sm text-[var(--text)]">
            Guardar prompts automaticamente
            <input type="checkbox" checked={draft.savePromptsToDb} onChange={(e) => setDraft({ ...draft, savePromptsToDb: e.target.checked })} />
          </label>
          <label className="flex items-center justify-between text-sm text-[var(--text)]">
            Mostrar leads sin telefono
            <input type="checkbox" checked={draft.showLeadsWithoutPhone} onChange={(e) => setDraft({ ...draft, showLeadsWithoutPhone: e.target.checked })} />
          </label>
          <button onClick={saveAll} className="rounded-lg bg-violet-600 text-white px-3 py-1.5 text-xs">Guardar ajustes</button>
        </section>

        <section className="glass-card-solid p-5 space-y-4 xl:col-span-2">
          <h2 className="text-sm font-semibold text-[var(--text)]">IAs recomendadas (free-friendly)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-xs">
              <thead className="text-[var(--secondary)]">
                <tr>
                  <th className="text-left py-2">Funcion</th><th className="text-left py-2">Modelo</th><th className="text-left py-2">Proveedor</th><th className="text-left py-2">Limite gratuito</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text)]">
                <tr><td className="py-2">Msg WhatsApp</td><td>llama-3.3-70b-versatile</td><td>Groq</td><td>Free plan</td></tr>
                <tr><td className="py-2">Prompt Web</td><td>llama-3.3-70b-versatile</td><td>Groq</td><td>Free plan</td></tr>
                <tr><td className="py-2">Busqueda leads</td><td>groq/compound-mini</td><td>Groq</td><td>Free plan</td></tr>
                <tr><td className="py-2">Alternativa</td><td>gemini-2.0-flash-lite</td><td>Google</td><td>Puede requerir billing</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-semibold text-[var(--text)]">Base de datos</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={verifySchema} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs">Verificar esquema</button>
            <button onClick={loadDbStats} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs">Ver estadisticas</button>
            <button onClick={exportCsv} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs">Exportar leads a CSV</button>
          </div>
          {dbStats && (
            <p className="text-xs text-[var(--secondary)]">lead_status: {dbStats.leadStatus} · notes: {dbStats.notes} · generated_prompts: {dbStats.prompts}</p>
          )}
        </section>
      </div>
    </AppFrame>
  )
}

function safeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}
