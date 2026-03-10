'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getReasonCode } from '@/lib/reason-codes'
import EvidenceScore from '@/components/EvidenceScore'
import CountdownTimer from '@/components/CountdownTimer'

interface EvidenceItem {
  id: string
  evidence_type: string
  description: string
  is_provided: boolean
}

interface Dispute {
  id: string
  order_id: string
  merchant_name: string
  customer_name: string
  customer_email: string
  transaction_date: string
  transaction_amount: number
  card_network: string
  reason_code: string
  reason_description: string
  dispute_date: string
  response_deadline: string
  status: string
  evidence_score: number
  evidence_items: EvidenceItem[]
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  evidence_submitted: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  won: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30',
  expired: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  evidence_submitted: 'Evidence Submitted',
  won: 'Won',
  lost: 'Lost',
  expired: 'Expired',
}

const EVIDENCE_LABELS: Record<string, string> = {
  transaction_receipt: 'Transaction Receipt',
  delivery_proof: 'Delivery Proof',
  customer_communication: 'Customer Communication',
  refund_policy: 'Refund Policy',
  usage_logs: 'Usage Logs',
  avs_cvv_match: 'AVS/CVV Match Data',
  prior_transactions: 'Prior Transactions',
  billing_descriptor: 'Billing Descriptor',
  signed_contract: 'Signed Contract/Agreement',
  other: 'Other Evidence',
}

export default function DisputeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showLetterPreview, setShowLetterPreview] = useState(false)

  const loadDispute = useCallback(async () => {
    const res = await fetch(`/api/disputes/${params.id}`)
    if (res.ok) {
      const data = await res.json()
      setDispute(data)
    }
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    loadDispute()
  }, [loadDispute])

  async function handleOutcome(outcome: 'won' | 'lost') {
    if (!dispute) return
    setUpdating(true)
    await fetch(`/api/disputes/${dispute.id}/outcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outcome,
        amount_recovered: outcome === 'won' ? dispute.transaction_amount : 0,
      }),
    })
    await loadDispute()
    setUpdating(false)
  }

  async function markEvidenceSubmitted() {
    if (!dispute) return
    setUpdating(true)
    await fetch(`/api/disputes/${dispute.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'evidence_submitted' }),
    })
    await loadDispute()
    setUpdating(false)
  }

  if (loading) {
    return <div className="p-8 text-slate-400">Loading dispute...</div>
  }

  if (!dispute) {
    return <div className="p-8 text-slate-400">Dispute not found.</div>
  }

  const rc = getReasonCode(dispute.reason_code)

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 text-sm">← Dashboard</Link>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white font-mono">{dispute.order_id}</h1>
            <span className={`text-sm px-3 py-1 rounded-full border font-medium ${STATUS_STYLES[dispute.status] || STATUS_STYLES.open}`}>
              {STATUS_LABELS[dispute.status] || dispute.status}
            </span>
          </div>
          <p className="text-slate-400 mt-1">{dispute.customer_name} · ${Number(dispute.transaction_amount).toFixed(2)} · {dispute.card_network?.toUpperCase()} {dispute.reason_code}</p>
        </div>
        {(dispute.status === 'open' || dispute.status === 'evidence_submitted') && (
          <div className="text-right">
            <p className="text-slate-500 text-xs mb-1">Response deadline</p>
            <CountdownTimer deadline={dispute.response_deadline} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evidence Score */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <EvidenceScore score={dispute.evidence_score} size="lg" />
            {rc && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-slate-400 text-sm">{rc.description}</p>
                <div className="flex gap-3 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${rc.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' : rc.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' : rc.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                    {rc.difficulty} difficulty
                  </span>
                  <span className="text-xs text-slate-500">{rc.winRateBenchmark}% industry win rate</span>
                </div>
              </div>
            )}
          </div>

          {/* Evidence Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Evidence Items</h2>
            {dispute.evidence_items && dispute.evidence_items.length > 0 ? (
              <div className="space-y-2">
                {dispute.evidence_items.map(item => (
                  <div key={item.id} className={`flex items-start gap-3 p-3 rounded-lg border ${item.is_provided ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/30'}`}>
                    <span className={`mt-0.5 text-sm ${item.is_provided ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {item.is_provided ? '✓' : '○'}
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${item.is_provided ? 'text-white' : 'text-slate-500'}`}>
                        {EVIDENCE_LABELS[item.evidence_type] || item.evidence_type}
                      </p>
                      {item.description && <p className="text-slate-400 text-xs mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No evidence items recorded.</p>
            )}
          </div>

          {/* Response Strategy */}
          {rc && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-3">Response Strategy</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{rc.responseStrategy}</p>
            </div>
          )}

          {/* Letter Preview Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <button
              onClick={() => setShowLetterPreview(!showLetterPreview)}
              className="flex items-center justify-between w-full"
            >
              <span className="font-semibold text-white">Response Letter Preview</span>
              <span className="text-slate-400 text-sm">{showLetterPreview ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {showLetterPreview && (
              <div className="mt-4 bg-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 max-h-64 overflow-y-auto">
                <p>CHARGEBACK RESPONSE LETTER</p>
                <p>==========================</p>
                <p></p>
                <p>Re: {dispute.reason_code} — {dispute.reason_description}</p>
                <p>Order: {dispute.order_id}</p>
                <p>Amount: ${Number(dispute.transaction_amount).toFixed(2)}</p>
                <p>Customer: {dispute.customer_name}</p>
                <p></p>
                <p className="text-slate-400 italic">Full letter available in Evidence Package →</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Transaction Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="font-medium text-slate-400 text-xs uppercase tracking-wide mb-3">Transaction</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Merchant</span>
                <span className="text-white text-right">{dispute.merchant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="text-white">${Number(dispute.transaction_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span className="text-white">{dispute.transaction_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network</span>
                <span className="text-white capitalize">{dispute.card_network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer</span>
                <span className="text-white text-right">{dispute.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email</span>
                <span className="text-white text-xs text-right">{dispute.customer_email}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-medium text-slate-400 text-xs uppercase tracking-wide mb-3">Actions</h3>
            <Link
              href={`/dashboard/disputes/${dispute.id}/evidence`}
              className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition-colors"
            >
              View Evidence Package
            </Link>
            {dispute.status === 'open' && (
              <button
                onClick={markEvidenceSubmitted}
                disabled={updating}
                className="block w-full text-center bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Mark Evidence Submitted
              </button>
            )}
            {(dispute.status === 'open' || dispute.status === 'evidence_submitted') && (
              <>
                <button
                  onClick={() => handleOutcome('won')}
                  disabled={updating}
                  className="block w-full text-center bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  Mark Won
                </button>
                <button
                  onClick={() => handleOutcome('lost')}
                  disabled={updating}
                  className="block w-full text-center bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  Mark Lost
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
