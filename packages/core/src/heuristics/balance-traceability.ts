import type { ScanContext, PrivacySignal, Evidence } from '../types/index.js';

/**
 * Detect if wallet balances can be easily traced
 * Full balance transfers or predictable balance changes reduce privacy
 */
export function detectBalanceTraceability(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];

  if (context.targetType !== 'wallet' || context.transfers.length < 2) {
    return signals;
  }

  // Case 1: Matching send/receive pairs
  const amountPairs = new Map<string, number>();
  
  for (const transfer of context.transfers) {
    const amountKey = transfer.amount.toFixed(6);
    amountPairs.set(amountKey, (amountPairs.get(amountKey) || 0) + 1);
  }

  // Find matching send/receive pairs
  const matchingPairs = Array.from(amountPairs.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  if (matchingPairs.length >= 2) {
    const evidence: Evidence[] = matchingPairs.slice(0, 5).map(([amount, count]) => ({
      description: `Amount ${amount} appears in ${count} transfers`,
      severity: count >= 4 ? 'HIGH' : 'MEDIUM',
      reference: undefined,
    }));

    const severity = matchingPairs.length >= 4 ? 'HIGH' : matchingPairs.length >= 3 ? 'MEDIUM' : 'LOW';

    signals.push({
      id: 'balance-matching-pairs',
      name: 'Matching Send/Receive Amounts',
      severity,
      confidence: 0.7,
      category: 'traceability',
      reason: `${matchingPairs.length} amount(s) appear in multiple transfers, suggesting balance movements.`,
      impact: 'Matching amounts can be used to trace balance flows. If you receive X and later send X, observers can link these transactions.',
      mitigation: 'Split large transfers into multiple smaller ones with varied amounts. Avoid sending exact amounts you received.',
      evidence,
    });
  }

  // Case 2: Sequential similar amounts (potential balance chaining)
  const sequentialPairs: Array<{ index: number; amount1: number; amount2: number; timeDiff: number }> = [];
  
  for (let i = 0; i < context.transfers.length - 1; i++) {
    const current = context.transfers[i];
    const next = context.transfers[i + 1];
    
    if (current.blockTime && next.blockTime) {
      const timeDiff = Math.abs(next.blockTime - current.blockTime);
      const amountDiff = Math.abs(current.amount - next.amount);
      const percentDiff = amountDiff / Math.max(current.amount, next.amount);
      
      // If similar amounts within reasonable time and amounts are significant
      if (timeDiff < 3600 && percentDiff < 0.1 && current.amount > 0.1) {
        sequentialPairs.push({
          index: i,
          amount1: current.amount,
          amount2: next.amount,
          timeDiff
        });
      }
    }
  }

  if (sequentialPairs.length >= 2) {
    const evidence: Evidence[] = sequentialPairs.slice(0, 3).map(pair => ({
      description: `${pair.amount1.toFixed(4)} → ${pair.amount2.toFixed(4)} (${Math.round(pair.timeDiff / 60)} minutes apart)`,
      severity: pair.timeDiff < 600 ? 'HIGH' : 'MEDIUM',
      reference: undefined,
    }));

    signals.push({
      id: 'balance-sequential-similar',
      name: 'Sequential Similar Amount Transfers',
      severity: 'MEDIUM',
      confidence: 0.65,
      category: 'traceability',
      reason: `${sequentialPairs.length} instance(s) of similar amounts transferred in quick succession.`,
      impact: 'Sequential similar amounts suggest balance movements and make it easy to trace funds through intermediate addresses.',
      mitigation: 'Add random delays between transactions. Vary amounts to obscure the flow path.',
      evidence,
    });
  }

  // Case 3: Round number concentration
  const roundNumbers = context.transfers.filter(t => {
    // Check if amount is a round number (e.g., 1, 10, 100, 0.1, etc.)
    const amount = t.amount;
    if (amount === 0) return false;
    
    // Check various round number patterns
    return (
      amount === Math.floor(amount) || // Whole number
      amount * 10 === Math.floor(amount * 10) || // One decimal
      amount * 100 === Math.floor(amount * 100) // Two decimals
    ) && (
      amount % 1 === 0 || // 1, 10, 100
      (amount * 10) % 1 === 0 || // 0.1, 0.5
      (amount * 100) % 1 === 0 // 0.01, 0.05
    );
  });

  const roundNumberRatio = roundNumbers.length / context.transfers.length;

  if (roundNumberRatio > 0.7 && context.transfers.length >= 5) {
    signals.push({
      id: 'balance-round-numbers',
      name: 'High Proportion of Round Number Transfers',
      severity: 'LOW',
      confidence: 0.6,
      category: 'behavioral',
      reason: `${Math.round(roundNumberRatio * 100)}% of transfers use round numbers.`,
      impact: 'Round numbers are easier to remember and track. They can contribute to balance traceability when combined with other patterns.',
      mitigation: 'Use more varied amounts. Add small random values to make amounts less predictable.',
      evidence: [{
        description: `${roundNumbers.length}/${context.transfers.length} transfers are round numbers`,
        severity: 'LOW',
        reference: undefined,
      }],
    });
  }

  // Case 4: Full balance movements (receive -> send entire amount)
  // Group transfers by token type
  const tokenTransfers = new Map<string, typeof context.transfers>();
  for (const transfer of context.transfers) {
    const token = transfer.token || 'SOL';
    if (!tokenTransfers.has(token)) {
      tokenTransfers.set(token, []);
    }
    tokenTransfers.get(token)!.push(transfer);
  }

  // Look for receive followed by send of very similar amount
  for (const [token, transfers] of tokenTransfers) {
    if (transfers.length < 2) continue;

    const receives = transfers.filter(t => t.to === context.target);
    const sends = transfers.filter(t => t.from === context.target);

    for (const receive of receives) {
      for (const send of sends) {
        if (!receive.blockTime || !send.blockTime) continue;
        if (send.blockTime <= receive.blockTime) continue;

        const timeDiff = send.blockTime - receive.blockTime;
        const percentDiff = Math.abs(send.amount - receive.amount) / receive.amount;

        // If send amount is very close to receive amount and within reasonable time
        if (percentDiff < 0.05 && timeDiff < 86400 && receive.amount > 1) {
          signals.push({
            id: `balance-full-movement-${token}`,
            name: 'Full Balance Movement Detected',
            severity: 'HIGH',
            confidence: 0.8,
            category: 'traceability',
            reason: `Received ${receive.amount.toFixed(4)} ${token}, then sent ${send.amount.toFixed(4)} ${token} shortly after.`,
            impact: 'Moving entire received balances makes fund flow trivially traceable. The path from source to destination is clear.',
            mitigation: 'Split received funds before sending. Mix with other funds. Add delays and intermediate steps.',
            evidence: [{
              description: `Received ${receive.amount.toFixed(4)} → Sent ${send.amount.toFixed(4)} (${Math.round(timeDiff / 60)} minutes later)`,
              severity: 'HIGH',
              reference: undefined,
            }],
          });
          break; // Only report once per token
        }
      }
    }
  }

  return signals;
}
