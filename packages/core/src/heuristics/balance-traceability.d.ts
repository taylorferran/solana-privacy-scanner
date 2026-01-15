import type { ScanContext, RiskSignal } from '../types/index.js';
/**
 * Detect if wallet balances can be easily traced
 * Full balance transfers or predictable balance changes reduce privacy
 */
export declare function detectBalanceTraceability(context: ScanContext): RiskSignal | null;
//# sourceMappingURL=balance-traceability.d.ts.map