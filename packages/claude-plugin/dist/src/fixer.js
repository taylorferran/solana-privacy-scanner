/**
 * High-level API for generating privacy fixes
 */
import { suggestFix } from '../skills/suggest-fix/handler.js';
/**
 * Get code-level fix suggestion for a privacy risk
 */
export async function suggestPrivacyFix(options) {
    return suggestFix({
        target: options.riskId,
        list: false,
        verbose: options.verbose,
    });
}
/**
 * List all available fix templates
 */
export async function listAvailableFixes() {
    return suggestFix({
        list: true,
    });
}
//# sourceMappingURL=fixer.js.map