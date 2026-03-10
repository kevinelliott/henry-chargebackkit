'use client'

import { getScoreLabel } from '@/lib/evidence-scoring'

interface EvidenceScoreProps {
  score: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function EvidenceScore({ score, showLabel = true, size = 'md' }: EvidenceScoreProps) {
  const { label, color } = getScoreLabel(score)

  const barColor =
    score < 50 ? 'bg-red-500' :
    score < 70 ? 'bg-amber-500' :
    score < 85 ? 'bg-green-500' :
    'bg-emerald-500'

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3'
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-3xl' : 'text-xl'

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm font-medium">Evidence Score</span>
        <span className={`font-bold ${textSize} text-white`}>{score}<span className="text-slate-500 text-sm font-normal">/100</span></span>
      </div>
      <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      {showLabel && (
        <p className={`text-sm mt-2 ${color} font-medium`}>{label}</p>
      )}
    </div>
  )
}
