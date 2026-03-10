'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { REASON_CODES, getReasonCode } from '@/lib/reason-codes'
import { calculateEvidenceScore } from '@/lib/evidence-scoring'

const STEPS = ['Transaction Details', 'Dispute Info', 'Evidence Checklist', 'Review & Submit']

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

interface EvidenceItem {
  type: string
  description: string
  isProvided: boolean
}

export default function NewDisputePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Transaction details
  const [merchantName, setMerchantName] = useState('')
  const [orderId, setOrderId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [transactionDate, setTransactionDate] = useState('')
  const [transactionAmount, setTransactionAmount] = useState('')
  const [cardNetwork, setCardNetwork] = useState('visa')

  // Step 2: Dispute info
  const [reasonCode, setReasonCode] = useState('')
  const [disputeDate, setDisputeDate] = useState('')
  const [responseDeadline, setResponseDeadline] = useState('')

  // Step 3: Evidence
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([])

  const selectedReasonCode = getReasonCode(reasonCode)
  const filteredCodes = REASON_CODES.filter(rc => rc.network === cardNetwork)

  function initEvidence() {
    if (!selectedReasonCode) return
    const all = [...selectedReasonCode.requiredEvidence, ...selectedReasonCode.optionalEvidence]
    setEvidenceItems(all.map(type => ({ type, description: '', isProvided: false })))
  }

  const evidenceScore = selectedReasonCode && evidenceItems.length > 0
    ? calculateEvidenceScore(selectedReasonCode, evidenceItems.filter(e => e.isProvided).map(e => e.type))
    : 0

  function toggleEvidence(type: string) {
    setEvidenceItems(prev => prev.map(e => e.type === type ? { ...e, isProvided: !e.isProvided } : e))
  }

  function updateEvidenceDesc(type: string, desc: string) {
    setEvidenceItems(prev => prev.map(e => e.type === type ? { ...e, description: desc } : e))
  }

  function handleNext() {
    if (step === 1 && reasonCode) {
      initEvidence()
    }
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    const supabase = createClient()

    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_name: merchantName,
          order_id: orderId,
          customer_name: customerName,
          customer_email: customerEmail,
          transaction_date: transactionDate,
          transaction_amount: parseFloat(transactionAmount),
          card_network: cardNetwork,
          reason_code: reasonCode,
          reason_description: selectedReasonCode?.name || '',
          dispute_date: disputeDate,
          response_deadline: responseDeadline,
          evidence_score: evidenceScore,
          evidence_items: evidenceItems.map(e => ({
            type: e.type,
            description: e.description,
            is_provided: e.isProvided,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create dispute')
      }

      const dispute = await res.json()
      router.push(`/dashboard/disputes/${dispute.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
      setSubmitting(false)
    }
  }

  const canProceedStep0 = merchantName && orderId && customerName && transactionDate && transactionAmount && cardNetwork
  const canProceedStep1 = reasonCode && disputeDate && responseDeadline

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">New Dispute</h1>
        {/* Progress */}
        <div className="flex items-center gap-2 mt-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm hidden md:block ${i === step ? 'text-white font-medium' : 'text-slate-500'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        {/* Step 0: Transaction Details */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Transaction Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Merchant Name</label>
                <input value={merchantName} onChange={e => setMerchantName(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" placeholder="Your Business Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Order ID</label>
                <input value={orderId} onChange={e => setOrderId(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" placeholder="ORD-12345" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Customer Name</label>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Customer Email</label>
                <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" placeholder="customer@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Transaction Date</label>
                <input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Transaction Amount ($)</label>
                <input type="number" value={transactionAmount} onChange={e => setTransactionAmount(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" placeholder="99.99" step="0.01" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Card Network</label>
                <select value={cardNetwork} onChange={e => setCardNetwork(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500">
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">Amex</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Dispute Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Dispute Information</h2>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Reason Code</label>
              <select value={reasonCode} onChange={e => setReasonCode(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500">
                <option value="">Select reason code...</option>
                {filteredCodes.map(rc => (
                  <option key={rc.code} value={rc.code}>
                    {rc.code} — {rc.name}
                  </option>
                ))}
              </select>
              {selectedReasonCode && (
                <div className="mt-3 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex gap-3 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${selectedReasonCode.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' : selectedReasonCode.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' : selectedReasonCode.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                      {selectedReasonCode.difficulty}
                    </span>
                    <span className="text-xs text-slate-400">{selectedReasonCode.winRateBenchmark}% avg win rate</span>
                  </div>
                  <p className="text-slate-300 text-sm">{selectedReasonCode.description}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Dispute Date</label>
                <input type="date" value={disputeDate} onChange={e => setDisputeDate(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Response Deadline</label>
                <input type="date" value={responseDeadline} onChange={e => setResponseDeadline(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Evidence */}
        {step === 2 && selectedReasonCode && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Evidence Checklist</h2>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{evidenceScore}</span>
                <span className="text-slate-400 text-sm">/100</span>
              </div>
            </div>
            <div className="mb-4 bg-slate-800/50 rounded-lg p-3 text-sm text-slate-400 border border-slate-700">
              For <strong className="text-white">{selectedReasonCode.code} — {selectedReasonCode.name}</strong>, check the evidence you have available.
            </div>
            <div className="space-y-3">
              {evidenceItems.map(item => {
                const isRequired = selectedReasonCode.requiredEvidence.includes(item.type)
                return (
                  <div key={item.type} className={`border rounded-xl p-4 transition-colors ${item.isProvided ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/30'}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={item.type}
                        checked={item.isProvided}
                        onChange={() => toggleEvidence(item.type)}
                        className="mt-0.5 accent-amber-500 w-4 h-4"
                      />
                      <div className="flex-1">
                        <label htmlFor={item.type} className="flex items-center gap-2 cursor-pointer">
                          <span className="text-white font-medium text-sm">{EVIDENCE_LABELS[item.type] || item.type}</span>
                          {isRequired && <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium">Required</span>}
                        </label>
                        {item.isProvided && (
                          <input
                            type="text"
                            value={item.description}
                            onChange={e => updateEvidenceDesc(item.type, e.target.value)}
                            placeholder="Brief description of this evidence..."
                            className="mt-2 w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Review & Submit</h2>
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Transaction</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-400">Merchant:</span><span className="text-white">{merchantName}</span>
                  <span className="text-slate-400">Order ID:</span><span className="text-amber-400 font-mono">{orderId}</span>
                  <span className="text-slate-400">Customer:</span><span className="text-white">{customerName}</span>
                  <span className="text-slate-400">Amount:</span><span className="text-white">${parseFloat(transactionAmount || '0').toFixed(2)}</span>
                  <span className="text-slate-400">Network:</span><span className="text-white capitalize">{cardNetwork}</span>
                  <span className="text-slate-400">Date:</span><span className="text-white">{transactionDate}</span>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Dispute</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-400">Reason Code:</span><span className="text-white">{reasonCode} — {selectedReasonCode?.name}</span>
                  <span className="text-slate-400">Dispute Date:</span><span className="text-white">{disputeDate}</span>
                  <span className="text-slate-400">Deadline:</span><span className="text-white">{responseDeadline}</span>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Evidence Score</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-white">{evidenceScore}</div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-3 rounded-full ${evidenceScore < 50 ? 'bg-red-500' : evidenceScore < 70 ? 'bg-amber-500' : evidenceScore < 85 ? 'bg-green-500' : 'bg-emerald-500'}`}
                        style={{ width: `${evidenceScore}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {evidenceItems.filter(e => e.isProvided).length} of {evidenceItems.length} evidence items provided
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 0 && !canProceedStep0) ||
                (step === 1 && !canProceedStep1)
              }
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold px-6 py-2 rounded-lg transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-lg transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Dispute'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
