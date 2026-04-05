'use client'

import type { Categoria } from '@/lib/types'

const CATEGORIES: Categoria[] = [
  'Todas',
  'Estética',
  'Peluquería',
  'Barbería',
  'Comercio',
  'Restaurante',
  'Inmobiliaria',
  'Taller',
]

interface CategoryFilterProps {
  active: Categoria
  onChange: (cat: Categoria) => void
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`
            px-3 py-1.5 rounded-full text-xs font-medium
            transition-all duration-200
            ${active === cat
              ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-sm'
              : 'bg-[var(--card)] text-[var(--secondary)] border border-[var(--border)] hover:border-violet-400 hover:text-violet-600'
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
