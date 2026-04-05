export function formatRelativeTime(iso: string): string {
  const target = new Date(iso).getTime()
  if (Number.isNaN(target)) return 'ahora'

  const now = Date.now()
  const diffMs = target - now
  const abs = Math.abs(diffMs)

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
    { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: 'day', ms: 1000 * 60 * 60 * 24 },
    { unit: 'hour', ms: 1000 * 60 * 60 },
    { unit: 'minute', ms: 1000 * 60 },
  ]

  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

  for (const { unit, ms } of units) {
    if (abs >= ms) {
      const value = Math.round(diffMs / ms)
      return rtf.format(value, unit)
    }
  }

  return 'ahora'
}
