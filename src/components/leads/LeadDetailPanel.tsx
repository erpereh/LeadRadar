'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Lead, PromptType, Note, SavedPrompt } from '@/lib/types'

interface LeadDetailPanelProps {
  lead: Lead
  promptType: PromptType
  promptResult: string
  onClose: () => void
}

type Tab = 'prompt' | 'notes' | 'history'

export function LeadDetailPanel({ lead, promptType, promptResult, onClose }: LeadDetailPanelProps) {
  const [tab, setTab] = useState<Tab>('prompt')
  const [copied, setCopied] = useState(false)

  // Notes state
  const [notes, setNotes] = useState<Note[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Prompt history state
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [loadingPrompts, setLoadingPrompts] = useState(false)

  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}/notes`)
      if (res.ok) setNotes(await res.json())
    } finally {
      setLoadingNotes(false)
    }
  }, [lead.id])

  const fetchPrompts = useCallback(async () => {
    setLoadingPrompts(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}/prompts`)
      if (res.ok) setSavedPrompts(await res.json())
    } finally {
      setLoadingPrompts(false)
    }
  }, [lead.id])

  useEffect(() => {
    if (tab === 'notes') fetchNotes()
    if (tab === 'history') fetchPrompts()
  }, [tab, fetchNotes, fetchPrompts])

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddNote = async () => {
    const content = newNote.trim()
    if (!content) return
    setSavingNote(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const created = await res.json()
        setNotes((prev) => [created, ...prev])
        setNewNote('')
      }
    } finally {
      setSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
    await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="
        fixed right-0 top-0 h-full w-full max-w-lg z-50
        bg-[var(--card)] border-l border-[var(--border)]
        shadow-2xl flex flex-col
        animate-slide-up
      ">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-[var(--border)] shrink-0">
          <div>
            <h2 className="font-bold text-lg text-[var(--text)]">{lead.nombre}</h2>
            <p className="text-xs text-[var(--secondary)] mt-0.5">{lead.categoria} · {lead.zona}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] shrink-0 px-6">
          {([
            ['prompt', promptType === 'whatsapp' ? '💬 Mensaje' : '🌐 Prompt'],
            ['notes', '📝 Notas'],
            ['history', '🕐 Historial'],
          ] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`
                px-4 py-3 text-xs font-medium border-b-2 transition-colors
                ${tab === t
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'border-transparent text-[var(--secondary)] hover:text-[var(--text)]'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

          {/* ── PROMPT TAB ── */}
          {tab === 'prompt' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--text)]">
                  {promptType === 'whatsapp' ? 'Mensaje WhatsApp generado' : 'Prompt web generado'}
                </p>
                <button
                  onClick={() => handleCopy(promptResult)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${copied
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-[var(--bg)] text-[var(--secondary)] hover:text-[var(--text)]'
                    }
                  `}
                >
                  {copied ? '✓ Copiado' : '⎘ Copiar'}
                </button>
              </div>
              <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap text-[var(--text)] flex-1 overflow-y-auto">
                {promptResult}
              </div>

              {/* Branding */}
              <div className="glass-card-solid p-4 flex flex-col gap-3">
                <p className="text-sm font-semibold text-[var(--text)]">Análisis de branding</p>
                <BrandingRow label="Tono" value={lead.branding.tono} />
                <BrandingRow label="Audiencia" value={lead.branding.audiencia} />
                <BrandingRow label="Pain point" value={lead.branding.painPoint} accent />
                <BrandingRow label="Propuesta" value={lead.branding.propuesta} />
              </div>

              {/* Reseñas */}
              <div className="glass-card-solid p-4 flex flex-col gap-2">
                <p className="text-sm font-semibold text-[var(--text)]">
                  Reseñas <span className="text-xs font-normal text-[var(--secondary)]">({lead.nReseñas} en Google)</span>
                </p>
                {lead.reseñas.map((r, i) => (
                  <blockquote key={i} className="text-xs text-[var(--secondary)] pl-3 border-l-2 border-violet-200 dark:border-violet-700 italic leading-relaxed">
                    &ldquo;{r}&rdquo;
                  </blockquote>
                ))}
              </div>
            </>
          )}

          {/* ── NOTES TAB ── */}
          {tab === 'notes' && (
            <>
              {/* Add note */}
              <div className="glass-card-solid p-4 flex flex-col gap-3">
                <p className="text-sm font-semibold text-[var(--text)]">Nueva nota</p>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Escribe una nota sobre este lead..."
                  rows={3}
                  className="
                    w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl
                    px-3 py-2 text-sm text-[var(--text)] resize-none
                    placeholder:text-[var(--secondary)] focus:outline-none
                    focus:border-violet-400 transition-colors
                  "
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote()
                  }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={savingNote || !newNote.trim()}
                  className="
                    self-end px-4 py-2 rounded-xl text-xs font-medium text-white
                    bg-gradient-to-r from-violet-600 to-purple-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:opacity-90 transition-opacity
                  "
                >
                  {savingNote ? 'Guardando...' : 'Guardar nota ⌘↵'}
                </button>
              </div>

              {/* Notes list */}
              {loadingNotes ? (
                <div className="flex items-center justify-center py-8 text-[var(--secondary)] text-sm">Cargando notas...</div>
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-[var(--secondary)]">
                  <span className="text-3xl">📝</span>
                  <p className="text-sm">Sin notas todavía</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {notes.map((note) => (
                    <div key={note.id} className="glass-card-solid p-4 flex gap-3">
                      <div className="flex-1">
                        <p className="text-xs text-[var(--text)] leading-relaxed whitespace-pre-wrap">{note.content}</p>
                        <p className="text-xs text-[var(--secondary)] mt-2">{formatDate(note.created_at)}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-[var(--secondary)] hover:text-red-500 transition-colors shrink-0"
                        title="Eliminar nota"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === 'history' && (
            <>
              {loadingPrompts ? (
                <div className="flex items-center justify-center py-8 text-[var(--secondary)] text-sm">Cargando historial...</div>
              ) : savedPrompts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-[var(--secondary)]">
                  <span className="text-3xl">🕐</span>
                  <p className="text-sm">Sin prompts generados todavía</p>
                  <p className="text-xs text-center">Los mensajes y prompts que generes se guardarán aquí automáticamente</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {savedPrompts.map((p) => (
                    <div key={p.id} className="glass-card-solid p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--text)]">
                          {p.type === 'whatsapp' ? '💬 WhatsApp' : '🌐 Prompt Web'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--secondary)]">{formatDate(p.created_at)}</span>
                          <button
                            onClick={() => handleCopy(p.content)}
                            className="text-xs text-[var(--secondary)] hover:text-violet-600 transition-colors"
                            title="Copiar"
                          >
                            ⎘
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--secondary)] line-clamp-3 leading-relaxed font-mono">
                        {p.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Contact footer */}
        <div className="shrink-0 px-6 py-4 border-t border-[var(--border)] flex items-center gap-4">
          <a
            href={`tel:${lead.telefono}`}
            className="flex items-center gap-1.5 text-xs text-[var(--secondary)] hover:text-violet-600 transition-colors"
          >
            📞 {lead.telefono}
          </a>
          <span className="text-[var(--border)]">·</span>
          <span className="text-xs text-[var(--secondary)] truncate">📍 {lead.direccion}</span>
        </div>
      </div>
    </>
  )
}

function BrandingRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-[var(--secondary)] mb-0.5">{label}</p>
      <p className={`text-xs leading-relaxed ${accent ? 'text-violet-600 dark:text-violet-400 font-medium' : 'text-[var(--text)]'}`}>
        {value}
      </p>
    </div>
  )
}
