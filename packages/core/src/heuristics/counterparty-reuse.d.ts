import type { ScanContext, RiskSignal } from '../types/index.js';
/**
 * Detect if a wallet frequently interacts with the same counterparties
 * This can enable clustering and linking of addresses
 */
export declare function detectCounterpartyReuse(context: ScanContext): RiskSignal | null;
//# sourceMappingURL=counterparty-reuse.d.ts.map