import type { ScanContext, PrivacySignal, Evidence } from '../types/index.js';

/**
 * Detect token account lifecycle linkage
 * 
 * On Solana, token accounts have a lifecycle:
 * 1. Created (rent-exempt SOL locked)
 * 2. Used for transfers
 * 3. Closed (rent refunded)
 * 
 * The rent refund goes back to the owner, creating a link between
 * the "burner" token account and the owner wallet.
 */
export function detectTokenAccountLifecycle(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];

  // Need token account events to analyze
  if (!context.tokenAccountEvents || context.tokenAccountEvents.length === 0) {
    return signals;
  }

  // Group events by token account
  const accountEvents = new Map<string, typeof context.tokenAccountEvents>();
  for (const event of context.tokenAccountEvents) {
    if (!accountEvents.has(event.tokenAccount)) {
      accountEvents.set(event.tokenAccount, []);
    }
    accountEvents.get(event.tokenAccount)!.push(event);
  }

  // Case 1: Frequent token account creation/closure (burner pattern)
  const createEvents = context.tokenAccountEvents.filter(e => e.type === 'create');
  const closeEvents = context.tokenAccountEvents.filter(e => e.type === 'close');

  if (createEvents.length >= 2 && closeEvents.length >= 2) {
    // Check if closures refund to the same address
    const refundDestinations = new Map<string, number>();
    const totalRefunded = closeEvents.reduce((sum, event) => {
      if (event.rentRefund) {
        refundDestinations.set(event.owner, (refundDestinations.get(event.owner) || 0) + event.rentRefund);
        return sum + event.rentRefund;
      }
      return sum;
    }, 0);

    if (refundDestinations.size > 0) {
      const evidence: Evidence[] = Array.from(refundDestinations.entries()).map(([owner, amount]) => ({
        description: `${amount.toFixed(4)} SOL refunded to ${owner.slice(0, 8)}... from ${closeEvents.filter(e => e.owner === owner).length} closed account(s)`,
        severity: 'MEDIUM',
        reference: undefined,
      }));

      signals.push({
        id: 'token-account-churn',
        name: 'Frequent Token Account Creation/Closure',
        severity: 'MEDIUM',
        category: 'behavioral',
        reason: `${createEvents.length} token account(s) created and ${closeEvents.length} closed. Rent refunds totaling ${totalRefunded.toFixed(4)} SOL expose ownership.`,
        impact: 'Rent refunds link temporary token accounts back to the owner wallet. This pattern defeats the purpose of using "burner" accounts.',
        mitigation: 'If using temporary token accounts for privacy, leave them open (accept the small rent cost) rather than closing and refunding to your main wallet.',
        evidence,
      });
    }
  }

  // Case 2: Complete lifecycles (create -> use -> close in quick succession)
  const completeLifecycles: Array<{ tokenAccount: string; events: typeof context.tokenAccountEvents; duration: number }> = [];

  for (const [tokenAccount, events] of accountEvents) {
    const creates = events.filter(e => e.type === 'create');
    const closes = events.filter(e => e.type === 'close');

    if (creates.length > 0 && closes.length > 0) {
      // Calculate lifecycle duration
      const createTime = creates[0].blockTime;
      const closeTime = closes[closes.length - 1].blockTime;

      if (createTime && closeTime) {
        const duration = closeTime - createTime;
        completeLifecycles.push({ tokenAccount, events, duration });
      }
    }
  }

  // Find short-lived accounts (less than 1 hour)
  const shortLived = completeLifecycles.filter(lc => lc.duration < 3600);

  if (shortLived.length >= 2) {
    const evidence: Evidence[] = shortLived.slice(0, 5).map(lc => {
      const durationMin = Math.floor(lc.duration / 60);
      const closeEvent = lc.events.find(e => e.type === 'close');
      return {
        description: `${lc.tokenAccount.slice(0, 8)}... lived for ${durationMin} minute(s)${closeEvent?.rentRefund ? `, refunded ${closeEvent.rentRefund.toFixed(4)} SOL` : ''}`,
        severity: 'LOW',
        reference: undefined,
      };
    });

    signals.push({
      id: 'token-account-short-lived',
      name: 'Short-Lived Token Accounts',
      severity: 'LOW',
      category: 'behavioral',
      reason: `${shortLived.length} token account(s) were created and closed within an hour, suggesting burner account usage.`,
      impact: 'Short-lived accounts suggest privacy-conscious behavior, but rent refunds still create linkage.',
      mitigation: 'For true privacy, do not close accounts immediately. The rent refund links the burner back to you.',
      evidence,
    });
  }

  // Case 3: Same owner across multiple token accounts
  const ownerAccounts = new Map<string, Set<string>>();

  for (const event of context.tokenAccountEvents) {
    if (event.type === 'create') {
      if (!ownerAccounts.has(event.owner)) {
        ownerAccounts.set(event.owner, new Set());
      }
      ownerAccounts.get(event.owner)!.add(event.tokenAccount);
    }
  }

  const multiAccountOwners = Array.from(ownerAccounts.entries())
    .filter(([_, accounts]) => accounts.size >= 2)
    .sort((a, b) => b[1].size - a[1].size);

  if (multiAccountOwners.length > 0) {
    const [owner, accounts] = multiAccountOwners[0];
    const isTarget = owner === context.target;

    if (!isTarget || multiAccountOwners.length > 1) {
      const evidence: Evidence[] = multiAccountOwners.slice(0, 3).map(([own, accs]) => {
        const label = context.labels.get(own);
        return {
          description: `${own.slice(0, 8)}...${label ? ` (${label.name})` : ''} owns ${accs.size} token account(s)`,
          severity: 'LOW',
          reference: undefined,
        };
      });

      signals.push({
        id: 'token-account-common-owner',
        name: 'Common Owner Across Token Accounts',
        severity: 'LOW',
        category: 'linkability',
        reason: `${multiAccountOwners.length} wallet(s) control multiple token accounts. The top owner controls ${accounts.size} accounts.`,
        impact: 'All token accounts with the same owner are trivially linked.',
        mitigation: 'This is inherent to Solana\'s token account model and cannot be avoided.',
        evidence,
      });
    }
  }

  // Case 4: Rent refund clustering (same address receives multiple refunds)
  const rentRefundReceivers = new Map<string, { count: number; total: number }>();

  for (const event of context.tokenAccountEvents) {
    if (event.type === 'close' && event.rentRefund) {
      const current = rentRefundReceivers.get(event.owner) || { count: 0, total: 0 };
      current.count++;
      current.total += event.rentRefund;
      rentRefundReceivers.set(event.owner, current);
    }
  }

  const significantRefunds = Array.from(rentRefundReceivers.entries())
    .filter(([_, { count }]) => count >= 3)
    .sort((a, b) => b[1].count - a[1].count);

  if (significantRefunds.length > 0) {
    const evidence: Evidence[] = significantRefunds.slice(0, 3).map(([owner, { count, total }]) => ({
      description: `${owner.slice(0, 8)}... received ${count} rent refunds totaling ${total.toFixed(4)} SOL`,
      severity: 'MEDIUM',
      reference: undefined,
    }));

    const [topOwner, topData] = significantRefunds[0];

    signals.push({
      id: 'rent-refund-clustering',
      name: 'Rent Refund Clustering',
      severity: 'MEDIUM',
      category: 'linkability',
      reason: `${significantRefunds.length} address(es) receive multiple rent refunds. ${topOwner.slice(0, 8)}... received ${topData.count} refunds.`,
      impact: 'Rent refunds link closed token accounts back to a central wallet. This exposes the control structure.',
      mitigation: 'Do not close token accounts if privacy is important. The small rent cost (~0.002 SOL) is cheaper than the privacy loss.',
      evidence,
    });
  }

  return signals;
}
