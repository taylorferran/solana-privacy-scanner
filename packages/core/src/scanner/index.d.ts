import type { ScanContext, RiskSignal, PrivacyReport } from '../types/index.js';
/**
 * Evaluate all heuristics against a scan context
 */
export declare function evaluateHeuristics(context: ScanContext): RiskSignal[];
/**
 * Generate a complete privacy report from a scan context
 */
export declare function generateReport(context: ScanContext): PrivacyReport;
//# sourceMappingURL=index.d.ts.map