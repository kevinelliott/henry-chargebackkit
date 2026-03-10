import { ReasonCode } from './reason-codes';

export const EVIDENCE_WEIGHTS: Record<string, number> = {
  transaction_receipt: 15,
  delivery_proof: 20,
  customer_communication: 15,
  refund_policy: 10,
  usage_logs: 15,
  avs_cvv_match: 10,
  prior_transactions: 15,
  billing_descriptor: 5,
  signed_contract: 10,
  device_fingerprint: 10,
  ip_address_match: 10,
};

export function calculateEvidenceScore(
  reasonCode: ReasonCode,
  providedEvidence: string[]
): number {
  const relevantEvidence = [...reasonCode.requiredEvidence, ...reasonCode.optionalEvidence];

  const totalPossible = relevantEvidence.reduce((sum, ev) => {
    return sum + (EVIDENCE_WEIGHTS[ev] || 5);
  }, 0);

  const totalProvided = providedEvidence.reduce((sum, ev) => {
    if (relevantEvidence.includes(ev)) {
      return sum + (EVIDENCE_WEIGHTS[ev] || 5);
    }
    return sum;
  }, 0);

  if (totalPossible === 0) return 0;
  return Math.round((totalProvided / totalPossible) * 100);
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score < 50) return { label: 'Weak — likely to lose', color: 'text-red-400' };
  if (score < 70) return { label: 'Moderate — possible win', color: 'text-amber-400' };
  if (score < 85) return { label: 'Strong — good chances', color: 'text-green-400' };
  return { label: 'Excellent — highly likely to win', color: 'text-emerald-400' };
}

export function getMissingCriticalEvidence(
  reasonCode: ReasonCode,
  providedEvidence: string[]
): Array<{ type: string; weight: number; scoreGain: number }> {
  const allRelevant = [...reasonCode.requiredEvidence, ...reasonCode.optionalEvidence];
  const totalPossible = allRelevant.reduce((sum, ev) => sum + (EVIDENCE_WEIGHTS[ev] || 5), 0);

  return reasonCode.requiredEvidence
    .filter(ev => !providedEvidence.includes(ev))
    .map(ev => {
      const weight = EVIDENCE_WEIGHTS[ev] || 5;
      const currentProvided = providedEvidence.reduce((sum, pev) => {
        if (allRelevant.includes(pev)) return sum + (EVIDENCE_WEIGHTS[pev] || 5);
        return sum;
      }, 0);
      const newScore = Math.round(((currentProvided + weight) / totalPossible) * 100);
      const currentScore = Math.round((currentProvided / totalPossible) * 100);
      return {
        type: ev,
        weight,
        scoreGain: newScore - currentScore,
      };
    });
}
