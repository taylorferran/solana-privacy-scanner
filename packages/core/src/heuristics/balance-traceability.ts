import type { ScanContext, RiskSignal, Evidence } from '../types/index.js';

/**
 * Detect if wallet balances can be easily traced
 * Full balance transfers or predictable balance changes reduce privacy
 */
export function detectBalanceTraceability(context: ScanContext): RiskSignal | null {
  if (context.targetType !== 'wallet' || context.transfers.length < 2) {
    return null;
  }

  const fullBalanceTransfers: Evidence[] = [];
  const suspiciousPatterns: string[] = [];

  // Look for transfers that represent full balance movements
  // (This is simplified - real implementation would need balance tracking)
  
  // Check for transfers where send and receive amounts match closely
  const amountPairs = new Map<string, number>();
  
  for (const transfer of context.transfers) {
    const amountKey = transfer.amount.toFixed(6);
    amountPairs.set(amountKey, (amountPairs.get(amountKey) || 0) + 1);
  }

  // Find matching send/receive pairs
  const matchingPairs = Array.from(amountPairs.entries())
    .filter(([_, count]) => count >= 2);

  if (matchingPairs.length >= 2) {
    suspiciousPatterns.push('Multiple matching send/receive amounts detected');
  }

  // Check for sequential transfers of similar amounts
  for (let i = 0; i < context.transfers.length - 1; i++) {
    const current = context.transfers[i];
    const next = context.transfers[i + 1];
    
    if (current.blockTime && next.blockTime) {
      const timeDiff = Math.abs((next.blockTime - current.blockTime));
      
      // If similar amounts within 1 hour
      if (timeDiff < 3600 && Math.abs(current.amount - next.amount) < current.amount * 0.1) {
        suspiciousPatterns.push('Sequential transfers of similar amounts');
        break;
      }
    }
  }

  if (suspiciousPatterns.length === 0 && matchingPairs.length === 0) {
    return null;
  }

  const evidence: Evidence[] = [];

  if (matchingPairs.length > 0) {
    evidence.push({
      type: 'pattern',
      description: `${matchingPairs.length} matching send/receive amount pair(s)`,
      data: { matchingPairs: matchingPairs.length },
    });
  }

  for (const pattern of suspiciousPatterns) {
    evidence.push({
      type: 'pattern',
      description: pattern,
      data: {},
    });
  }

  let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  if (matchingPairs.length >= 3 || suspiciousPatterns.length >= 2) {
    severity = 'HIGH';
  }

  return {
    id: 'balance-traceability',
    name: 'Balance Traceability',
    severity,
    reason: 'Wallet shows patterns that enable balance tracking',
    impact: 'Traceable balance movements allow observers to follow funds through the blockchain, linking your transactions and revealing your financial activity.',
    evidence,
    mitigation: 'Split large transfers into multiple smaller ones, introduce timing delays, or use privacy protocols that obscure amounts.',
    confidence: 0.7,
  };
}
