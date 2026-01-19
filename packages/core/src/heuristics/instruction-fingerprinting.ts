import type { ScanContext, PrivacySignal, Evidence } from '../types/index.js';

/**
 * Detect instruction fingerprinting - program interaction patterns
 * 
 * Many programs have unique instruction layouts, account ordering,
 * and deterministic PDA derivations. Even if addresses differ,
 * instruction structure can fingerprint users.
 * 
 * Examples:
 * - Same DeFi strategy across multiple wallets
 * - Same bot configuration
 * - Same seed derivation patterns
 */
export function detectInstructionFingerprinting(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];

  // Need multiple transactions to detect patterns
  if (context.transactionCount < 3) {
    return signals;
  }

  // Check if Solana-specific data is available
  if (!context.transactions || context.transactions.length === 0) {
    return signals;
  }

  // Case 1: Repeated instruction sequences
  // Build instruction sequence fingerprints
  const sequenceFingerprints = new Map<string, number>();
  const sequenceExamples = new Map<string, string[]>(); // fingerprint -> signatures
  
  for (const tx of context.transactions) {
    // Get all instructions for this transaction
    const txInstructions = context.instructions
      .filter(inst => inst.signature === tx.signature)
      .map(inst => inst.programId);
    
    if (txInstructions.length === 0) continue;

    // Create a fingerprint from the sequence
    const sequence = txInstructions.join('->');
    sequenceFingerprints.set(sequence, (sequenceFingerprints.get(sequence) || 0) + 1);
    
    if (!sequenceExamples.has(sequence)) {
      sequenceExamples.set(sequence, []);
    }
    sequenceExamples.get(sequence)!.push(tx.signature);
  }

  // Find repeated sequences
  const repeatedSequences = Array.from(sequenceFingerprints.entries())
    .filter(([_, count]) => count >= Math.min(3, Math.ceil(context.transactionCount * 0.2)))
    .sort((a, b) => b[1] - a[1]);

  if (repeatedSequences.length > 0) {
    const evidence: Evidence[] = repeatedSequences.slice(0, 5).map(([sequence, count]) => {
      const exampleSigs = sequenceExamples.get(sequence)!.slice(0, 2);
      const programs = sequence.split('->').map(p => p.slice(0, 8) + '...').join(' → ');
      return {
        description: `Instruction sequence repeated ${count} times: ${programs}`,
        severity: count > context.transactionCount * 0.5 ? 'MEDIUM' : 'LOW',
        reference: `https://solscan.io/tx/${exampleSigs[0]}`,
      };
    });

    const topSequenceCount = repeatedSequences[0][1];
    const severity = topSequenceCount > context.transactionCount * 0.5 ? 'MEDIUM' : 'LOW';

    signals.push({
      id: 'instruction-sequence-pattern',
      name: 'Repeated Instruction Sequence Pattern',
      severity,
      category: 'behavioral',
      reason: `${repeatedSequences.length} distinct instruction sequence(s) are repeated multiple times. The most common pattern appears in ${topSequenceCount}/${context.transactionCount} transactions.`,
      impact: 'Repeated instruction patterns create a behavioral fingerprint. Even with different addresses, these patterns can link related activity.',
      mitigation: 'Vary the order or combination of operations. Add dummy instructions or randomize transaction structure where possible.',
      evidence,
    });
  }

  // Case 2: Program interaction clustering
  // Build program usage profiles
  const programUsage = new Map<string, number>();
  
  for (const inst of context.instructions) {
    programUsage.set(inst.programId, (programUsage.get(inst.programId) || 0) + 1);
  }

  // Find uncommon programs used frequently
  const COMMON_PROGRAMS = [
    '11111111111111111111111111111111', // System
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // SPL Token
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token
    'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr', // Memo
    'ComputeBudget111111111111111111111111111111', // Compute Budget
  ];

  const uniquePrograms = Array.from(programUsage.entries())
    .filter(([programId]) => !COMMON_PROGRAMS.includes(programId))
    .filter(([_, count]) => count >= Math.min(2, Math.ceil(context.transactionCount * 0.15)))
    .sort((a, b) => b[1] - a[1]);

  if (uniquePrograms.length >= 2) {
    const evidence: Evidence[] = uniquePrograms.slice(0, 5).map(([programId, count]) => {
      const label = context.labels.get(programId);
      return {
        description: `${programId.slice(0, 8)}...${label ? ` (${label.name})` : ''} used in ${count} transactions`,
        severity: 'LOW',
        reference: `https://solscan.io/account/${programId}`,
      };
    });

    signals.push({
      id: 'program-usage-profile',
      name: 'Distinctive Program Usage Profile',
      severity: 'LOW',
      category: 'behavioral',
      reason: `This address uses ${uniquePrograms.length} less-common programs repeatedly. This creates a unique usage profile.`,
      impact: 'Program usage patterns can fingerprint wallet behavior. Addresses with similar program usage profiles are likely related.',
      mitigation: 'Using niche protocols creates a fingerprint. This is difficult to mitigate without changing your DeFi strategy.',
      evidence,
    });
  }

  // Case 3: PDA interaction patterns (Solana-specific)
  if (context.pdaInteractions.length > 0) {
    // Build PDA reuse map
    const pdaUsage = new Map<string, { count: number; programId: string }>();
    
    for (const pda of context.pdaInteractions) {
      if (!pdaUsage.has(pda.pda)) {
        pdaUsage.set(pda.pda, { count: 0, programId: pda.programId });
      }
      pdaUsage.get(pda.pda)!.count++;
    }

    // Find PDAs used multiple times
    const repeatedPDAs = Array.from(pdaUsage.entries())
      .filter(([_, { count }]) => count > 1)
      .sort((a, b) => b[1].count - a[1].count);

    if (repeatedPDAs.length > 0) {
      const evidence: Evidence[] = repeatedPDAs.slice(0, 5).map(([pda, { count, programId }]) => ({
        description: `PDA ${pda.slice(0, 8)}... used ${count} times (program: ${programId.slice(0, 8)}...)`,
        severity: count > 3 ? 'MEDIUM' : 'LOW',
        reference: `https://solscan.io/account/${pda}`,
      }));

      const maxPDAUsage = repeatedPDAs[0][1].count;
      const severity = maxPDAUsage > 3 ? 'MEDIUM' : 'LOW';

      signals.push({
        id: 'pda-reuse-pattern',
        name: 'Repeated PDA Interaction',
        severity,
        category: 'behavioral',
        reason: `${repeatedPDAs.length} Program-Derived Address(es) are used repeatedly. The most common PDA appears in ${maxPDAUsage} transactions.`,
        impact: 'Repeated PDA usage links transactions. If the PDA is specific to you (e.g., a user account), all interactions with it are linked.',
        mitigation: 'Some PDA reuse is unavoidable (e.g., your DEX pool position). For sensitive operations, consider using fresh accounts or different protocols.',
        evidence,
      });
    }
  }

  // Case 4: Instruction data similarity (advanced)
  // Group instructions by program and check for similar data patterns
  const programInstructions = new Map<string, any[]>();
  
  for (const inst of context.instructions) {
    if (!programInstructions.has(inst.programId)) {
      programInstructions.set(inst.programId, []);
    }
    if (inst.data) {
      programInstructions.get(inst.programId)!.push(inst.data);
    }
  }

  // Find programs with repeated data patterns
  for (const [programId, dataList] of programInstructions) {
    if (dataList.length < 2) continue;

    // Check for identical instruction types
    const typeMap = new Map<string, number>();
    for (const data of dataList) {
      if (data && typeof data === 'object' && 'type' in data) {
        const type = String(data.type);
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      }
    }

    const repeatedTypes = Array.from(typeMap.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);

    if (repeatedTypes.length > 0 && repeatedTypes[0][1] >= 3) {
      const [instructionType, count] = repeatedTypes[0];
      const label = context.labels.get(programId);

      signals.push({
        id: `instruction-type-${programId.slice(0, 8)}`,
        name: 'Repeated Instruction Type',
        severity: 'LOW',
        category: 'behavioral',
        reason: `The instruction type "${instructionType}" on program ${programId.slice(0, 8)}...${label ? ` (${label.name})` : ''} is used ${count} times.`,
        impact: 'Repeated instruction types on the same program suggest automated behavior or specific strategy execution.',
        mitigation: 'This is generally low-risk but contributes to behavioral fingerprinting. Diversify your transaction types if possible.',
        evidence: [{
          description: `"${instructionType}" instruction used ${count} times`,
          severity: 'LOW',
          reference: undefined,
        }],
      });
    }
  }

  return signals;
}
