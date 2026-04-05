'use client'

import { useMemo, useState, useEffect } from 'react'
import { AppFrame } from '@/components/layout/AppFrame'
import { useMergedLeads } from '@/hooks/useMergedLeads'
import { useSettings } from '@/hooks/useSettings'
import { useToast } from '@/components/ui/ToastProvider'
import type { Lead, LeadStatus, PromptType } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/types'
import { formatRelativeTime } from '@/lib/time'

type ViewMode = 'table' | 'kanban'
type SortKey = 'nombre' | 'categoria' | 'zona' | 'nota' | 'nReseñas' | 'status'

const KANBAN_COLUMNS: LeadStatus[] = ['pending', 'contacted', 'interested', 'converted']

export default function LeadsPage() {
  const { leads } = useMergedLeads()
  const { settings } = useSettings()
  const { showToast } = useToast()

  const [view, setView] = useState<ViewMode>('table')
  const [query, setQuery] = useState('')
  const [statuses, setStatuses] = useState<Record<number, LeadStatus>>({})
  const [sortKey, setSortKey] = useState<SortKey>('nombre')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)
  const [dragLeadId, setDragLeadId] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/leads/status')
        if (!res.ok) return
        const data = (await res.json()) as Record<number, LeadStatus>
        setStatuses(data)
      } catch {
        // noop
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    let list = settings.showLeadsWithoutPhone
      ? leads
      : leads.filter((lead) => lead.telefono.trim().length > 0)

    if (q) {
      list = list.filter((lead) => lead.nombre.toLowerCase().includes(q))
    }

    const sorted = [...list].sort((a, b) => {
      const getValue = (lead: Lead): string | number => {
        if (sortKey === 'status') return STATUS_LABELS[statuses[lead.id] ?? 'pending']
        return lead[sortKey]
      }

      const av = getValue(a)
      const bv = getValue(b)
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), 'es', { sensitivity: 'base' })

      return sortAsc ? cmp : -cmp
    })

    return sorted
  }, [leads, query, settings.showLeadsWithoutPhone, sortKey, sortAsc, statuses])

  const perPage = 10
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageLeads = filtered.slice((page - 1) * perPage, page * perPage)

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const toggleSort = (key: SortKey) => {
    setPage(1)
    if (sortKey === key) {
      setSortAsc((prev) => !prev)
      return
    }
    setSortKey(key)
    setSortAsc(true)
  }

  const updateStatus = async (leadId: number, status: LeadStatus) => {
    setStatuses((prev) => ({ ...prev, [leadId]: status }))
    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      showToast('Estado actualizado', 'success')
    } catch {
      showToast('No se pudo actualizar el estado', 'error')
    }
  }

  const generate = async (lead: Lead, type: PromptType) => {
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          type,
          aiProvider: settings.aiProvider,
          apiKey: settings.aiApiKey || undefined,
          model: type === 'whatsapp' ? settings.whatsappModel : settings.webModel,
          saveToDb: settings.savePromptsToDb,
          supabaseUrl: settings.supabaseUrl || undefined,
          supabaseAnonKey: settings.supabaseAnonKey || undefined,
          developerProfile: settings.developerProfile,
        }),
      })
      if (!res.ok) throw new Error()
      showToast(type === 'whatsapp' ? 'WhatsApp generado' : 'Prompt Web generado', 'success')
    } catch {
      showToast('Error al generar prompt', 'error')
    }
  }

  const quickNote = async (leadId: number) => {
    const content = window.prompt('Escribe una nota corta para este lead')?.trim()
    if (!content) return
    try {
      await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      showToast('Nota guardada', 'success')
    } catch {
      showToast('No se pudo guardar la nota', 'error')
    }
  }

  return (
    <AppFrame
      title="Leads"
      subtitle="Vista tabla y kanban para gestion completa"
      actions={
        <div className="glass-card-solid p-1 flex items-center gap-1">
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1.5 rounded-lg text-xs ${view === 'table' ? 'bg-violet-600 text-white' : 'text-[var(--secondary)] hover:text-[var(--text)]'}`}
          >
            📋 Tabla
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs ${view === 'kanban' ? 'bg-violet-600 text-white' : 'text-[var(--secondary)] hover:text-[var(--text)]'}`}
          >
            🗂️ Kanban
          </button>
        </div>
      }
    >
      <div className="mb-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre"
          className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-violet-400"
        />
      </div>

      {view === 'table' ? (
        <div className="glass-card-solid overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-[var(--bg)] text-[var(--secondary)]">
                <tr>
                  {[
                    ['nombre', 'Negocio'],
                    ['categoria', 'Categoria'],
                    ['zona', 'Zona'],
                    ['nota', 'Nota'],
                    ['nReseñas', 'Reseñas'],
                    ['status', 'Estado'],
                  ].map(([key, label]) => (
                    <th key={key} className="text-left px-4 py-3 font-medium">
                      <button onClick={() => toggleSort(key as SortKey)} className="hover:text-[var(--text)]">
                        {label}
                      </button>
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 font-medium">Ultima accion</th>
                  <th className="text-left px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageLeads.map((lead) => {
                  const status = statuses[lead.id] ?? 'pending'
                  return (
                    <tr key={lead.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3 text-[var(--text)] font-medium">{lead.nombre}</td>
                      <td className="px-4 py-3 text-[var(--secondary)]">{lead.categoria}</td>
                      <td className="px-4 py-3 text-[var(--secondary)]">{lead.zona}</td>
                      <td className="px-4 py-3 text-[var(--text)]">{lead.nota}</td>
                      <td className="px-4 py-3 text-[var(--text)]">{lead.nReseñas}</td>
                      <td className="px-4 py-3">
                        <select
                          value={status}
                          onChange={(event) => updateStatus(lead.id, event.target.value as LeadStatus)}
                          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="contacted">Contactado</option>
                          <option value="interested">Interesado</option>
                          <option value="not_interested">No interesado</option>
                          <option value="converted">Convertido</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[var(--secondary)]">{formatRelativeTime(new Date().toISOString())}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => generate(lead, 'whatsapp')} className="text-xs hover:text-violet-600">💬</button>
                          <button onClick={() => generate(lead, 'web')} className="text-xs hover:text-violet-600">🌐</button>
                          <button onClick={() => quickNote(lead.id)} className="text-xs hover:text-violet-600">📝</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--secondary)]">Pagina {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] disabled:opacity-40">Anterior</button>
              <button disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map((column) => {
            const items = filtered.filter((lead) => (statuses[lead.id] ?? 'pending') === column)
            return (
              <div
                key={column}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (!dragLeadId) return
                  updateStatus(dragLeadId, column)
                  setDragLeadId(null)
                }}
                className="glass-card-solid p-3 min-h-[420px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-[var(--text)]">{STATUS_LABELS[column]}</h2>
                  <span className="text-xs text-[var(--secondary)]">{items.length}</span>
                </div>

                <div className="space-y-2">
                  {items.map((lead) => (
                    <article
                      key={lead.id}
                      draggable
                      onDragStart={() => setDragLeadId(lead.id)}
                      className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center">
                          {lead.nombre.charAt(0)}
                        </div>
                        <p className="text-sm font-medium text-[var(--text)] line-clamp-1">{lead.nombre}</p>
                      </div>
                      <p className="text-xs text-[var(--secondary)]">{lead.categoria}</p>
                      <p className="text-xs text-[var(--secondary)]">{lead.nota}★ en Google</p>
                    </article>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AppFrame>
  )
}
