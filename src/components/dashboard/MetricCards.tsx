import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import type { Lead } from '@/lib/types'

interface MetricCardProps {
  label: string
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  icon: React.ReactNode
  delay?: number
}

function MetricCard({ label, value, decimals = 0, suffix = '', prefix = '', icon, delay = 0 }: MetricCardProps) {
  return (
    <div
      className="glass-card-solid p-5 flex-1 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[var(--secondary)] font-medium">{label}</p>
        <div className="
          w-9 h-9 rounded-xl flex items-center justify-center
          bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400
        ">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold violet-gradient-text">
        <AnimatedCounter
          target={value}
          decimals={decimals}
          suffix={suffix}
          prefix={prefix}
          duration={1400}
        />
      </p>
    </div>
  )
}

interface MetricCardsProps {
  leads?: Lead[]
}

export function MetricCards({ leads = [] }: MetricCardsProps) {
  const totalLeads = leads.length || 11
  const totalReviews = leads.length
    ? leads.reduce((sum, lead) => sum + lead.nReseñas, 0)
    : 2891
  const avgRating = leads.length
    ? leads.reduce((sum, lead) => sum + lead.nota, 0) / leads.length
    : 4.7

  return (
    <div className="flex gap-4">
      <MetricCard
        label="Total Leads"
        value={totalLeads}
        delay={0}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
      />
      <MetricCard
        label="Reseñas acumuladas"
        value={totalReviews}
        delay={80}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        }
      />
      <MetricCard
        label="Nota media"
        value={Number(avgRating.toFixed(1))}
        decimals={1}
        suffix="★"
        delay={160}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        }
      />
    </div>
  )
}
