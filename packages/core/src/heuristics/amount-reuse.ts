import type { ScanContext, RiskSignal, Evidence } from '../types/index.js';

/**
 * Detect if the wallet sends or receives suspiciously similar amounts
 * Round numbers or repeated exact amounts can be used for fingerprinting
 */
export function detectAmountReuse(context: ScanContext): RiskSignal | null {
  if (context.transfers.length < 3) {
    return null;
  }

  // Group amounts (rounded to avoid floating point issues)
  const amountCounts = new Map<string, number>();
  const roundNumbers: number[] = [];

  for (const transfer of context.transfers) {
    // Check for round numbers (e.g., 1.0, 10.0, 100.0)
    if (transfer.amount > 0 && Number.isInteger(transfer.amount) && transfer.amount >= 1) {
      roundNumbers.push(transfer.amount);
    }

    // Count exact amount reuse
    const amountKey = `${transfer.amount.toFixed(9)}-${transfer.token || 'SOL'}`;
    amountCounts.set(amountKey, (amountCounts.get(amountKey) || 0) + 1);
  }

  // Find amounts used multiple times
  const reusedAmounts = Array.from(amountCounts.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  const hasRoundNumbers = roundNumbers.length >= 2;
  const hasReusedAmounts = reusedAmounts.length >= 2;

  if (!hasRoundNumbers && !hasReusedAmounts) {
    return null;
  }

  let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if ((hasRoundNumbers && roundNumbers.length >= 5) || reusedAmounts.length >= 5) {
    severity = 'HIGH';
  } else if ((hasRoundNumbers && roundNumbers.length >= 3) || reusedAmounts.length >= 3) {
    severity = 'MEDIUM';
  }

  const evidence: Evidence[] = [];

  if (hasRoundNumbers) {
    evidence.push({
      type: 'amount',
      description: `${roundNumbers.length} round-number transfers detected`,
      data: { roundNumbers: roundNumbers.slice(0, 5) },
    });
  }

  if (hasReusedAmounts) {
    const topReused = reusedAmounts.slice(0, 3);
    for (const [amountKey, count] of topReused) {
      const [amount, token] = amountKey.split('-');
      evidence.push({
        type: 'amount',
        description: `Amount ${amount} ${token} used ${count} times`,
        data: { amount: parseFloat(amount), token, count },
      });
    }
  }

  return {
    id: 'amount-reuse',
    name: 'Deterministic Amount Patterns',
    severity,
    reason: `Wallet uses ${hasRoundNumbers ? 'round numbers' : 'repeated amounts'} in transactions`,
    impact: 'Using the same amounts repeatedly or sending round numbers creates fingerprints that can be used to link transactions and identify patterns in your activity.',
    evidence,
    mitigation: 'Vary transaction amounts slightly, avoid round numbers, and consider using privacy protocols that obscure amounts.',
    confidence: hasRoundNumbers ? 0.85 : 0.75,
  };
}
