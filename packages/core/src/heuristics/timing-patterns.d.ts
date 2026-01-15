import type { ScanContext, RiskSignal } from '../types/index.js';
/**
 * Detect transaction bursts and timing patterns
 * Concentrated activity creates temporal fingerprints
 */
export declare function detectTimingPatterns(context: ScanContext): RiskSignal | null;
//# sourceMappingURL=timing-patterns.d.ts.map