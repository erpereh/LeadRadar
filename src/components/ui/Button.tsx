'use client'

import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'text-white font-medium shadow-sm hover:opacity-90 active:scale-[0.98]',
  ghost:
    'bg-transparent text-[var(--secondary)] hover:text-[var(--text)] hover:bg-[var(--border)]',
  outline:
    'bg-transparent border border-[var(--border)] text-[var(--text)] hover:border-violet-500 hover:text-violet-600',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-2.5 text-sm rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isPrimary ? 'bg-gradient-to-r from-violet-600 to-purple-500' : ''}
        ${className}
      `}
    >
      {loading && (
        <span className="animate-pulse-scale inline-block w-3.5 h-3.5">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <circle cx="8" cy="8" r="6" opacity="0.3" />
            <path d="M8 2a6 6 0 0 1 6 6" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />
          </svg>
        </span>
      )}
      {children}
    </button>
  )
}
