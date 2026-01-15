/**
 * Detect interactions with known entities (CEXs, bridges, etc.)
 * These entities can link on-chain and off-chain identities
 */
export function detectKnownEntityInteraction(context) {
    if (context.labels.size === 0) {
        return null;
    }
    const entityInteractions = [];
    for (const [address, label] of context.labels.entries()) {
        // Count interactions with this entity
        let interactionCount = 0;
        const relatedTxs = [];
        for (const transfer of context.transfers) {
            if (transfer.from === address || transfer.to === address) {
                interactionCount++;
                if (relatedTxs.length < 3) {
                    relatedTxs.push(transfer.signature);
                }
            }
        }
        if (interactionCount > 0) {
            entityInteractions.push({
                type: 'label',
                description: `${interactionCount} interaction(s) with ${label.name} (${label.type})`,
                data: {
                    entityName: label.name,
                    entityType: label.type,
                    address,
                    interactionCount,
                    transactions: relatedTxs,
                },
                reference: address,
            });
        }
    }
    if (entityInteractions.length === 0) {
        return null;
    }
    // Severity based on entity type and interaction count
    let severity = 'MEDIUM';
    const hasExchangeInteraction = Array.from(context.labels.values())
        .some(label => label.type === 'exchange');
    if (hasExchangeInteraction) {
        severity = 'HIGH';
    }
    else if (entityInteractions.length >= 3) {
        severity = 'HIGH';
    }
    return {
        id: 'known-entity-interaction',
        name: 'Known Entity Interaction',
        severity,
        reason: `Wallet interacted with ${entityInteractions.length} known entit${entityInteractions.length === 1 ? 'y' : 'ies'}`,
        impact: 'Interactions with centralized exchanges, bridges, or other known entities can link your on-chain address to your real-world identity through KYC data, IP addresses, and off-chain records.',
        evidence: entityInteractions,
        mitigation: 'Use privacy-preserving bridges, avoid direct CEX interactions from privacy-sensitive wallets, or use intermediate wallets to break the link.',
        confidence: 0.95,
    };
}
//# sourceMappingURL=known-entity.js.map