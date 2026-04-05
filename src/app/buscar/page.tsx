'use client'

import { useMemo, useState, useEffect } from 'react'
import { AppFrame } from '@/components/layout/AppFrame'
import { useSettings } from '@/hooks/useSettings'
import { useMergedLeads } from '@/hooks/useMergedLeads'
import { nextCustomLeadId, isCustomLead } from '@/lib/customLeads'
import type { Categoria, Lead, SearchLeadResult, Zona } from '@/lib/types'
import { useToast } from '@/components/ui/ToastProvider'

const ZONAS: Zona[] = [
  'Ensanche de Vallecas',
  'Villa de Vallecas',
  'El Cañaveral',
  'Vicálvaro',
  'Vallecas',
  'Puente de Vallecas',
  'Moratalaz',
  'Personalizada',
]

const CATEGORIAS: Categoria[] = [
  'Peluquería',
  'Barbería',
  'Taller',
  'Restaurante',
  'Comercio',
  'Fisioterapia',
  'Academia',
  'Gestoría',
  'Cualquiera',
]

const HISTORY_KEY = 'leadradar_search_history_v1'

interface SearchHistoryItem {
  zona: string
  categoria: string
  query: string
}

export default function BuscarPage() {
  const { settings } = useSettings()
  const { leads, customLeads, setCustomLeads } = useMergedLeads()
  const { showToast } = useToast()

  const [zona, setZona] = useState<string>('Ensanche de Vallecas')
  const [categoria, setCategoria] = useState<string>('Cualquiera')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchLeadResult[]>([])
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as SearchHistoryItem[]
      setHistory(parsed.slice(0, 5))
    } catch {
      setHistory([])
    }
  }, [])

  const existingAddresses = useMemo(() => new Set(leads.map((lead) => `${lead.nombre}::${lead.direccion}`.toLowerCase())), [leads])

  const search = async (input?: SearchHistoryItem) => {
    const nextZona = input?.zona ?? zona
    const nextCategoria = input?.categoria ?? categoria
    const nextQuery = input?.query ?? query

    setLoading(true)
    try {
      const res = await fetch('/api/search-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zona: nextZona,
          categoria: nextCategoria,
          query: nextQuery || undefined,
          aiProvider: settings.aiProvider,
          apiKey: settings.aiApiKey || undefined,
          model: settings.searchModel,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error de búsqueda')

      setResults((data as SearchLeadResult[]).slice(0, 20))
      const item: SearchHistoryItem = { zona: nextZona, categoria: nextCategoria, query: nextQuery }
      const nextHistory = [item, ...history.filter((h) => JSON.stringify(h) !== JSON.stringify(item))].slice(0, 5)
      setHistory(nextHistory)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory))
      showToast('Busqueda completada', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error de búsqueda', 'error')
    } finally {
      setLoading(false)
    }
  }

  const addLead = async (result: SearchLeadResult) => {
    const id = nextCustomLeadId(leads)

    const newLead: Lead = {
      id,
      nombre: result.nombre,
      categoria: result.categoria,
      zona: result.zona,
      direccion: result.direccion,
      telefono: result.telefono,
      nota: result.nota,
      nReseñas: result.nReseñas,
      presenciaDigital: result.presenciaDigital,
      branding: {
        tono: 'Cercano y profesional',
        audiencia: 'Negocio local de la zona',
        painPoint: 'Sin web propia visible para captar clientes nuevos desde Google',
        propuesta: 'Landing optimizada con CTA directo a WhatsApp y SEO local',
      },
      reseñas: ['Sin reseñas importadas todavía'],
    }

    setCustomLeads([newLead, ...customLeads])

    try {
      await fetch(`/api/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      })
    } catch {
      // noop
    }

    showToast('Negocio añadido a LeadRadar', 'success')
  }

  const removeLead = async (lead: Lead) => {
    if (!isCustomLead(lead.id)) return
    setCustomLeads(customLeads.filter((item) => item.id !== lead.id))

    try {
      await fetch(`/api/leads/${lead.id}/status`, { method: 'DELETE' })
    } catch {
      // noop
    }

    showToast('Lead custom eliminado', 'info')
  }

  return (
    <AppFrame title="Buscar" subtitle="Encuentra negocios en Madrid sin web y añadelos" >
      <div className="glass-card-solid p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca por keyword opcional"
            className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          />

          <select value={zona} onChange={(event) => setZona(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm">
            {ZONAS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <select value={categoria} onChange={(event) => setCategoria(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm">
            {CATEGORIAS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <button onClick={() => search()} disabled={loading} className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white text-sm font-medium px-3 py-2 disabled:opacity-50">
            {loading ? 'Buscando...' : 'Buscar negocios sin web'}
          </button>
        </div>

        {history.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {history.map((item, index) => (
              <button
                key={`${item.zona}-${item.categoria}-${index}`}
                onClick={() => {
                  setZona(item.zona)
                  setCategoria(item.categoria)
                  setQuery(item.query)
                  search(item)
                }}
                className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-xs text-[var(--secondary)] hover:text-[var(--text)]"
              >
                {item.categoria} · {item.zona}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {results.map((result) => {
          const duplicate = existingAddresses.has(`${result.nombre}::${result.direccion}`.toLowerCase())
          return (
            <article key={`${result.nombre}-${result.direccion}`} className="glass-card-solid p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text)]">{result.nombre}</h2>
                  <p className="text-xs text-[var(--secondary)] mt-1">{result.categoria} · {result.zona}</p>
                  <p className="text-xs text-[var(--secondary)] mt-2">📍 {result.direccion}</p>
                  <p className="text-xs text-[var(--secondary)] mt-1">📞 {result.telefono || 'Sin telefono'}</p>
                  <p className="text-xs text-[var(--secondary)] mt-1">⭐ {result.nota} ({result.nReseñas})</p>
                </div>
                <button
                  disabled={duplicate}
                  onClick={() => addLead(result)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium bg-violet-600 text-white disabled:opacity-40"
                >
                  {duplicate ? 'Ya añadido' : '+ Añadir a LeadRadar'}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {customLeads.length > 0 && (
        <div className="mt-7">
          <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Leads añadidos manualmente</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {customLeads.map((lead) => (
              <article key={lead.id} className="glass-card-solid p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{lead.nombre}</p>
                  <p className="text-xs text-[var(--secondary)]">{lead.categoria} · {lead.zona}</p>
                </div>
                <button onClick={() => removeLead(lead)} className="text-xs rounded-lg border border-[var(--border)] px-3 py-1.5 hover:text-red-500">
                  Quitar
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </AppFrame>
  )
}
