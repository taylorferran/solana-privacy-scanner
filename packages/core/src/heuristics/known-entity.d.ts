import type { ScanContext, RiskSignal } from '../types/index.js';
/**
 * Detect interactions with known entities (CEXs, bridges, etc.)
 * These entities can link on-chain and off-chain identities
 */
export declare function detectKnownEntityInteraction(context: ScanContext): RiskSignal | null;
//# sourceMappingURL=known-entity.d.ts.map