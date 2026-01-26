/**
 * High-level API for explaining privacy risks
 */
import type { SkillResult } from './types.js';
export interface ExplainOptions {
    riskId: string;
    verbose?: boolean;
}
/**
 * Get detailed explanation of a privacy risk
 */
export declare function explainPrivacyRisk(options: ExplainOptions): Promise<SkillResult>;
/**
 * List all available risk explanations
 */
export declare function listAvailableRisks(): Promise<SkillResult>;
//# sourceMappingURL=explainer.d.ts.map