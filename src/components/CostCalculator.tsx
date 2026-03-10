'use client'

import { useState } from 'react'

export default function CostCalculator() {
  const [monthlyChargebacks, setMonthlyChargebacks] = useState(20)
  const [avgOrderValue, setAvgOrderValue] = useState(150)
  const [currentWinRate, setCurrentWinRate] = useState(20)

  const monthlyLoss = Math.round(monthlyChargebacks * avgOrderValue * (1 - currentWinRate / 100))
  const annualLoss = monthlyLoss * 12
  const withKitWinRate = 0.45
  const withKitMonthlyLoss = Math.round(monthlyChargebacks * avgOrderValue * (1 - withKitWinRate))
  const monthlySavings = monthlyLoss - withKitMonthlyLoss
  const annualSavings = monthlySavings * 12
  const roi = monthlySavings > 0 ? Math.round(((monthlySavings - 29) / 29) * 100) : 0
  const breakEven = monthlySavings > 0 ? Math.ceil(29 / (monthlySavings / monthlyChargebacks)) : 0

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-white mb-6">Calculate Your Chargeback Losses</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Monthly Chargebacks</label>
          <input
            type="number"
            value={monthlyChargebacks}
            onChange={e => setMonthlyChargebacks(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Avg Order Value ($)</label>
          <input
            type="number"
            value={avgOrderValue}
            onChange={e => setAvgOrderValue(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Current Win Rate (%)</label>
          <input
            type="number"
            value={currentWinRate}
            onChange={e => setCurrentWinRate(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
            min="0"
            max="100"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Monthly Losses</p>
          <p className="text-red-400 text-2xl font-bold">${monthlyLoss.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Annual Losses</p>
          <p className="text-red-400 text-2xl font-bold">${annualLoss.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Monthly Savings w/ Kit</p>
          <p className="text-emerald-400 text-2xl font-bold">${monthlySavings.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Annual Savings</p>
          <p className="text-emerald-400 text-2xl font-bold">${annualSavings.toLocaleString()}</p>
        </div>
      </div>
      {roi > 0 && (
        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
          <p className="text-amber-400 font-semibold">
            {roi}% ROI on ChargebackKit subscription — pays for itself after just {breakEven} won dispute{breakEven !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
