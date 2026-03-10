'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import DisputeTable from '@/components/DisputeTable'

interface Dispute {
  id: string
  order_id: string
  customer_name: string
  transaction_amount: number
  reason_code: string
  card_network: string
  status: string
  response_deadline: string
  evidence_score: number
  merchant_name: string
  dispute_date: string
}

interface Stats {
  total: number
  open: number
  won: number
  lost: number
  totalAmount: number
  recoveredAmount: number
  winRate: number
}

export default function DashboardPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, won: 0, lost: 0, totalAmount: 0, recoveredAmount: 0, winRate: 0 })

  const loadDisputes = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check and seed if needed
    const { data: settings } = await supabase
      .from('user_settings')
      .select('seeded')
      .eq('user_id', user.id)
      .single()

    if (!settings?.seeded) {
      await fetch('/api/seed', { method: 'POST' })
    }

    const { data } = await supabase
      .from('disputes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setDisputes(data)
      const won = data.filter(d => d.status === 'won').length
      const lost = data.filter(d => d.status === 'lost').length
      const open = data.filter(d => d.status === 'open' || d.status === 'evidence_submitted').length
      const totalAmount = data.reduce((sum, d) => sum + Number(d.transaction_amount), 0)
      const recoveredAmount = data.filter(d => d.status === 'won').reduce((sum, d) => sum + Number(d.transaction_amount), 0)
      const winRate = (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0
      setStats({ total: data.length, open, won, lost, totalAmount, recoveredAmount, winRate })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadDisputes()
  }, [loadDisputes])

  const urgentDisputes = disputes.filter(d => {
    if (d.status !== 'open' && d.status !== 'evidence_submitted') return false
    const deadline = new Date(d.response_deadline)
    const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 7 && daysLeft >= 0
  })

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading your disputes...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage and track your chargeback disputes</p>
        </div>
        <Link
          href="/dashboard/disputes/new"
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors"
        >
          + New Dispute
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Disputes', value: stats.total, color: 'text-white' },
          { label: 'Win Rate', value: `${stats.winRate}%`, color: stats.winRate >= 45 ? 'text-emerald-400' : 'text-amber-400' },
          { label: 'Total Recovered', value: `$${stats.recoveredAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-emerald-400' },
          { label: 'Active Open', value: stats.open, color: stats.open > 0 ? 'text-blue-400' : 'text-slate-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Urgent Disputes */}
      {urgentDisputes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-red-400 animate-pulse">⚠</span>
            Urgent — Response Needed Soon
          </h2>
          <div className="space-y-3">
            {urgentDisputes.map(d => {
              const daysLeft = Math.ceil((new Date(d.response_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <Link
                  key={d.id}
                  href={`/dashboard/disputes/${d.id}`}
                  className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl p-4 hover:bg-red-500/15 transition-colors"
                >
                  <div>
                    <span className="font-mono text-amber-400 font-bold">{d.order_id}</span>
                    <span className="text-slate-400 text-sm ml-3">{d.customer_name} · ${Number(d.transaction_amount).toFixed(2)}</span>
                  </div>
                  <span className={`text-sm font-semibold ${daysLeft <= 1 ? 'text-red-400' : 'text-orange-400'}`}>
                    {daysLeft <= 0 ? 'Due today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Disputes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Disputes</h2>
          <span className="text-slate-500 text-sm">{disputes.length} total</span>
        </div>
        <DisputeTable disputes={disputes.slice(0, 10)} />
      </div>
    </div>
  )
}
