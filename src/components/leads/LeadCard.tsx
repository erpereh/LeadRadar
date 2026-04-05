'use client'

import { useEffect, useState } from 'react'
import type { AppSettings, Lead, LeadStatus, Note, PromptType } from '@/lib/types'
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/time'
import { useToast } from '@/components/ui/ToastProvider'

interface LeadCardProps {
  lead: Lead
  index: number
  status: LeadStatus
  settings: AppSettings
  onStatusChange: (leadId: number, status: LeadStatus) => void
  onPromptGenerated: (lead: Lead, type: PromptType, result: string) => void
}

const CATEGORIA_EMOJI: Record<string, string> = {
  Estetica: '💆',
  Estética: '💆',
  Peluqueria: '✂️',
  Peluquería: '✂️',
  Barberia: '💈',
  Barbería: '💈',
  Comercio: '🛒',
  Restaurante: '🍽️',
  Inmobiliaria: '🏠',
  Taller: '🔧',
  Fisioterapia: '🧘',
  Academia: '🎓',
  Gestoría: '📋',
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  pending: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  interested: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  not_interested: 'bg-gray-100 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400',
  converted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

export function LeadCard({ lead, index, status, settings, onStatusChange, onPromptGenerated }: LeadCardProps) {
  const [loadingType, setLoadingType] = useState<PromptType | null>(null)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [savingNote, setSavingNote] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (!showNotes) return
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(`/api/leads/${lead.id}/notes`)
        if (!res.ok || cancelled) return
        const data = (await res.json()) as Note[]
        if (!cancelled) setNotes(data.slice(0, 2))
      } catch {
        if (!cancelled) setNotes([])
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [lead.id, showNotes])

  const handleGenerate = async (type: PromptType) => {
    setLoadingType(type)
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

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido')

      onPromptGenerated(lead, type, data.result)
      showToast('Prompt generado con exito', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error generando prompt', 'error')
    } finally {
      setLoadingType(null)
    }
  }

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setShowStatusMenu(false)
    if (newStatus === status) return
    setUpdatingStatus(true)
    try {
      await fetch(`/api/leads/${lead.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      onStatusChange(lead.id, newStatus)
      showToast('Estado actualizado', 'success')
    } catch {
      showToast('No se pudo actualizar el estado', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSaveNote = async () => {
    const content = newNote.trim()
    if (!content) return

    setSavingNote(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('No se pudo guardar la nota')

      const created = (await res.json()) as Note
      setNotes((prev) => [created, ...prev].slice(0, 2))
      setNewNote('')
      showToast('Nota guardada', 'success')
    } catch {
      showToast('No se pudo guardar la nota', 'error')
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <article
      id={`lead-card-${lead.id}`}
      className="glass-card-solid p-5 flex flex-col gap-4 animate-slide-up hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100 dark:hover:shadow-violet-900/20 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30">
            {CATEGORIA_EMOJI[lead.categoria] ?? '🏢'}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--text)] leading-tight">{lead.nombre}</h3>
            <p className="text-xs text-[var(--secondary)] mt-0.5">{lead.zona}</p>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-sm font-bold violet-gradient-text">{lead.nota}★</span>
          <span className="text-xs text-[var(--secondary)]">{lead.nReseñas.toLocaleString('es')} reseñas</span>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowStatusMenu((v) => !v)}
          disabled={updatingStatus}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${STATUS_COLORS[status]}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {STATUS_LABELS[status]}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showStatusMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
            <div className="absolute left-0 top-full mt-1 z-20 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg shadow-black/10 overflow-hidden min-w-[160px]">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[var(--bg)] transition-colors ${
                    s === status ? 'font-semibold text-violet-600 dark:text-violet-400' : 'text-[var(--text)]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${s === status ? 'bg-violet-500' : 'bg-[var(--border)]'}`} />
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
        <p className="text-xs text-[var(--secondary)] leading-snug line-clamp-2">{lead.presenciaDigital}</p>
      </div>

      <div className="flex gap-2">
        <span className="text-xs shrink-0">⚡</span>
        <p className="text-xs text-violet-600 dark:text-violet-400 font-medium leading-snug line-clamp-2">{lead.branding.painPoint}</p>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="primary"
          size="sm"
          loading={loadingType === 'whatsapp'}
          disabled={loadingType !== null}
          onClick={() => handleGenerate('whatsapp')}
          className="flex-1 text-xs"
        >
          💬 WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          loading={loadingType === 'web'}
          disabled={loadingType !== null}
          onClick={() => handleGenerate('web')}
          className="flex-1 text-xs"
        >
          🌐 Prompt Web
        </Button>
      </div>

      <div className="border-t border-[var(--border)] pt-3">
        <button
          onClick={() => setShowNotes((prev) => !prev)}
          className="text-xs text-[var(--secondary)] hover:text-[var(--text)] transition-colors"
        >
          📝 {showNotes ? 'Ocultar notas' : 'Agregar nota rápida'}
        </button>

        {showNotes && (
          <div className="mt-3 space-y-2">
            <textarea
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              rows={2}
              placeholder="Ej: tiene Instagram activo pero no web"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--secondary)] focus:outline-none focus:border-violet-400"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSaveNote} loading={savingNote} disabled={!newNote.trim()}>
                Guardar nota
              </Button>
            </div>
            {notes.length > 0 && (
              <div className="space-y-1">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                    <p className="text-xs text-[var(--text)] leading-relaxed">{note.content}</p>
                    <p className="text-[11px] text-[var(--secondary)] mt-1">{formatRelativeTime(note.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
