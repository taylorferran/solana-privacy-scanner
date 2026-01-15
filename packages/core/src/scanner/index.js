import { detectCounterpartyReuse, detectAmountReuse, detectTimingPatterns, detectKnownEntityInteraction, detectBalanceTraceability, } from '../heuristics/index.js';
/**
 * Current report schema version
 */
const REPORT_VERSION = '1.0.0';
/**
 * All available heuristic functions
 */
const HEURISTICS = [
    detectCounterpartyReuse,
    detectAmountReuse,
    detectTimingPatterns,
    detectKnownEntityInteraction,
    detectBalanceTraceability,
];
/**
 * Calculate overall risk level from individual signals
 * Uses deterministic scoring based on severity and count
 */
function calculateOverallRisk(signals) {
    if (signals.length === 0) {
        return 'LOW';
    }
    // Count signals by severity
    const highCount = signals.filter(s => s.severity === 'HIGH').length;
    const mediumCount = signals.filter(s => s.severity === 'MEDIUM').length;
    const lowCount = signals.filter(s => s.severity === 'LOW').length;
    // Deterministic thresholds
    if (highCount >= 2 || (highCount >= 1 && mediumCount >= 2)) {
        return 'HIGH';
    }
    if (highCount >= 1 || mediumCount >= 2 || (mediumCount >= 1 && lowCount >= 2)) {
        return 'MEDIUM';
    }
    return 'LOW';
}
/**
 * Generate general mitigation recommendations based on detected signals
 */
function generateMitigations(signals) {
    const mitigations = new Set();
    if (signals.length === 0) {
        return ['Continue practicing good privacy hygiene to maintain low exposure.'];
    }
    // Add general recommendations
    mitigations.add('Consider using multiple wallets to compartmentalize different activities.');
    // Check for specific signal types and add relevant mitigations
    const signalIds = new Set(signals.map(s => s.id));
    if (signalIds.has('known-entity-interaction')) {
        mitigations.add('Avoid direct interactions between privacy-sensitive wallets and KYC services.');
    }
    if (signalIds.has('counterparty-reuse')) {
        mitigations.add('Use different addresses for different counterparties or contexts.');
    }
    if (signalIds.has('timing-correlation') || signalIds.has('balance-traceability')) {
        mitigations.add('Introduce timing delays and vary transaction patterns to reduce correlation.');
    }
    if (signalIds.has('amount-reuse')) {
        mitigations.add('Vary transaction amounts to avoid creating fingerprints.');
    }
    // Always add this general advice
    mitigations.add('Research and consider privacy-preserving protocols when available.');
    return Array.from(mitigations);
}
/**
 * Evaluate all heuristics against a scan context
 */
export function evaluateHeuristics(context) {
    const signals = [];
    for (const heuristic of HEURISTICS) {
        try {
            const signal = heuristic(context);
            if (signal) {
                signals.push(signal);
            }
        }
        catch (error) {
            // Log but don't fail if a heuristic errors
            console.warn(`Heuristic evaluation failed:`, error);
        }
    }
    // Sort signals by severity (HIGH -> MEDIUM -> LOW) for deterministic ordering
    signals.sort((a, b) => {
        const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
    });
    return signals;
}
/**
 * Generate a complete privacy report from a scan context
 */
export function generateReport(context) {
    // Evaluate all heuristics
    const signals = evaluateHeuristics(context);
    // Calculate overall risk
    const overallRisk = calculateOverallRisk(signals);
    // Count signals by severity
    const highRiskSignals = signals.filter(s => s.severity === 'HIGH').length;
    const mediumRiskSignals = signals.filter(s => s.severity === 'MEDIUM').length;
    const lowRiskSignals = signals.filter(s => s.severity === 'LOW').length;
    // Generate mitigations
    const mitigations = generateMitigations(signals);
    // Extract known entities from context
    const knownEntities = Array.from(context.labels.values());
    return {
        version: REPORT_VERSION,
        timestamp: Date.now(),
        targetType: context.targetType,
        target: context.target,
        overallRisk,
        signals,
        summary: {
            totalSignals: signals.length,
            highRiskSignals,
            mediumRiskSignals,
            lowRiskSignals,
            transactionsAnalyzed: context.transactionCount,
        },
        mitigations,
        knownEntities,
    };
}
//# sourceMappingURL=index.js.map