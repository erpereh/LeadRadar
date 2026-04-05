'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppFrame } from '@/components/layout/AppFrame'
import { useMergedLeads } from '@/hooks/useMergedLeads'
import type { PromptRecord } from '@/lib/types'
import { formatRelativeTime } from '@/lib/time'
import { useToast } from '@/components/ui/ToastProvider'

export default function HistorialPage() {
  const { leads } = useMergedLeads()
  const { showToast } = useToast()
  const [prompts, setPrompts] = useState<PromptRecord[]>([])
  const [selected, setSelected] = useState<PromptRecord | null>(null)

  const load = async () => {
    try {
      const res = await fetch('/api/prompts')
      const data = (await res.json()) as PromptRecord[]
      if (!res.ok) return

      const withNames = data.map((prompt) => ({
        ...prompt,
        lead_nombre: leads.find((lead) => lead.id === prompt.lead_id)?.nombre ?? `Lead #${prompt.lead_id}`,
      }))
      setPrompts(withNames)
    } catch {
      setPrompts([])
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads.length])

  const stats = useMemo(() => {
    const total = prompts.length
    const wa = prompts.filter((prompt) => prompt.type === 'whatsapp').length
    const web = prompts.filter((prompt) => prompt.type === 'web').length

    const countByLead = prompts.reduce<Record<string, number>>((acc, prompt) => {
      const key = prompt.lead_nombre ?? `Lead #${prompt.lead_id}`
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

    const topLead = Object.entries(countByLead).sort((a, b) => b[1] - a[1])[0]
    return { total, wa, web, topLead }
  }, [prompts])

  const removePrompt = async (id: string) => {
    setPrompts((prev) => prev.filter((item) => item.id !== id))
    try {
      await fetch(`/api/prompts/${id}`, { method: 'DELETE' })
      showToast('Prompt eliminado', 'success')
    } catch {
      showToast('No se pudo eliminar', 'error')
    }
  }

  return (
    <AppFrame title="Historial" subtitle="Todos los prompts generados en un solo lugar">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="glass-card-solid p-4">
          <p className="text-xs text-[var(--secondary)]">Total prompts</p>
          <p className="text-2xl font-bold text-[var(--text)] mt-2">{stats.total}</p>
        </div>
        <div className="glass-card-solid p-4">
          <p className="text-xs text-[var(--secondary)]">WhatsApp vs Web</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs w-16 text-[var(--secondary)]">💬 WA</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--bg)] overflow-hidden">
                <div className="h-full bg-violet-500" style={{ width: `${stats.total ? (stats.wa / stats.total) * 100 : 0}%` }} />
              </div>
              <span className="text-xs text-[var(--text)]">{stats.wa}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16 text-[var(--secondary)]">🌐 Web</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--bg)] overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${stats.total ? (stats.web / stats.total) * 100 : 0}%` }} />
              </div>
              <span className="text-xs text-[var(--text)]">{stats.web}</span>
            </div>
          </div>
        </div>
        <div className="glass-card-solid p-4">
          <p className="text-xs text-[var(--secondary)]">Negocio con mas prompts</p>
          <p className="text-sm font-semibold text-[var(--text)] mt-2">{stats.topLead?.[0] ?? 'Sin datos'}</p>
          <p className="text-xs text-[var(--secondary)] mt-1">{stats.topLead?.[1] ?? 0} prompts</p>
        </div>
      </div>

      <div className="glass-card-solid overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="bg-[var(--bg)] text-[var(--secondary)]">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Negocio</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 font-medium">Vista previa</th>
                <th className="text-left px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((prompt) => (
                <tr key={prompt.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 text-[var(--text)]">{prompt.lead_nombre}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2 py-1 text-xs bg-[var(--bg)] text-[var(--text)]">
                      {prompt.type === 'whatsapp' ? '💬 WhatsApp' : '🌐 Prompt Web'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--secondary)]">{formatRelativeTime(prompt.created_at)}</td>
                  <td className="px-4 py-3 text-[var(--secondary)]">{prompt.content.slice(0, 80)}{prompt.content.length > 80 ? '...' : ''}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(prompt)} className="text-xs hover:text-violet-600">👁️ Ver</button>
                      <button onClick={() => navigator.clipboard.writeText(prompt.content)} className="text-xs hover:text-violet-600">📋 Copiar</button>
                      <button onClick={() => removePrompt(prompt.id)} className="text-xs hover:text-red-500">🗑️ Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-[var(--card)] border-l border-[var(--border)] p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-[var(--secondary)]">{selected.lead_nombre}</p>
                <h2 className="text-lg font-semibold text-[var(--text)]">{selected.type === 'whatsapp' ? 'Mensaje WhatsApp' : 'Prompt Web'}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-sm text-[var(--secondary)]">Cerrar</button>
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(selected.content)}
              className="mb-4 rounded-lg bg-violet-600 text-white text-xs px-3 py-1.5"
            >
              Copiar
            </button>

            <pre className="whitespace-pre-wrap text-xs text-[var(--text)] leading-relaxed bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4">
              {selected.content}
            </pre>
          </div>
        </>
      )}
    </AppFrame>
  )
}
