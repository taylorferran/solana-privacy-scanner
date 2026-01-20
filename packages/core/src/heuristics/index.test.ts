import { describe, it, expect } from 'vitest';
import type { ScanContext } from '../types/index.js';
import {
  detectCounterpartyReuse,
  detectAmountReuse,
  detectTimingPatterns,
  detectKnownEntityInteraction,
  detectBalanceTraceability,
} from './index.js';

describe('Privacy Heuristics', () => {
  describe('detectCounterpartyReuse', () => {
    it('should detect repeated interactions with same addresses', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [
          { from: 'wallet1', to: 'wallet2', amount: 1, signature: 'sig1', blockTime: 1000 },
          { from: 'wallet1', to: 'wallet2', amount: 2, signature: 'sig2', blockTime: 2000 },
          { from: 'wallet1', to: 'wallet2', amount: 3, signature: 'sig3', blockTime: 3000 },
          { from: 'wallet1', to: 'wallet3', amount: 1, signature: 'sig4', blockTime: 4000 },
        ],
        instructions: [],
        counterparties: new Set(['wallet2', 'wallet3']),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 4000 },
        transactionCount: 4,
      };

      const signals = detectCounterpartyReuse(context);

      expect(signals).toBeInstanceOf(Array);
      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0].id).toBe('counterparty-reuse'); // Not -direct, just 'counterparty-reuse'
      expect(signals[0].severity).toBeDefined();
      expect(signals[0].evidence.length).toBeGreaterThan(0);
      console.log(`✓ Detected counterparty reuse: ${signals[0].severity} severity`);
    });

    it('should return empty array for wallet with diverse counterparties', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [
          { from: 'wallet1', to: 'wallet2', amount: 1, signature: 'sig1', blockTime: 1000 },
          { from: 'wallet1', to: 'wallet3', amount: 1, signature: 'sig2', blockTime: 2000 },
          { from: 'wallet1', to: 'wallet4', amount: 1, signature: 'sig3', blockTime: 3000 },
        ],
        instructions: [],
        counterparties: new Set(['wallet2', 'wallet3', 'wallet4']),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 3000 },
        transactionCount: 3,
      };

      const signals = detectCounterpartyReuse(context);
      expect(signals).toBeInstanceOf(Array);
      expect(signals.length).toBe(0);
      console.log('✓ No counterparty reuse detected (diverse interactions)');
    });
  });

  describe('detectAmountReuse', () => {
    it('should detect round number patterns', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [
          { from: 'wallet1', to: 'wallet2', amount: 10, signature: 'sig1', blockTime: 1000 },
          { from: 'wallet1', to: 'wallet3', amount: 100, signature: 'sig2', blockTime: 2000 },
          { from: 'wallet1', to: 'wallet4', amount: 1, signature: 'sig3', blockTime: 3000 },
          { from: 'wallet1', to: 'wallet5', amount: 5, signature: 'sig4', blockTime: 4000 },
          { from: 'wallet1', to: 'wallet6', amount: 50, signature: 'sig5', blockTime: 5000 },
          { from: 'wallet1', to: 'wallet7', amount: 25, signature: 'sig6', blockTime: 6000 },
        ],
        instructions: [],
        counterparties: new Set(['wallet2', 'wallet3', 'wallet4', 'wallet5', 'wallet6', 'wallet7']),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 6000 },
        transactionCount: 6,
      };

      const signals = detectAmountReuse(context);

      expect(signals).toBeInstanceOf(Array);
      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0].id).toBe('amount-round-numbers');
      console.log(`✓ Detected amount reuse: ${signals[0].severity} severity`);
    });

    it('should detect repeated exact amounts', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [
          { from: 'wallet1', to: 'wallet2', amount: 1.234, signature: 'sig1', blockTime: 1000 },
          { from: 'wallet1', to: 'wallet3', amount: 1.234, signature: 'sig2', blockTime: 2000 },
          { from: 'wallet1', to: 'wallet4', amount: 1.234, signature: 'sig3', blockTime: 3000 },
          { from: 'wallet1', to: 'wallet5', amount: 5.678, signature: 'sig4', blockTime: 4000 },
          { from: 'wallet1', to: 'wallet6', amount: 5.678, signature: 'sig5', blockTime: 5000 },
          { from: 'wallet1', to: 'wallet7', amount: 5.678, signature: 'sig6', blockTime: 6000 },
        ],
        instructions: [],
        counterparties: new Set(['wallet2', 'wallet3', 'wallet4', 'wallet5', 'wallet6', 'wallet7']),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 6000 },
        transactionCount: 6,
      };

      const signals = detectAmountReuse(context);

      expect(signals).toBeInstanceOf(Array);
      expect(signals.length).toBeGreaterThan(0);
      const exactSignal = signals.find(s => s.id === 'amount-reuse-pattern' || s.id === 'amount-reuse-counterparty' || s.id === 'amount-reuse-frequency');
      expect(exactSignal).toBeDefined();
      console.log(`✓ Detected repeated amounts: ${exactSignal?.evidence.length} patterns`);
    });
  });

  describe('detectTimingPatterns', () => {
    it('should detect transaction bursts', () => {
      const now = Math.floor(Date.now() / 1000);
      
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: Array(6).fill(null).map((_, i) => ({
          from: 'wallet1',
          to: `wallet${i}`,
          amount: 1,
          signature: `sig${i}`,
          blockTime: now + i * 60, // 6 txs in 5 minutes
        })),
        instructions: [],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: now, latest: now + 300 },
        transactionCount: 6,
      };

      const signals = detectTimingPatterns(context);

      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0]?.id).toBe('timing-burst');
      expect(signals[0]?.severity).toBe('HIGH');
      console.log(`✓ Detected burst: ${context.transactionCount} txs in 5 minutes`);
    });

    it('should return null for spread-out transactions', () => {
      const now = Math.floor(Date.now() / 1000);
      const oneDay = 24 * 3600;
      
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [
          { from: 'wallet1', to: 'wallet2', amount: 1, signature: 'sig1', blockTime: now },
          { from: 'wallet1', to: 'wallet3', amount: 1, signature: 'sig2', blockTime: now + oneDay },
          { from: 'wallet1', to: 'wallet4', amount: 1, signature: 'sig3', blockTime: now + oneDay * 2 },
        ],
        instructions: [],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: now, latest: now + oneDay * 2 },
        transactionCount: 3,
      };

      const signals = detectTimingPatterns(context);
      expect(signals.length).toBe(0);
      console.log('✓ No timing pattern detected (spread out over days)');
    });
  });

  describe('detectKnownEntityInteraction', () => {
    it('should detect CEX interactions', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [
          { from: 'wallet1', to: 'binance-hot', amount: 100, signature: 'sig1', blockTime: 1000 },
          { from: 'binance-hot', to: 'wallet1', amount: 90, signature: 'sig2', blockTime: 2000 },
        ],
        instructions: [],
        counterparties: new Set(['binance-hot']),
        labels: new Map([
          ['binance-hot', { address: 'binance-hot', name: 'Binance Hot Wallet', type: 'exchange' }],
        ]),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 2000 },
        transactionCount: 2,
      };

      const signals = detectKnownEntityInteraction(context);

      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0]?.id).toBe('known-entity-exchange');
      expect(signals[0]?.severity).toBe('HIGH');
      console.log(`✓ Detected CEX interaction: ${signals[0]?.evidence[0].description}`);
    });

    it('should return null with no labeled entities', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [
          { from: 'wallet1', to: 'wallet2', amount: 1, signature: 'sig1', blockTime: 1000 },
        ],
        instructions: [],
        counterparties: new Set(['wallet2']),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 1000 },
        transactionCount: 1,
      };

      const signals = detectKnownEntityInteraction(context);
      expect(signals.length).toBe(0);
      console.log('✓ No known entity interactions');
    });
  });

  describe('detectBalanceTraceability', () => {
    it('should detect matching send/receive pairs', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [
          { from: 'wallet1', to: 'wallet2', amount: 5.5, signature: 'sig1', blockTime: 1000 },
          { from: 'wallet2', to: 'wallet3', amount: 5.5, signature: 'sig2', blockTime: 2000 },
          { from: 'wallet1', to: 'wallet4', amount: 3.3, signature: 'sig3', blockTime: 3000 },
          { from: 'wallet5', to: 'wallet1', amount: 3.3, signature: 'sig4', blockTime: 4000 },
        ],
        instructions: [],
        counterparties: new Set(['wallet2', 'wallet3', 'wallet4', 'wallet5']),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 4000 },
        transactionCount: 4,
      };

      const signals = detectBalanceTraceability(context);

      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0]?.id).toBe('balance-matching-pairs');
      console.log(`✓ Detected balance traceability: ${signals.length} patterns`);
    });
  });
});
