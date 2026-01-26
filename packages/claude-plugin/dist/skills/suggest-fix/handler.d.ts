/**
 * suggest-fix skill handler
 *
 * Generates code-level fixes for privacy issues
 */
import type { SkillResult } from '../../src/types.js';
export interface SuggestFixOptions {
    target?: string;
    list?: boolean;
    verbose?: boolean;
}
/**
 * Generate fix suggestion for a specific issue
 */
export declare function suggestFix(options: SuggestFixOptions): Promise<SkillResult>;
/**
 * CLI entry point for testing
 */
export declare function main(): Promise<void>;
//# sourceMappingURL=handler.d.ts.map