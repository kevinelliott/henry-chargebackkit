'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  deadline: string
}

export default function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; expired: boolean } | null>(null)

  useEffect(() => {
    function calculate() {
      const now = new Date().getTime()
      const end = new Date(deadline).getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft({ days, hours, minutes, seconds, expired: false })
    }

    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  if (!timeLeft) return <span className="text-slate-500 text-sm">Loading...</span>

  if (timeLeft.expired) {
    return <span className="text-red-500 font-semibold text-sm">EXPIRED</span>
  }

  const isUrgent = timeLeft.days < 3
  const isCritical = timeLeft.days === 0

  if (isCritical) {
    return (
      <span className="text-red-400 font-bold text-sm animate-pulse">
        URGENT: {timeLeft.hours}h {timeLeft.minutes}m remaining
      </span>
    )
  }

  if (isUrgent) {
    return (
      <span className="text-orange-400 font-semibold text-sm">
        {timeLeft.days}d {timeLeft.hours}h remaining
      </span>
    )
  }

  return (
    <span className="text-slate-300 text-sm">
      {timeLeft.days}d {timeLeft.hours}h remaining
    </span>
  )
}
