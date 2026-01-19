import type { ScanContext, PrivacySignal, Evidence } from '../types/index.js';

/**
 * Detect signer set overlap - strong linkage vector on Solana
 * 
 * Solana transactions can have multiple signers. If the same signer
 * appears across many transactions, or if the same set of signers is reused,
 * this creates strong linkage.
 * 
 * This is stronger than amount reuse and more reliable than timing patterns.
 */
export function detectSignerOverlap(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];

  // Need at least a few transactions to detect patterns
  if (context.transactionCount < 2) {
    return signals;
  }

  // Check if Solana-specific data is available
  if (!context.transactions || context.transactions.length === 0) {
    return signals;
  }

  // Build signer frequency map
  const signerFrequency = new Map<string, number>();
  const signerTransactions = new Map<string, string[]>(); // signer -> signature[]
  
  for (const tx of context.transactions) {
    for (const signer of tx.signers) {
      signerFrequency.set(signer, (signerFrequency.get(signer) || 0) + 1);
      
      if (!signerTransactions.has(signer)) {
        signerTransactions.set(signer, []);
      }
      signerTransactions.get(signer)!.push(tx.signature);
    }
  }

  // Case 1: Same signer appears in most/all transactions (excluding target)
  const target = context.target;
  const frequentSigners = Array.from(signerFrequency.entries())
    .filter(([signer]) => signer !== target)
    .filter(([_, count]) => count >= Math.min(3, Math.ceil(context.transactionCount * 0.3)))
    .sort((a, b) => b[1] - a[1]);

  if (frequentSigners.length > 0) {
    const evidence: Evidence[] = frequentSigners.map(([signer, count]) => {
      const label = context.labels.get(signer);
      return {
        description: `${signer}${label ? ` (${label.name})` : ''} signed ${count}/${context.transactionCount} transactions`,
        severity: count > context.transactionCount * 0.7 ? 'HIGH' : 'MEDIUM',
        reference: undefined,
      };
    });

    const topSignerCount = frequentSigners[0][1];
    const severity = topSignerCount > context.transactionCount * 0.7 ? 'HIGH' : 'MEDIUM';

    signals.push({
      id: 'signer-repeated',
      name: 'Repeated Signer Across Transactions',
      severity,
      category: 'linkability',
      reason: `${frequentSigners.length} address(es) repeatedly sign transactions involving the target. The most frequent signer appears in ${topSignerCount}/${context.transactionCount} transactions.`,
      impact: 'Repeated signers create hard links between transactions. All transactions signed by the same address are trivially linkable.',
      mitigation: 'If you control multiple addresses that sign together, they are permanently linked. Use separate signing keys for unrelated activities.',
      evidence,
    });
  }

  // Case 2: Multi-signature patterns (same set of signers)
  // Build signature sets
  const signerSets = new Map<string, number>(); // JSON stringified set -> count
  const signerSetExamples = new Map<string, string>(); // JSON stringified set -> example signature
  
  for (const tx of context.transactions) {
    // Sort signers for consistent hashing
    const sortedSigners = [...tx.signers].sort();
    const setKey = JSON.stringify(sortedSigners);
    signerSets.set(setKey, (signerSets.get(setKey) || 0) + 1);
    
    if (!signerSetExamples.has(setKey)) {
      signerSetExamples.set(setKey, tx.signature);
    }
  }

  // Find repeated signer sets (multi-sig patterns)
  const repeatedSets = Array.from(signerSets.entries())
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);

  if (repeatedSets.length > 0) {
    const evidence: Evidence[] = repeatedSets.map(([setKey, count]) => {
      const signers: string[] = JSON.parse(setKey);
      const exampleSig = signerSetExamples.get(setKey)!;
      return {
        description: `${count} transactions with identical signer set: [${signers.map(s => s.slice(0, 8)).join(', ')}...]`,
        severity: count > 2 ? 'MEDIUM' : 'LOW',
        reference: `https://solscan.io/tx/${exampleSig}`,
      };
    });

    signals.push({
      id: 'signer-set-reuse',
      name: 'Repeated Multi-Signature Pattern',
      severity: 'MEDIUM',
      category: 'linkability',
      reason: `${repeatedSets.length} distinct signer set(s) are reused multiple times. This creates a unique fingerprint.`,
      impact: 'Reused multi-sig patterns are highly unique and easily linkable. Even if addresses differ, the signer set pattern can identify related activity.',
      mitigation: 'If using multi-sig for multiple transactions, rotate signing keys or use threshold signatures to vary the signer set.',
      evidence,
    });
  }

  // Case 3: Authority overlap (one signer signs for many different "primary" accounts)
  // This detects if a single signer is acting as an authority for multiple accounts
  if (context.targetType === 'program' || context.transactionCount > 10) {
    // Build a map of: signer -> set of other signers they've co-signed with
    const signerCoSigners = new Map<string, Set<string>>();
    
    for (const tx of context.transactions) {
      for (const signer of tx.signers) {
        if (!signerCoSigners.has(signer)) {
          signerCoSigners.set(signer, new Set());
        }
        for (const otherSigner of tx.signers) {
          if (otherSigner !== signer) {
            signerCoSigners.get(signer)!.add(otherSigner);
          }
        }
      }
    }

    // Find signers that co-sign with many different addresses
    const authorityCandidates = Array.from(signerCoSigners.entries())
      .filter(([_, coSigners]) => coSigners.size >= 3)
      .sort((a, b) => b[1].size - a[1].size);

    if (authorityCandidates.length > 0) {
      const evidence: Evidence[] = authorityCandidates.slice(0, 3).map(([signer, coSigners]) => {
        const label = context.labels.get(signer);
        const txCount = signerFrequency.get(signer) || 0;
        return {
          description: `${signer}${label ? ` (${label.name})` : ''} co-signed with ${coSigners.size} different addresses across ${txCount} transactions`,
          severity: 'HIGH',
          reference: undefined,
        };
      });

      signals.push({
        id: 'signer-authority-hub',
        name: 'Authority Signer Detected',
        severity: 'HIGH',
        category: 'linkability',
        reason: `${authorityCandidates.length} address(es) act as an authority, co-signing with multiple different wallets. This exposes a control hub.`,
        impact: 'An authority signer links all accounts it co-signs with. This reveals organizational structure or bot infrastructure.',
        mitigation: 'Use unique authority keys for each logical group of accounts. Avoid having a single "master" signer.',
        evidence,
      });
    }
  }

  return signals;
}
