'use client'

import Link from 'next/link'
import CountdownTimer from './CountdownTimer'
import EvidenceScore from './EvidenceScore'

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
}

interface DisputeTableProps {
  disputes: Dispute[]
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400',
  evidence_submitted: 'bg-amber-500/20 text-amber-400',
  won: 'bg-emerald-500/20 text-emerald-400',
  lost: 'bg-red-500/20 text-red-400',
  expired: 'bg-slate-500/20 text-slate-400',
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  evidence_submitted: 'Evidence Submitted',
  won: 'Won',
  lost: 'Lost',
  expired: 'Expired',
}

export default function DisputeTable({ disputes }: DisputeTableProps) {
  if (disputes.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg mb-2">No disputes yet</p>
        <p className="text-sm">
          <Link href="/dashboard/disputes/new" className="text-amber-400 hover:text-amber-300">
            Add your first dispute →
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Order</th>
            <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Customer</th>
            <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Amount</th>
            <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Reason Code</th>
            <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Status</th>
            <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Deadline</th>
            <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Score</th>
            <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {disputes.map(dispute => (
            <tr key={dispute.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
              <td className="py-3 px-4">
                <span className="font-mono text-amber-400 font-medium text-sm">{dispute.order_id}</span>
              </td>
              <td className="py-3 px-4 text-slate-300 text-sm">{dispute.customer_name}</td>
              <td className="py-3 px-4 text-white font-medium text-sm">
                ${Number(dispute.transaction_amount).toFixed(2)}
              </td>
              <td className="py-3 px-4">
                <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                  {dispute.card_network?.toUpperCase()} {dispute.reason_code}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[dispute.status] || STATUS_STYLES.open}`}>
                  {STATUS_LABELS[dispute.status] || dispute.status}
                </span>
              </td>
              <td className="py-3 px-4">
                {dispute.status === 'open' || dispute.status === 'evidence_submitted' ? (
                  <CountdownTimer deadline={dispute.response_deadline} />
                ) : (
                  <span className="text-slate-500 text-sm">—</span>
                )}
              </td>
              <td className="py-3 px-4 w-28">
                <EvidenceScore score={dispute.evidence_score} showLabel={false} size="sm" />
              </td>
              <td className="py-3 px-4">
                <Link
                  href={`/dashboard/disputes/${dispute.id}`}
                  className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
