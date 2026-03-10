'use client'

import { useState } from 'react'
import Link from 'next/link'
import { REASON_CODES } from '@/lib/reason-codes'

function CostCalculator() {
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
            {roi}% ROI on ChargebackKit subscription — pays for itself after just {Math.ceil(29 / (monthlySavings / monthlyChargebacks))} won disputes
          </p>
        </div>
      )}
    </div>
  )
}

const DIFFICULTY_COLORS: Record<string, string> = {
  'Easy': 'bg-emerald-500/20 text-emerald-400',
  'Medium': 'bg-amber-500/20 text-amber-400',
  'Hard': 'bg-orange-500/20 text-orange-400',
  'Very Hard': 'bg-red-500/20 text-red-400',
}

const FAQS = [
  { q: 'How does ChargebackKit work?', a: 'You enter your dispute details — merchant name, order ID, reason code, and transaction info. ChargebackKit analyzes your specific reason code and generates a complete evidence package with a tailored response letter optimized for your exact dispute type.' },
  { q: 'Which card networks do you support?', a: 'ChargebackKit supports all major Visa and Mastercard reason codes — 29 codes total. We cover fraud, authorization, processing errors, and consumer disputes.' },
  { q: 'What is the evidence score?', a: 'The evidence score (0-100) shows how strong your chargeback response is based on the evidence you have provided. A score above 70 gives you good odds of winning; above 85 is excellent.' },
  { q: 'How long does it take to prepare a response?', a: 'Most merchants complete their evidence package in under 15 minutes using ChargebackKit. Without it, researching reason codes and drafting a response can take 2-3 hours per dispute.' },
  { q: 'What is the average win rate using ChargebackKit?', a: 'Our customers see an average 45% win rate across all dispute types, compared to the industry average of 20-22% for merchants responding without specialized tools.' },
  { q: 'Do you handle the submission process?', a: 'ChargebackKit generates your complete evidence package as a print-ready PDF. You submit it directly to your payment processor or bank, which keeps you in control of deadlines and ensures fastest processing.' },
  { q: 'Is there a free trial?', a: 'Yes — the Free plan lets you manage up to 3 disputes with full evidence scoring. No credit card required to start.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel anytime with no penalties. Your data is yours and can be exported at any time.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <nav className="border-b border-slate-800 sticky top-0 z-50 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-amber-400">ChargebackKit</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/reason-codes" className="text-slate-300 hover:text-white text-sm transition-colors">Reason Codes</Link>
            <a href="#pricing" className="text-slate-300 hover:text-white text-sm transition-colors">Pricing</a>
            <Link href="/auth/login" className="text-slate-300 hover:text-white text-sm transition-colors">Login</Link>
            <Link href="/auth/signup" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-amber-400 text-sm font-medium">29 reason codes covered · Visa + Mastercard</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Win Your Chargebacks.<br />
          <span className="text-amber-400">Stop Losing $240 Per Dispute.</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
          Generate evidence packages optimized for your exact reason code. ChargebackKit analyzes your dispute,
          scores your evidence, and generates a professional response letter in minutes — not hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/auth/signup" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl text-lg transition-colors">
            Start Free — No Credit Card
          </Link>
          <Link href="/disputes/demo" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors border border-slate-700">
            View Demo Dispute
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: '45%', label: 'Avg Win Rate' },
            { value: '29', label: 'Reason Codes' },
            { value: '15min', label: 'Per Response' },
            { value: '$29/mo', label: 'Flat Rate' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <p className="text-3xl font-bold text-amber-400">{stat.value}</p>
              <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <CostCalculator />
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Enter Dispute Details',
              desc: 'Input your order ID, transaction amount, card network, and reason code. Takes under 2 minutes.',
            },
            {
              step: '02',
              title: 'Score Your Evidence',
              desc: 'ChargebackKit analyzes your specific reason code and shows exactly which evidence you need — ranked by impact on your win probability.',
            },
            {
              step: '03',
              title: 'Generate & Submit',
              desc: 'Download your print-ready evidence package with a tailored response letter. Submit directly to your processor before the deadline.',
            },
          ].map(item => (
            <div key={item.step} className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="text-amber-400 text-4xl font-bold mb-4">{item.step}</div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reason Code Coverage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">29 Reason Codes Covered</h2>
          <p className="text-slate-400">Every Visa and Mastercard dispute type with tailored evidence strategies</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {REASON_CODES.map(rc => (
            <Link
              key={rc.code}
              href={`/reason-codes`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 hover:border-amber-500/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-amber-400 font-bold text-sm">{rc.code}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${DIFFICULTY_COLORS[rc.difficulty]}`}>
                  {rc.difficulty === 'Very Hard' ? 'V.Hard' : rc.difficulty}
                </span>
              </div>
              <p className="text-white text-xs font-medium leading-tight">{rc.name}</p>
              <p className="text-slate-500 text-xs mt-1">{rc.network === 'visa' ? 'Visa' : 'MC'} · {rc.winRateBenchmark}% avg</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/reason-codes" className="text-amber-400 hover:text-amber-300 font-medium">
            Browse all reason codes with full strategies →
          </Link>
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How We Compare</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Feature</th>
                <th className="text-center py-4 px-4 text-amber-400 font-bold">ChargebackKit</th>
                <th className="text-center py-4 px-4 text-slate-400 font-medium">Chargeflow</th>
                <th className="text-center py-4 px-4 text-slate-400 font-medium">Midigator</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Flat monthly pricing', '✓ $29/mo', '✗ 25% of recovered', '✗ Custom enterprise'],
                ['Reason code database', '✓ 29 codes', '✓ Yes', '✓ Yes'],
                ['Evidence scoring', '✓ Real-time', '— Manual', '✓ Yes'],
                ['Response letters', '✓ Auto-generated', '✓ Templates', '✓ Templates'],
                ['Self-serve submission', '✓ You control it', '✗ They submit', '✗ Managed service'],
                ['Free tier', '✓ 3 disputes', '✗ No', '✗ No'],
                ['Setup time', '✓ < 5 minutes', '— Onboarding', '— Enterprise call'],
              ].map(([feature, kit, chargeflow, midigator]) => (
                <tr key={feature} className="border-b border-slate-800 hover:bg-slate-900/50">
                  <td className="py-3 px-4 text-slate-300">{feature}</td>
                  <td className="py-3 px-4 text-center text-emerald-400 font-medium">{kit}</td>
                  <td className="py-3 px-4 text-center text-slate-400 text-sm">{chargeflow}</td>
                  <td className="py-3 px-4 text-center text-slate-400 text-sm">{midigator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Simple, Flat Pricing</h2>
        <p className="text-slate-400 text-center mb-12">No percentage fees. No surprise charges. Just flat monthly pricing.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Free',
              price: '$0',
              period: 'forever',
              desc: 'Get started and see if it works for you',
              features: ['3 disputes/month', 'All reason codes', 'Evidence scoring', 'Response letters', 'Email support'],
              cta: 'Start Free',
              href: '/auth/signup',
              highlight: false,
            },
            {
              name: 'Pro',
              price: '$29',
              period: '/month',
              desc: 'For merchants with regular chargeback volume',
              features: ['Unlimited disputes', 'All reason codes', 'Real-time scoring', 'Auto response letters', 'Analytics dashboard', 'Webhook notifications', 'Priority support'],
              cta: 'Start Pro Trial',
              href: '/auth/signup',
              highlight: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: '',
              desc: 'For high-volume merchants and payment platforms',
              features: ['Everything in Pro', 'API access', 'Custom integrations', 'Dedicated success manager', 'SLA guarantees', 'White-label options', 'Custom reporting'],
              cta: 'Contact Sales',
              href: 'mailto:sales@chargebackkit.com',
              highlight: false,
            },
          ].map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border ${plan.highlight
                ? 'bg-amber-500/10 border-amber-500/50 relative'
                : 'bg-slate-900 border-slate-700'
                }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">{plan.desc}</p>
              <ul className="space-y-2 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-slate-300 text-sm">
                    <span className="text-emerald-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-semibold transition-colors ${plan.highlight
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                  }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <Link href="/" className="text-xl font-bold text-amber-400">ChargebackKit</Link>
              <p className="text-slate-500 text-sm mt-1">Win more chargebacks. Recover more revenue.</p>
            </div>
            <div className="flex gap-6 text-slate-400 text-sm">
              <Link href="/reason-codes" className="hover:text-white transition-colors">Reason Codes</Link>
              <Link href="/disputes/demo" className="hover:text-white transition-colors">Demo</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-600 text-sm">
            &copy; {new Date().getFullYear()} ChargebackKit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
