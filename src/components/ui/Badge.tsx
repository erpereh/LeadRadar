interface BadgeProps {
  variant?: 'pending' | 'contacted' | 'interested' | 'default'
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  pending: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  contacted: 'bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400',
  interested: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  default: 'bg-[var(--border)] text-[var(--secondary)]',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
