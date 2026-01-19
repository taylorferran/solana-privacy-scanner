import type { ScanContext, PrivacySignal, Evidence } from '../types/index.js';

/**
 * Detect amount reuse - downgraded for Solana
 * 
 * On Solana, this is WEAKER than on Ethereum because:
 * - SOL transfers are cheap, so round numbers are common and benign
 * - SPL tokens have fixed decimals, making repeated amounts normal
 * - Many programs emit deterministic amounts by design
 * 
 * This heuristic only becomes strong when combined with:
 * - Same counterparty
 * - Same signer
 * - Same instruction type
 */
export function detectAmountReuse(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];

  if (context.transfers.length < 5) {
    return signals;
  }

  // Group amounts (rounded to avoid floating point issues)
  const amountCounts = new Map<string, { count: number; counterparties: Set<string>; signers: Set<string> }>();
  const roundNumbers: number[] = [];

  for (const transfer of context.transfers) {
    // Check for round numbers (e.g., 1.0, 10.0, 100.0)
    if (transfer.amount > 0 && Number.isInteger(transfer.amount) && transfer.amount >= 1) {
      roundNumbers.push(transfer.amount);
    }

    // Count exact amount reuse with context
    const amountKey = `${transfer.amount.toFixed(9)}-${transfer.token || 'SOL'}`;
    if (!amountCounts.has(amountKey)) {
      amountCounts.set(amountKey, { count: 0, counterparties: new Set(), signers: new Set() });
    }
    
    const data = amountCounts.get(amountKey)!;
    data.count++;
    
    // Track counterparties
    const counterparty = transfer.from === context.target ? transfer.to : transfer.from;
    if (counterparty !== context.target) {
      data.counterparties.add(counterparty);
    }

    // Track signers for this transaction
    const tx = context.transactions ? context.transactions.find(t => t.signature === transfer.signature) : null;
    if (tx) {
      tx.signers.forEach(s => data.signers.add(s));
    }
  }

  // Find amounts used multiple times
  const reusedAmounts = Array.from(amountCounts.entries())
    .filter(([_, data]) => data.count >= 3)
    .sort((a, b) => b[1].count - a[1].count);

  const hasRoundNumbers = roundNumbers.length >= 3;
  const hasReusedAmounts = reusedAmounts.length >= 2;

  // Case 1: Round numbers alone (LOW risk on Solana)
  if (hasRoundNumbers && roundNumbers.length >= 5) {
    signals.push({
      id: 'amount-round-numbers',
      name: 'Frequent Round Number Transfers',
      severity: 'LOW',
      category: 'behavioral',
      reason: `${roundNumbers.length} round-number transfers detected (e.g., 1 SOL, 10 SOL).`,
      impact: 'Round numbers are common on Solana and relatively benign alone. Combined with other patterns, they can contribute to fingerprinting.',
      mitigation: 'Vary amounts slightly if possible, but this is low priority on Solana.',
      evidence: [{
        description: `${roundNumbers.length} round-number transfers: ${roundNumbers.slice(0, 5).join(', ')}...`,
        severity: 'LOW',
        type: 'amount',
        data: { roundNumbers: roundNumbers.slice(0, 5) },
      }],
    });
  }

  // Case 2: Same amount + same counterparty (MEDIUM risk)
  const suspiciousReuse = reusedAmounts.filter(([_, data]) => {
    // If same amount is used with same counterparty multiple times, that's more suspicious
    return data.counterparties.size === 1 && data.count >= 3;
  });

  if (suspiciousReuse.length > 0) {
    const evidence: Evidence[] = suspiciousReuse.slice(0, 3).map(([amountKey, data]) => {
      const [amount, token] = amountKey.split('-');
      const counterparty = Array.from(data.counterparties)[0];
      return {
        description: `${amount} ${token} sent to ${counterparty.slice(0, 8)}... ${data.count} times`,
        severity: 'MEDIUM',
        type: 'amount',
        data: { amount: parseFloat(amount), token, count: data.count, counterparty },
      };
    });

    signals.push({
      id: 'amount-reuse-counterparty',
      name: 'Same Amount to Same Counterparty',
      severity: 'MEDIUM',
      category: 'behavioral',
      reason: `${suspiciousReuse.length} amount(s) repeatedly sent to the same counterparty.`,
      impact: 'Sending the same amount to the same address multiple times creates a strong pattern. This is likely automated or habitual behavior.',
      mitigation: 'Vary amounts when sending to the same address, or use privacy protocols.',
      evidence,
    });
  }

  // Case 3: Same amount + same signer (MEDIUM risk)
  const signerReuse = reusedAmounts.filter(([_, data]) => {
    return data.signers.size <= 2 && data.count >= 3;
  });

  if (signerReuse.length > 0 && suspiciousReuse.length === 0) {
    // Don't double-report if we already caught it above
    const evidence: Evidence[] = signerReuse.slice(0, 3).map(([amountKey, data]) => {
      const [amount, token] = amountKey.split('-');
      return {
        description: `${amount} ${token} used ${data.count} times with ${data.signers.size} signer(s)`,
        severity: 'LOW',
        type: 'amount',
        data: { amount: parseFloat(amount), token, count: data.count },
      };
    });

    signals.push({
      id: 'amount-reuse-pattern',
      name: 'Repeated Amount Pattern',
      severity: 'LOW',
      category: 'behavioral',
      reason: `${signerReuse.length} amount(s) are reused multiple times with consistent signers.`,
      impact: 'Amount reuse alone is relatively weak on Solana, but combined with other signals it contributes to behavioral fingerprinting.',
      mitigation: 'Vary transaction amounts to reduce pattern visibility.',
      evidence,
    });
  }

  // Case 4: High-frequency exact reuse (LOW->MEDIUM)
  const veryReused = reusedAmounts.filter(([_, data]) => data.count >= 5);
  if (veryReused.length > 0 && suspiciousReuse.length === 0 && signerReuse.length === 0) {
    const evidence: Evidence[] = veryReused.slice(0, 3).map(([amountKey, data]) => {
      const [amount, token] = amountKey.split('-');
      return {
        description: `${amount} ${token} used ${data.count} times across ${data.counterparties.size} counterparties`,
        severity: data.count > 10 ? 'MEDIUM' : 'LOW',
        type: 'amount',
        data: { amount: parseFloat(amount), token, count: data.count },
      };
    });

    const maxCount = veryReused[0][1].count;
    const severity = maxCount > 10 ? 'MEDIUM' : 'LOW';

    signals.push({
      id: 'amount-reuse-frequency',
      name: 'High-Frequency Amount Reuse',
      severity,
      category: 'behavioral',
      reason: `${veryReused.length} amount(s) are used very frequently (${maxCount} times for top amount).`,
      impact: 'Extremely frequent reuse of specific amounts suggests automation or habitual behavior, creating a detectable pattern.',
      mitigation: 'If running automated systems, add randomization to amounts.',
      evidence,
    });
  }

  return signals;
}
