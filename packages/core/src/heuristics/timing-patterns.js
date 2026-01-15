/**
 * Detect transaction bursts and timing patterns
 * Concentrated activity creates temporal fingerprints
 */
export function detectTimingPatterns(context) {
    if (!context.timeRange.earliest || !context.timeRange.latest) {
        return null;
    }
    if (context.transactionCount < 3) {
        return null;
    }
    // Calculate time span in hours
    const timeSpanSeconds = context.timeRange.latest - context.timeRange.earliest;
    const timeSpanHours = timeSpanSeconds / 3600;
    if (timeSpanHours === 0) {
        return null;
    }
    // Calculate transaction rate (txs per hour)
    const txRate = context.transactionCount / timeSpanHours;
    // Detect burst activity (high tx rate in short time)
    let severity = 'LOW';
    let isBurst = false;
    if (txRate > 10) {
        severity = 'HIGH';
        isBurst = true;
    }
    else if (txRate > 5) {
        severity = 'MEDIUM';
        isBurst = true;
    }
    else if (timeSpanHours < 1 && context.transactionCount >= 3) {
        severity = 'MEDIUM';
        isBurst = true;
    }
    if (!isBurst) {
        return null;
    }
    const evidence = [
        {
            type: 'timing',
            description: `${context.transactionCount} transactions in ${timeSpanHours.toFixed(1)} hours`,
            data: {
                transactionCount: context.transactionCount,
                timeSpanHours: timeSpanHours.toFixed(2),
                transactionRate: txRate.toFixed(2),
            },
        },
    ];
    return {
        id: 'timing-correlation',
        name: 'Transaction Burst Pattern',
        severity,
        reason: `Concentrated activity: ${context.transactionCount} transactions in ${timeSpanHours.toFixed(1)} hours`,
        impact: 'Concentrated transaction activity creates timing fingerprints that can be used to correlate your transactions and link them to specific events or behaviors.',
        evidence,
        mitigation: 'Spread transactions over longer time periods, use scheduled transactions, or batch operations to reduce timing correlation.',
        confidence: 0.8,
    };
}
//# sourceMappingURL=timing-patterns.js.map