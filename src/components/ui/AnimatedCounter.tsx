'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  target: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  separator?: string
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

function formatNumber(value: number, decimals: number, separator: string): string {
  if (decimals > 0) {
    return value.toFixed(decimals)
  }
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}

export function AnimatedCounter({
  target,
  duration = 1500,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = '.',
}: AnimatedCounterProps) {
  const [value, setValue] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    startTime.current = null

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(progress)

      setValue(eased * target)

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      } else {
        setValue(target)
      }
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [target, duration])

  return (
    <span>
      {prefix}
      {formatNumber(value, decimals, separator)}
      {suffix}
    </span>
  )
}
