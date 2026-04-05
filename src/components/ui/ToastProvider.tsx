'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  kind: ToastKind
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToasts((prev) => [{ id, message, kind }, ...prev].slice(0, 5))
    window.setTimeout(() => dismiss(id), 4000)
  }, [dismiss])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed bottom-4 right-4 z-[100] flex w-[min(90vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            onClick={() => dismiss(toast.id)}
            className={`glass-card-solid w-full cursor-pointer px-4 py-3 text-left text-sm transition-transform hover:translate-y-[-1px] ${kindClass(toast.kind)}`}
          >
            {toast.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function kindClass(kind: ToastKind) {
  if (kind === 'success') return 'border-emerald-300/60 text-emerald-700 dark:text-emerald-300'
  if (kind === 'error') return 'border-red-300/60 text-red-700 dark:text-red-300'
  return 'border-[var(--border)] text-[var(--text)]'
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}
