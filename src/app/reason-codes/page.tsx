'use client'

import { useState } from 'react'
import Link from 'next/link'
import { REASON_CODES, type Category } from '@/lib/reason-codes'

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': 'bg-emerald-500/20 text-emerald-400',
  'Medium': 'bg-amber-500/20 text-amber-400',
  'Hard': 'bg-orange-500/20 text-orange-400',
  'Very Hard': 'bg-red-500/20 text-red-400',
}

const CATEGORY_COLORS: Record<string, string> = {
  'Fraud': 'text-red-400',
  'Authorization': 'text-blue-400',
  'Processing Error': 'text-purple-400',
  'Consumer': 'text-cyan-400',
}

export default function ReasonCodesPage() {
  const [search, setSearch] = useState('')
  const [networkFilter, setNetworkFilter] = useState<'all' | 'visa' | 'mastercard'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = REASON_CODES.filter(rc => {
    const matchSearch = !search || rc.code.toLowerCase().includes(search.toLowerCase()) || rc.name.toLowerCase().includes(search.toLowerCase())
    const matchNetwork = networkFilter === 'all' || rc.network === networkFilter
    const matchCategory = categoryFilter === 'all' || rc.category === categoryFilter
    return matchSearch && matchNetwork && matchCategory
  })

  const selectedCode = selected ? REASON_CODES.find(rc => rc.code === selected) : null

  const categories: Category[] = ['Fraud', 'Authorization', 'Processing Error', 'Consumer']

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-slate-800 sticky top-0 z-50 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-amber-400">ChargebackKit</Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login</Link>
            <Link href="/auth/signup" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reason Code Library</h1>
          <p className="text-slate-400">29 reason codes with detailed evidence strategies for Visa and Mastercard disputes</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search codes or names..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <div className="flex gap-2">
            {(['all', 'visa', 'mastercard'] as const).map(n => (
              <button
                key={n}
                onClick={() => setNetworkFilter(n)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${networkFilter === n ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {n === 'all' ? 'All' : n === 'visa' ? 'Visa' : 'Mastercard'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === c ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="text-slate-500 text-sm mb-4">{filtered.length} codes</div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(rc => (
            <div
              key={rc.code}
              onClick={() => setSelected(selected === rc.code ? null : rc.code)}
              className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition-all ${selected === rc.code ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800 hover:border-slate-600'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-amber-400 font-bold text-lg">{rc.code}</span>
                  <span className="ml-2 text-xs text-slate-500">{rc.network === 'visa' ? 'Visa' : 'Mastercard'}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${DIFFICULTY_COLORS[rc.difficulty]}`}>
                  {rc.difficulty}
                </span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{rc.name}</h3>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-medium ${CATEGORY_COLORS[rc.category]}`}>{rc.category}</span>
                <span className="text-slate-500 text-xs">{rc.winRateBenchmark}% avg win rate</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{rc.description}</p>

              {selected === rc.code && (
                <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                  <div>
                    <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wide mb-2">Required Evidence</h4>
                    <div className="flex flex-wrap gap-1">
                      {rc.requiredEvidence.map(e => (
                        <span key={e} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                          {e.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wide mb-2">Response Strategy</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{rc.responseStrategy}</p>
                  </div>
                  <div>
                    <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wide mb-2">Common Mistakes</h4>
                    <ul className="space-y-1">
                      {rc.commonMistakes.map(m => (
                        <li key={m} className="text-red-400 text-xs flex items-start gap-1">
                          <span>×</span> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/auth/signup"
                    className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg text-sm transition-colors mt-2"
                    onClick={e => e.stopPropagation()}
                  >
                    Use This Strategy
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No reason codes match your filters.
          </div>
        )}
      </div>
    </div>
  )
}
