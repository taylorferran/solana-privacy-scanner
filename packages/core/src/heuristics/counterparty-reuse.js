/**
 * Detect if a wallet frequently interacts with the same counterparties
 * This can enable clustering and linking of addresses
 */
export function detectCounterpartyReuse(context) {
    // Only applicable to wallet scans
    if (context.targetType !== 'wallet') {
        return null;
    }
    if (context.counterparties.size === 0 || context.transfers.length === 0) {
        return null;
    }
    // Count interactions per counterparty
    const interactionCounts = new Map();
    for (const transfer of context.transfers) {
        const counterparty = transfer.from === context.target ? transfer.to : transfer.from;
        if (counterparty === context.target)
            continue;
        interactionCounts.set(counterparty, (interactionCounts.get(counterparty) || 0) + 1);
    }
    // Find counterparties with multiple interactions
    const reusedCounterparties = Array.from(interactionCounts.entries())
        .filter(([_, count]) => count >= 3)
        .sort((a, b) => b[1] - a[1]);
    if (reusedCounterparties.length === 0) {
        return null;
    }
    // Calculate severity based on concentration
    const totalInteractions = context.transfers.length;
    const topCounterpartyInteractions = reusedCounterparties[0][1];
    const concentration = topCounterpartyInteractions / totalInteractions;
    let severity = 'LOW';
    if (concentration > 0.5 || reusedCounterparties.length >= 5) {
        severity = 'HIGH';
    }
    else if (concentration > 0.3 || reusedCounterparties.length >= 3) {
        severity = 'MEDIUM';
    }
    const evidence = reusedCounterparties.slice(0, 5).map(([addr, count]) => ({
        type: 'address',
        description: `${count} interactions with ${addr.slice(0, 8)}...${addr.slice(-8)}`,
        data: { address: addr, interactionCount: count },
    }));
    return {
        id: 'counterparty-reuse',
        name: 'Counterparty Reuse',
        severity,
        reason: `Wallet repeatedly interacts with ${reusedCounterparties.length} address(es)`,
        impact: 'Repeated interactions with the same addresses can be used to cluster wallets and build transaction graphs, enabling surveillance of your activity patterns.',
        evidence,
        mitigation: 'Use different wallets for different counterparties, or use privacy-preserving protocols that obscure transaction graphs.',
        confidence: 0.9,
    };
}
//# sourceMappingURL=counterparty-reuse.js.map