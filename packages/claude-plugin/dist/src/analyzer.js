/**
 * Static analyzer integration
 *
 * High-level API for static code analysis
 */
import { scanCode } from '../skills/scan-code/handler.js';
/**
 * Analyze source code for privacy issues
 */
export async function analyzeCode(options) {
    return scanCode({
        paths: options.paths,
        noLow: options.excludeLowSeverity,
        json: false,
        verbose: options.verbose,
    });
}
/**
 * Analyze source code and return raw JSON
 */
export async function analyzeCodeJSON(options) {
    return scanCode({
        paths: options.paths,
        noLow: options.excludeLowSeverity,
        json: true,
        verbose: options.verbose,
    });
}
//# sourceMappingURL=analyzer.js.map