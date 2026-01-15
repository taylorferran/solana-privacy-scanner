import type { ScanContext, RiskSignal } from '../types/index.js';
/**
 * Detect if the wallet sends or receives suspiciously similar amounts
 * Round numbers or repeated exact amounts can be used for fingerprinting
 */
export declare function detectAmountReuse(context: ScanContext): RiskSignal | null;
//# sourceMappingURL=amount-reuse.d.ts.map