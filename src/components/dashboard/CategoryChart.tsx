'use client'

import { useEffect, useState } from 'react'
import type { Lead, Categoria } from '@/lib/types'

interface CategoryChartProps {
  leads: Lead[]
  activeCategory: Categoria
  onCategoryClick: (cat: Categoria) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  Estética: '#A78BFA',
  Peluquería: '#8B5CF6',
  Barbería: '#7C3AED',
  Comercio: '#6D28D9',
  Restaurante: '#C084FC',
  Inmobiliaria: '#9333EA',
  Taller: '#7E22CE',
}

export function CategoryChart({ leads, activeCategory, onCategoryClick }: CategoryChartProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  const categories = ['Barbería', 'Peluquería', 'Taller', 'Comercio', 'Restaurante', 'Inmobiliaria', 'Estética'] as Categoria[]

  const counts = categories.map((cat) => ({
    cat,
    count: leads.filter((l) => l.categoria === cat).length,
  }))

  const max = Math.max(...counts.map((c) => c.count), 1)

  return (
    <div className="glass-card-solid p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm text-[var(--text)]">Leads por categoría</h3>
          <p className="text-xs text-[var(--secondary)] mt-0.5">Distribución actual</p>
        </div>
        <span className="text-xs font-medium text-[var(--secondary)] bg-[var(--bg)] px-2.5 py-1 rounded-full">
          {leads.length} total
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {counts.map(({ cat, count }, i) => {
          const pct = (count / max) * 100
          const isActive = activeCategory === cat || activeCategory === 'Todas'

          return (
            <button
              key={cat}
              onClick={() => onCategoryClick(activeCategory === cat ? 'Todas' : cat)}
              className="flex items-center gap-3 group text-left w-full"
            >
              {/* Label */}
              <span className="w-24 text-xs text-[var(--secondary)] group-hover:text-[var(--text)] transition-colors shrink-0">
                {cat}
              </span>

              {/* Bar track */}
              <div className="flex-1 h-2 bg-[var(--bg)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: animated ? `${Math.max(pct, count > 0 ? 8 : 0)}%` : '0%',
                    transitionDelay: `${i * 80}ms`,
                    background: isActive
                      ? `linear-gradient(90deg, ${CATEGORY_COLORS[cat] ?? '#7C3AED'}, #A855F7)`
                      : 'var(--border)',
                    opacity: isActive ? 1 : 0.4,
                  }}
                />
              </div>

              {/* Count */}
              <span className="w-4 text-xs font-semibold text-[var(--text)] shrink-0">
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
