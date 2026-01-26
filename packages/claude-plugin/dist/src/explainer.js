/**
 * High-level API for explaining privacy risks
 */
import { explainRisk } from '../skills/explain-risk/handler.js';
/**
 * Get detailed explanation of a privacy risk
 */
export async function explainPrivacyRisk(options) {
    return explainRisk({
        riskId: options.riskId,
        list: false,
        verbose: options.verbose,
    });
}
/**
 * List all available risk explanations
 */
export async function listAvailableRisks() {
    return explainRisk({
        list: true,
    });
}
//# sourceMappingURL=explainer.js.map