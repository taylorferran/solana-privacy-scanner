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
      reason: `This wallet sent or received funds directly from ${exchanges.length} centralized exchange(s) across ${totalExchangeTxs} transaction(s). Exchanges know your real identity from KYC verification, so this links your wallet to your name.`,
      impact: 'Anyone can see this wallet transacted with an exchange. Since exchanges keep records of who you are, your wallet address is now tied to your real identity.',
      mitigation: 'Use an intermediate wallet between your main wallet and any exchange. Deposit to a fresh wallet first, then send to the exchange — this avoids a direct link.',
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
      reason: `This wallet used ${bridges.length} bridge protocol(s) to move funds between blockchains. Bridge transactions publicly connect your Solana address to addresses on other chains.`,
      impact: 'Anyone watching this wallet can follow the bridge transaction to find your address on the destination chain, linking your activity across multiple blockchains.',
      mitigation: 'Use a separate wallet for bridging. Send funds to a fresh wallet on the destination chain rather than bridging directly from your main wallet.',
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
      reason: `This wallet interacted with ${allOtherEntities.length} known service(s) across ${totalOtherTxs} transaction(s). These are publicly identifiable addresses, so anyone can see which services you use.`,
      impact: 'Known services act as landmarks in your transaction history. Someone analyzing your wallet can see exactly which protocols and services you use.',
      mitigation: 'Using known services is often unavoidable, but be aware that each interaction publicly ties your wallet to that service.',
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
        reason: `${Math.round(concentration * 100)}% of this wallet's transfers (${interactionCount} out of ${context.transfers.length}) go to or come from ${label.name}. This makes it easy to see what service you use the most.`,
        impact: 'When most of your activity is with one service, anyone looking at your wallet can immediately see your primary use case and habits.',
        mitigation: 'Spread your activity across different services, or use a dedicated wallet for each service you use frequently.',
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
