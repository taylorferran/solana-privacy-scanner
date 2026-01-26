/**
 * High-level API for generating privacy fixes
 */
import type { SkillResult } from './types.js';
export interface FixOptions {
    riskId: string;
    verbose?: boolean;
}
/**
 * Get code-level fix suggestion for a privacy risk
 */
export declare function suggestPrivacyFix(options: FixOptions): Promise<SkillResult>;
/**
 * List all available fix templates
 */
export declare function listAvailableFixes(): Promise<SkillResult>;
//# sourceMappingURL=fixer.d.ts.map