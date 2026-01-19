import type { ScanContext, PrivacySignal, Evidence } from '../types/index.js';

/**
 * Detect counterparty reuse - Solana-aware version
 * 
 * On Solana, most interactions are via programs, not direct transfers.
 * The "real counterparty" is often:
 * - Program-Derived Address (PDA)
 * - Vault account
 * - Pool account
 * 
 * This heuristic clusters by program ID and PDA address, not just raw transfers.
 */
export function detectCounterpartyReuse(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];

  // Only applicable to wallet scans with multiple transactions
  if (context.targetType !== 'wallet' || context.transactionCount < 2) {
    return signals;
  }

  // Case 1: Traditional transfer counterparty reuse
  if (context.transfers.length > 0) {
    const interactionCounts = new Map<string, number>();
    
    for (const transfer of context.transfers) {
      const counterparty = transfer.from === context.target ? transfer.to : transfer.from;
      if (counterparty === context.target) continue;
      
      interactionCounts.set(counterparty, (interactionCounts.get(counterparty) || 0) + 1);
    }

    // Find counterparties with multiple interactions
    const reusedCounterparties = Array.from(interactionCounts.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1]);

    if (reusedCounterparties.length > 0) {
      // Calculate severity based on concentration
      const totalInteractions = context.transfers.length;
      const topCounterpartyInteractions = reusedCounterparties[0][1];
      const concentration = topCounterpartyInteractions / totalInteractions;

      let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (concentration > 0.5 || reusedCounterparties.length >= 5) {
        severity = 'HIGH';
      } else if (concentration > 0.3 || reusedCounterparties.length >= 3) {
        severity = 'MEDIUM';
      }

      const evidence: Evidence[] = reusedCounterparties.slice(0, 5).map(([addr, count]) => {
        const label = context.labels.get(addr);
        return {
          description: `${count} transfers with ${addr.slice(0, 8)}...${addr.slice(-8)}${label ? ` (${label.name})` : ''}`,
          severity: count > totalInteractions * 0.3 ? 'HIGH' : count > totalInteractions * 0.15 ? 'MEDIUM' : 'LOW',
          type: 'address',
          data: { address: addr, interactionCount: count },
        };
      });

      signals.push({
        id: 'counterparty-reuse',
        name: 'Repeated Transfer Counterparties',
        severity,
        category: 'linkability',
        reason: `Wallet repeatedly transfers with ${reusedCounterparties.length} address(es). Top counterparty: ${topCounterpartyInteractions}/${totalInteractions} transfers.`,
        impact: 'Repeated interactions with the same addresses can be used to cluster wallets and build transaction graphs.',
        evidence,
        mitigation: 'Use different wallets for different counterparties, or use privacy-preserving protocols.',
      });
    }
  }

  // Case 2: Program interaction patterns (Solana-specific)
  if (context.programs && context.programs.size > 0) {
    const programUsage = new Map<string, number>();
    
    for (const instruction of context.instructions) {
      programUsage.set(instruction.programId, (programUsage.get(instruction.programId) || 0) + 1);
    }

    // Filter out system programs
    const SYSTEM_PROGRAMS = [
      '11111111111111111111111111111111',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
      'ComputeBudget111111111111111111111111111111',
    ];

    const significantPrograms = Array.from(programUsage.entries())
      .filter(([programId]) => !SYSTEM_PROGRAMS.includes(programId))
      .filter(([_, count]) => count >= Math.min(3, Math.ceil(context.instructions.length * 0.1)))
      .sort((a, b) => b[1] - a[1]);

    if (significantPrograms.length >= 2) {
      const evidence: Evidence[] = significantPrograms.slice(0, 5).map(([programId, count]) => {
        const label = context.labels.get(programId);
        return {
          description: `${programId.slice(0, 8)}...${label ? ` (${label.name})` : ''} used in ${count} instruction(s)`,
          severity: 'LOW',
          reference: `https://solscan.io/account/${programId}`,
        };
      });

      signals.push({
        id: 'program-reuse',
        name: 'Repeated Program Interactions',
        severity: 'LOW',
        category: 'behavioral',
        reason: `Wallet interacts with ${significantPrograms.length} non-system program(s) repeatedly.`,
        impact: 'Program usage patterns create a behavioral fingerprint. Addresses with similar patterns are likely related.',
        mitigation: 'This is generally unavoidable when using DeFi. Diversifying protocols can reduce fingerprinting.',
        evidence,
      });
    }
  }

  // Case 3: PDA reuse (most Solana-specific)
  if (context.pdaInteractions && context.pdaInteractions.length > 0) {
    const pdaUsage = new Map<string, { count: number; programId: string }>();
    
    for (const pda of context.pdaInteractions) {
      if (!pdaUsage.has(pda.pda)) {
        pdaUsage.set(pda.pda, { count: 0, programId: pda.programId });
      }
      pdaUsage.get(pda.pda)!.count++;
    }

    // Find PDAs used multiple times
    const repeatedPDAs = Array.from(pdaUsage.entries())
      .filter(([_, { count }]) => count >= 2)
      .sort((a, b) => b[1].count - a[1].count);

    if (repeatedPDAs.length > 0) {
      const evidence: Evidence[] = repeatedPDAs.slice(0, 5).map(([pda, { count, programId }]) => ({
        description: `PDA ${pda.slice(0, 8)}... (program: ${programId.slice(0, 8)}...) used ${count} times`,
        severity: count > 3 ? 'MEDIUM' : 'LOW',
        reference: `https://solscan.io/account/${pda}`,
      }));

      const maxCount = repeatedPDAs[0][1].count;
      const severity = maxCount > 5 ? 'MEDIUM' : 'LOW';

      signals.push({
        id: 'pda-reuse',
        name: 'Repeated PDA Interactions',
        severity,
        category: 'linkability',
        reason: `${repeatedPDAs.length} Program-Derived Address(es) are used repeatedly. Max usage: ${maxCount} times.`,
        impact: 'PDAs often represent user-specific accounts (e.g., your position in a protocol). Repeated usage links all interactions.',
        mitigation: 'Some PDA reuse is inherent to Solana protocols. For sensitive operations, use fresh wallets.',
        evidence,
      });
    }
  }

  // Case 4: Program-counterparty combo (advanced)
  // Detect if the same counterparty is used with the same program repeatedly
  // This is more specific than either heuristic alone
  if (context.transfers.length > 0 && context.instructions.length > 0) {
    const combos = new Map<string, number>();
    
    for (const transfer of context.transfers) {
      const counterparty = transfer.from === context.target ? transfer.to : transfer.from;
      if (counterparty === context.target) continue;

      // Find instructions in the same transaction
      const txInstructions = context.instructions.filter(inst => inst.signature === transfer.signature);
      for (const inst of txInstructions) {
        const combo = `${counterparty}:${inst.programId}`;
        combos.set(combo, (combos.get(combo) || 0) + 1);
      }
    }

    const repeatedCombos = Array.from(combos.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);

    if (repeatedCombos.length > 0) {
      const evidence: Evidence[] = repeatedCombos.slice(0, 3).map(([combo, count]) => {
        const [counterparty, programId] = combo.split(':');
        const label = context.labels.get(counterparty);
        return {
          description: `${counterparty.slice(0, 8)}...${label ? ` (${label.name})` : ''} + program ${programId.slice(0, 8)}... used ${count} times`,
          severity: 'MEDIUM',
        };
      });

      signals.push({
        id: 'counterparty-program-combo',
        name: 'Repeated Counterparty-Program Combination',
        severity: 'MEDIUM',
        category: 'linkability',
        reason: `${repeatedCombos.length} specific counterparty-program combination(s) are reused.`,
        impact: 'This creates a very specific fingerprint. The combination of WHO you interact with and WHAT program is highly identifying.',
        mitigation: 'Rotate both counterparties and programs if privacy is critical.',
        evidence,
      });
    }
  }

  return signals;
}
