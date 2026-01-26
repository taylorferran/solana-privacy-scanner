/**
 * explain-risk skill handler (simplified version)
 *
 * Provides brief explanations of privacy risks
 */
import type { SkillResult } from '../../src/types.js';
export interface ExplainRiskOptions {
    riskId?: string;
    list?: boolean;
    verbose?: boolean;
}
/**
 * Explain a privacy risk (exported for API use)
 */
export declare function explainRisk(options: ExplainRiskOptions): Promise<SkillResult>;
/**
 * Skill handler (called by Claude Code)
 */
export declare function handler(args: string[], options: ExplainRiskOptions): Promise<SkillResult>;
//# sourceMappingURL=handler.d.ts.map