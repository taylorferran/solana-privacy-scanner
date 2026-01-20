import type { ScanContext, PrivacySignal, Evidence } from '../types/index.js';

/**
 * Detect memo field exposure
 * 
 * The memo program allows arbitrary text in transactions.
 * This can leak personal information, real names, emails, URLs,
 * and other identifying data permanently on-chain.
 */
export function detectMemoExposure(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];

  if (context.transactionCount === 0) {
    return signals;
  }

  // Check if memo data is available
  if (!context.transactions || context.transactions.length === 0) {
    return signals;
  }

  // Look for memo program usage
  const MEMO_PROGRAM = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
  const MEMO_PROGRAM_V1 = 'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo';
  
  const memoInstructions = context.instructions.filter(inst => 
    inst.programId === MEMO_PROGRAM || inst.programId === MEMO_PROGRAM_V1
  );

  if (memoInstructions.length === 0) {
    return signals;
  }

  // Analyze memo content
  const suspiciousMemos: Array<{ content: string; signature: string; severity: 'HIGH' | 'MEDIUM' | 'LOW' }> = [];
  
  for (const inst of memoInstructions) {
    if (!inst.data || typeof inst.data !== 'string') continue;
    
    const memoText = inst.data.trim();
    if (memoText.length === 0) continue;

    let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    const patterns: string[] = [];

    // Check for PII patterns
    // Email addresses
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(memoText)) {
      patterns.push('email address');
      severity = 'HIGH';
    }

    // URLs
    if (/https?:\/\/[^\s]+/.test(memoText)) {
      patterns.push('URL');
      severity = severity === 'HIGH' ? 'HIGH' : 'MEDIUM';
    }

    // Phone numbers (various formats)
    if (/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(memoText)) {
      patterns.push('phone number');
      severity = 'HIGH';
    }

    // Likely names (capitalized words)
    const capitalizedWords = memoText.match(/\b[A-Z][a-z]+(\s+[A-Z][a-z]+)+\b/g);
    if (capitalizedWords && capitalizedWords.length > 0) {
      patterns.push('likely name(s)');
      severity = severity === 'HIGH' ? 'HIGH' : 'MEDIUM';
    }

    // Long descriptive text (>50 chars)
    if (memoText.length > 50 && !patterns.length) {
      patterns.push('long descriptive text');
      severity = 'MEDIUM';
    }

    // Invoice/payment references
    if (/invoice|payment|order|transaction|ref|reference|id|bill/i.test(memoText)) {
      patterns.push('payment reference');
      severity = severity === 'HIGH' ? 'HIGH' : 'MEDIUM';
    }

    if (patterns.length > 0) {
      suspiciousMemos.push({
        content: memoText.length > 100 ? memoText.slice(0, 100) + '...' : memoText,
        signature: inst.signature,
        severity
      });
    }
  }

  if (suspiciousMemos.length === 0) {
    // Memo used but no suspicious content
    signals.push({
      id: 'memo-usage',
      name: 'Memo Program Usage',
      severity: 'LOW',
      confidence: 0.6,
      category: 'information-leak',
      reason: `${memoInstructions.length} transaction(s) use memo program. Memos are permanently visible on-chain.`,
      impact: 'Memo data is public and permanent. Even non-sensitive memos can contribute to behavioral fingerprinting.',
      mitigation: 'Avoid using memos unless necessary. Never include personal information.',
      evidence: [{
        description: `${memoInstructions.length} transaction(s) with memos`,
        severity: 'LOW',
        reference: undefined,
      }],
    });
  } else {
    // Group by severity
    const highSeverity = suspiciousMemos.filter(m => m.severity === 'HIGH');
    const mediumSeverity = suspiciousMemos.filter(m => m.severity === 'MEDIUM');
    
    if (highSeverity.length > 0) {
      const evidence: Evidence[] = highSeverity.map(memo => ({
        description: `"${memo.content}"`,
        severity: 'HIGH',
        reference: `https://solscan.io/tx/${memo.signature}`,
      }));

      signals.push({
        id: 'memo-pii-exposure',
        name: 'Personal Information in Memo',
        severity: 'HIGH',
        confidence: 0.9,
        category: 'information-leak',
        reason: `${highSeverity.length} memo(s) contain personal identifying information (email, phone, name).`,
        impact: 'CRITICAL: Personal information in memos is permanently public. This can directly link your wallet to your real-world identity.',
        mitigation: 'Never put personal information in memos. Contact addresses involved to stop this practice if possible.',
        evidence,
      });
    }

    if (mediumSeverity.length > 0) {
      const evidence: Evidence[] = mediumSeverity.slice(0, 5).map(memo => ({
        description: `"${memo.content}"`,
        severity: 'MEDIUM',
        reference: `https://solscan.io/tx/${memo.signature}`,
      }));

      signals.push({
        id: 'memo-descriptive-content',
        name: 'Descriptive Content in Memo',
        severity: 'MEDIUM',
        confidence: 0.7,
        category: 'information-leak',
        reason: `${mediumSeverity.length} memo(s) contain descriptive or identifying content.`,
        impact: 'Descriptive memos create behavioral fingerprints and can indirectly reveal identity or transaction purpose.',
        mitigation: 'Minimize memo usage. Use generic or coded references instead of descriptive text.',
        evidence,
      });
    }
  }

  return signals;
}
