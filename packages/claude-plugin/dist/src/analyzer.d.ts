/**
 * Static analyzer integration
 *
 * High-level API for static code analysis
 */
import type { SkillResult } from './types.js';
export interface AnalyzeOptions {
    paths: string[];
    excludeLowSeverity?: boolean;
    verbose?: boolean;
}
/**
 * Analyze source code for privacy issues
 */
export declare function analyzeCode(options: AnalyzeOptions): Promise<SkillResult>;
/**
 * Analyze source code and return raw JSON
 */
export declare function analyzeCodeJSON(options: AnalyzeOptions): Promise<SkillResult>;
//# sourceMappingURL=analyzer.d.ts.map