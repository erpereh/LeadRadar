'use client'

import type { Zona } from '@/lib/types'

const ZONES: Zona[] = [
  'Todas',
  'Ensanche de Vallecas',
  'Villa de Vallecas',
  'El Cañaveral',
  'Vicálvaro',
]

interface ZoneFilterProps {
  active: Zona
  onChange: (zone: Zona) => void
}

export function ZoneFilter({ active, onChange }: ZoneFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ZONES.map((zone) => (
        <button
          key={zone}
          onClick={() => onChange(zone)}
          className={`
            px-4 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200
            ${active === zone
              ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900/30'
              : 'bg-[var(--card)] text-[var(--secondary)] border border-[var(--border)] hover:border-violet-400 hover:text-violet-600'
            }
          `}
        >
          {zone}
        </button>
      ))}
    </div>
  )
}
