import type { ScanContext, PrivacySignal, Evidence } from '../types/index.js';

/**
 * Detect interactions with known entities (CEXs, bridges, etc.)
 * These entities can link on-chain and off-chain identities
 */
export function detectKnownEntityInteraction(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];

  if (context.labels.size === 0) {
    return signals;
  }

  // Group interactions by entity type
  const entityTypeGroups = new Map<string, Array<{ address: string; label: any; count: number; txs: string[] }>>();

  for (const [address, label] of context.labels.entries()) {
    // Count interactions with this entity
    let interactionCount = 0;
    const relatedTxs: string[] = [];

    for (const transfer of context.transfers) {
      if (transfer.from === address || transfer.to === address) {
        interactionCount++;
        if (relatedTxs.length < 3) {
          relatedTxs.push(transfer.signature);
        }
      }
    }

    if (interactionCount > 0) {
      if (!entityTypeGroups.has(label.type)) {
        entityTypeGroups.set(label.type, []);
      }
      entityTypeGroups.get(label.type)!.push({
        address,
        label,
        count: interactionCount,
        txs: relatedTxs
      });
    }
  }

  if (entityTypeGroups.size === 0) {
    return signals;
  }

  // Case 1: Exchange interactions (highest risk)
  const exchanges = entityTypeGroups.get('exchange');
  if (exchanges && exchanges.length > 0) {
    const evidence: Evidence[] = exchanges.map(entity => ({
      description: `${entity.count} interaction(s) with ${entity.label.name}`,
      severity: 'HIGH',
      reference: entity.address,
    }));

    const totalExchangeTxs = exchanges.reduce((sum, e) => sum + e.count, 0);

    signals.push({
      id: 'known-entity-exchange',
      name: 'Centralized Exchange Interaction',
      severity: 'HIGH',
      confidence: 0.95,
      category: 'identity-linkage',
      reason: `Wallet interacted with ${exchanges.length} centralized exchange(s) in ${totalExchangeTxs} transaction(s).`,
      impact: 'Centralized exchanges have KYC data. Direct interactions can link your on-chain address to your real-world identity through account records, IP addresses, and withdrawal/deposit patterns.',
      mitigation: 'Use intermediate wallets to break the direct link. Deposit to privacy protocols before going to CEX. Consider DEXs for better privacy.',
      evidence,
    });
  }

  // Case 2: Bridge interactions
  const bridges = entityTypeGroups.get('bridge');
  if (bridges && bridges.length > 0) {
    const evidence: Evidence[] = bridges.map(entity => ({
      description: `${entity.count} interaction(s) with ${entity.label.name}`,
      severity: 'MEDIUM',
      reference: entity.address,
    }));

    signals.push({
      id: 'known-entity-bridge',
      name: 'Bridge Protocol Interaction',
      severity: 'MEDIUM',
      confidence: 0.85,
      category: 'identity-linkage',
      reason: `Wallet interacted with ${bridges.length} bridge protocol(s).`,
      impact: 'Bridge transactions can link your Solana address to addresses on other chains, expanding the tracking surface.',
      mitigation: 'Use privacy-preserving bridges when available. Create separate addresses for cross-chain activity.',
      evidence,
    });
  }

  // Case 3: Other known entities (protocols, institutions, etc.)
  const others = Array.from(entityTypeGroups.entries())
    .filter(([type]) => type !== 'exchange' && type !== 'bridge');

  if (others.length > 0) {
    const allOtherEntities = others.flatMap(([_, entities]) => entities);
    const evidence: Evidence[] = allOtherEntities.slice(0, 5).map(entity => ({
      description: `${entity.count} interaction(s) with ${entity.label.name} (${entity.label.type})`,
      severity: 'LOW',
      reference: entity.address,
    }));

    const totalOtherTxs = allOtherEntities.reduce((sum, e) => sum + e.count, 0);

    signals.push({
      id: 'known-entity-other',
      name: 'Known Entity Interactions',
      severity: 'LOW',
      confidence: 0.75,
      category: 'behavioral',
      reason: `Wallet interacted with ${allOtherEntities.length} known entit${allOtherEntities.length === 1 ? 'y' : 'ies'} (${totalOtherTxs} transactions).`,
      impact: 'Interactions with known entities create reference points in your transaction history. These can be used to correlate activity and build behavioral profiles.',
      mitigation: 'While interacting with known protocols is often necessary, be aware it creates public association with those services.',
      evidence,
    });
  }

  // Case 4: Frequent interaction with specific entity
  for (const [address, label] of context.labels.entries()) {
    let interactionCount = 0;
    for (const transfer of context.transfers) {
      if (transfer.from === address || transfer.to === address) {
        interactionCount++;
      }
    }

    // If >30% of all transfers are with one entity
    const concentration = interactionCount / context.transfers.length;
    if (concentration > 0.3 && interactionCount >= 5) {
      signals.push({
        id: `known-entity-frequent-${address.slice(0, 8)}`,
        name: 'Frequent Single Entity Interaction',
        severity: label.type === 'exchange' ? 'HIGH' : 'MEDIUM',
        confidence: 0.85,
        category: 'behavioral',
        reason: `${Math.round(concentration * 100)}% of transfers (${interactionCount}/${context.transfers.length}) involve ${label.name}.`,
        impact: 'Heavy concentration of activity with one entity creates a strong link and behavioral dependency that is easily identified.',
        mitigation: 'Diversify your interactions across multiple services. Use different addresses for different service providers.',
        evidence: [{
          description: `${interactionCount} transfers with ${label.name} (${label.type})`,
          severity: label.type === 'exchange' ? 'HIGH' : 'MEDIUM',
          reference: address,
        }],
      });
    }
  }

  return signals;
}
