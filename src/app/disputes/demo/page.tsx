import Link from 'next/link'
import { getReasonCode } from '@/lib/reason-codes'
import { generateResponseLetter } from '@/lib/letter-generator'
import { getScoreLabel } from '@/lib/evidence-scoring'

const DEMO_DISPUTE = {
  orderId: 'TGP-2847',
  merchantName: 'TechGear Pro',
  customerName: 'James Morrison',
  customerEmail: 'j.morrison@email.com',
  transactionDate: '2026-02-18',
  transactionAmount: 189.99,
  cardNetwork: 'visa',
  reasonCode: '10.4',
  disputeDate: '2026-02-28',
  responseDeadline: '2026-03-15',
  evidenceScore: 82,
  status: 'evidence_submitted',
}

const DEMO_EVIDENCE = [
  { type: 'transaction_receipt', description: 'Full transaction receipt with authorization code AUTH-7829', isProvided: true },
  { type: 'avs_cvv_match', description: 'AVS: Full match (Y), CVV: Match (M) — confirmed by Stripe', isProvided: true },
  { type: 'delivery_proof', description: 'UPS tracking #1Z999AA10123456784 — Delivered Feb 20, signed by J.Morrison', isProvided: true },
  { type: 'prior_transactions', description: '3 prior successful orders from same customer in last 12 months', isProvided: true },
  { type: 'customer_communication', description: 'Order confirmation email sent Feb 18 — no dispute or complaint prior to chargeback', isProvided: true },
  { type: 'usage_logs', description: 'Product warranty registered on Feb 21 using order email address', isProvided: false },
]

export default function DemoPage() {
  const rc = getReasonCode(DEMO_DISPUTE.reasonCode)!
  const { label, color } = getScoreLabel(DEMO_DISPUTE.evidenceScore)

  const letter = generateResponseLetter({
    merchantName: DEMO_DISPUTE.merchantName,
    orderId: DEMO_DISPUTE.orderId,
    customerName: DEMO_DISPUTE.customerName,
    transactionDate: DEMO_DISPUTE.transactionDate,
    transactionAmount: DEMO_DISPUTE.transactionAmount,
    cardNetwork: DEMO_DISPUTE.cardNetwork,
    reasonCode: DEMO_DISPUTE.reasonCode,
    reasonCodeData: rc,
    disputeDate: DEMO_DISPUTE.disputeDate,
    responseDeadline: DEMO_DISPUTE.responseDeadline,
    evidenceItems: DEMO_EVIDENCE,
  })

  return (
    <div className="min-h-screen bg-slate-950">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-amber-400 text-sm font-medium">Demo Dispute — No signup required</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Sample Evidence Package</h1>
        <p className="text-slate-400 mb-8">See exactly what ChargebackKit generates for a real dispute</p>

        {/* Dispute Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-xs mb-1">Order ID</p>
              <p className="text-amber-400 font-mono font-bold">{DEMO_DISPUTE.orderId}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Amount</p>
              <p className="text-white font-bold">${DEMO_DISPUTE.transactionAmount}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Reason Code</p>
              <p className="text-white font-mono">VISA {DEMO_DISPUTE.reasonCode}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Status</p>
              <span className="bg-amber-500/20 text-amber-400 text-sm px-2 py-0.5 rounded-full font-medium">Evidence Submitted</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700 text-sm text-slate-400">
            <strong className="text-white">Reason:</strong> {rc.name} — {rc.description}
          </div>
        </div>

        {/* Evidence Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">Evidence Strength</h2>
          <div className="flex items-center gap-6">
            <div className="text-5xl font-bold text-white">{DEMO_DISPUTE.evidenceScore}</div>
            <div className="flex-1">
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div className="h-4 bg-green-500 rounded-full" style={{ width: `${DEMO_DISPUTE.evidenceScore}%` }} />
              </div>
              <p className={`font-semibold ${color}`}>{label}</p>
            </div>
          </div>
        </div>

        {/* Evidence Items */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">Evidence Checklist</h2>
          <div className="space-y-2">
            {DEMO_EVIDENCE.map((item, idx) => (
              <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${item.isProvided ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/30'}`}>
                <span className={`mt-0.5 font-bold ${item.isProvided ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {item.isProvided ? '✓' : '○'}
                </span>
                <div>
                  <p className={`text-sm font-medium ${item.isProvided ? 'text-white' : 'text-slate-500'}`}>
                    {item.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  {item.description && <p className="text-slate-400 text-xs mt-0.5">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Letter Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-white mb-4">Generated Response Letter (Preview)</h2>
          <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {letter.slice(0, 1500)}...
          </div>
          <p className="text-slate-500 text-xs mt-2">Full letter generated and print-ready in ChargebackKit</p>
        </div>

        {/* CTA */}
        <div className="text-center bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Win Your Chargebacks?</h2>
          <p className="text-slate-400 mb-6">Sign up free and create your first dispute in under 5 minutes. No credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3 rounded-xl text-lg transition-colors">
              Start Free — No Credit Card
            </Link>
            <Link href="/reason-codes" className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl text-lg transition-colors border border-slate-700">
              Browse All Reason Codes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
