/**
 * explain-risk skill handler
 *
 * Provides detailed explanations of privacy risks detected by the scanner
 */
import type { SkillResult } from '../../src/types.js';
export interface ExplainRiskOptions {
    riskId?: string;
    list?: boolean;
    verbose?: boolean;
}
/**
 * Get explanation for a specific risk
 */
export declare function explainRisk(options: ExplainRiskOptions): Promise<SkillResult>;
/**
 * CLI entry point for testing
 */
export declare function main(): Promise<void>;
//# sourceMappingURL=handler-verbose-backup.d.ts.map