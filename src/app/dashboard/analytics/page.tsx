'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

interface Dispute {
  id: string
  reason_code: string
  status: string
  evidence_score: number
  transaction_amount: number
  created_at: string
}

interface ReasonCodeStat {
  code: string
  total: number
  won: number
  winRate: number
}

export default function AnalyticsPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('disputes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setDisputes(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <div className="p-8 text-slate-400">Loading analytics...</div>

  const total = disputes.length
  const won = disputes.filter(d => d.status === 'won').length
  const lost = disputes.filter(d => d.status === 'lost').length
  const open = disputes.filter(d => d.status === 'open' || d.status === 'evidence_submitted').length
  const winRate = (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0
  const totalRecovered = disputes.filter(d => d.status === 'won').reduce((s, d) => s + Number(d.transaction_amount), 0)
  const avgScore = total > 0 ? Math.round(disputes.reduce((s, d) => s + (d.evidence_score || 0), 0) / total) : 0

  // Win rate by reason code
  const byCode: Record<string, { won: number; total: number }> = {}
  disputes.forEach(d => {
    if (!byCode[d.reason_code]) byCode[d.reason_code] = { won: 0, total: 0 }
    byCode[d.reason_code].total++
    if (d.status === 'won') byCode[d.reason_code].won++
  })
  const codeStats: ReasonCodeStat[] = Object.entries(byCode)
    .map(([code, s]) => ({ code, total: s.total, won: s.won, winRate: Math.round((s.won / s.total) * 100) }))
    .sort((a, b) => b.total - a.total)

  // Score distribution
  const scoreDistribution = [
    { range: '0-25', count: disputes.filter(d => d.evidence_score < 25).length },
    { range: '25-50', count: disputes.filter(d => d.evidence_score >= 25 && d.evidence_score < 50).length },
    { range: '50-70', count: disputes.filter(d => d.evidence_score >= 50 && d.evidence_score < 70).length },
    { range: '70-85', count: disputes.filter(d => d.evidence_score >= 70 && d.evidence_score < 85).length },
    { range: '85-100', count: disputes.filter(d => d.evidence_score >= 85).length },
  ]
  const maxDistCount = Math.max(...scoreDistribution.map(s => s.count), 1)

  // Monthly volume last 6 months
  const months: { label: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const y = d.getFullYear()
    const m = d.getMonth()
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const count = disputes.filter(d => {
      const dd = new Date(d.created_at)
      return dd.getFullYear() === y && dd.getMonth() === m
    }).length
    months.push({ label, count })
  }
  const maxMonthCount = Math.max(...months.map(m => m.count), 1)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
      <p className="text-slate-400 mb-8">Track your chargeback performance over time</p>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Disputes', value: total, color: 'text-white' },
          { label: 'Win Rate', value: `${winRate}%`, color: winRate >= 45 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Total Recovered', value: `$${totalRecovered.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, color: 'text-emerald-400' },
          { label: 'Avg Evidence Score', value: avgScore, color: avgScore >= 70 ? 'text-green-400' : 'text-amber-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Win Rate by Reason Code */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4">Win Rate by Reason Code</h2>
          {codeStats.length === 0 ? (
            <p className="text-slate-500 text-sm">No resolved disputes yet.</p>
          ) : (
            <div className="space-y-3">
              {codeStats.map(s => (
                <div key={s.code}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-amber-400 text-sm font-bold">{s.code}</span>
                    <span className="text-slate-400 text-xs">{s.won}/{s.total} won · {s.winRate}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${s.winRate >= 60 ? 'bg-emerald-500' : s.winRate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${s.winRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evidence Score Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4">Evidence Score Distribution</h2>
          <div className="flex items-end gap-3 h-32">
            {scoreDistribution.map(s => (
              <div key={s.range} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">{s.count}</span>
                <div
                  className={`w-full rounded-t-md transition-all ${s.range === '85-100' ? 'bg-emerald-500' : s.range === '70-85' ? 'bg-green-500' : s.range === '50-70' ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ height: `${Math.max(4, (s.count / maxDistCount) * 100)}px` }}
                />
                <span className="text-xs text-slate-500">{s.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Volume */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-white mb-4">Monthly Dispute Volume (Last 6 Months)</h2>
        <div className="flex items-end gap-4 h-32">
          {months.map(m => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400">{m.count}</span>
              <div
                className="w-full bg-amber-500/70 hover:bg-amber-500 rounded-t-md transition-all"
                style={{ height: `${Math.max(4, (m.count / maxMonthCount) * 100)}px` }}
              />
              <span className="text-xs text-slate-500">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4">Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Open', count: open, color: 'bg-blue-500' },
            { label: 'Won', count: won, color: 'bg-emerald-500' },
            { label: 'Lost', count: lost, color: 'bg-red-500' },
            { label: 'Submitted', count: disputes.filter(d => d.status === 'evidence_submitted').length, color: 'bg-amber-500' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className={`w-16 h-16 ${s.color} rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2`}>
                {s.count}
              </div>
              <p className="text-slate-400 text-sm">{s.label}</p>
              <p className="text-slate-500 text-xs">{total > 0 ? Math.round((s.count / total) * 100) : 0}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
