import { describe, it, expect } from 'vitest';
import type { ScanContext } from '../types/index.js';
import {
  detectCounterpartyReuse,
  detectTimingPatterns,
  detectKnownEntityInteraction,
  detectPriorityFeeFingerprinting,
  detectATALinkage,
  detectStakingDelegationPatterns,
  detectIdentityMetadataExposure,
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

  describe('detectPriorityFeeFingerprinting', () => {
    it('should detect consistent priority fee usage', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [],
        instructions: [],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 6000 },
        transactionCount: 6,
        transactions: [
          { signature: 'sig1', blockTime: 1000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 5000, computeUnitsUsed: 50000 },
          { signature: 'sig2', blockTime: 2000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 5000, computeUnitsUsed: 50000 },
          { signature: 'sig3', blockTime: 3000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 5000, computeUnitsUsed: 50000 },
          { signature: 'sig4', blockTime: 4000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 5000, computeUnitsUsed: 50000 },
          { signature: 'sig5', blockTime: 5000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 5000, computeUnitsUsed: 50000 },
          { signature: 'sig6', blockTime: 6000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 5000, computeUnitsUsed: 50000 },
        ],
        tokenAccountEvents: [],
        pdaInteractions: [],
        feePayers: new Set(['wallet1']),
        signers: new Set(['wallet1']),
        programs: new Set(),
      };

      const signals = detectPriorityFeeFingerprinting(context);
      expect(signals).toBeInstanceOf(Array);
      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0].id).toBe('priority-fee-consistent');
      expect(signals[0].severity).toBe('MEDIUM');
      console.log('✓ Detected consistent priority fee pattern');
    });

    it('should return empty array when fees vary widely', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [],
        instructions: [],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 6000 },
        transactionCount: 6,
        transactions: [
          { signature: 'sig1', blockTime: 1000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 1000 },
          { signature: 'sig2', blockTime: 2000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 2000 },
          { signature: 'sig3', blockTime: 3000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 3000 },
          { signature: 'sig4', blockTime: 4000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 4000 },
          { signature: 'sig5', blockTime: 5000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 5000 },
          { signature: 'sig6', blockTime: 6000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 6000 },
        ],
        tokenAccountEvents: [],
        pdaInteractions: [],
        feePayers: new Set(['wallet1']),
        signers: new Set(['wallet1']),
        programs: new Set(),
      };

      const signals = detectPriorityFeeFingerprinting(context);
      expect(signals.length).toBe(0);
      console.log('✓ No priority fee pattern detected (varied fees)');
    });

    it('should return empty array with too few transactions', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [],
        instructions: [],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 2000 },
        transactionCount: 2,
        transactions: [
          { signature: 'sig1', blockTime: 1000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 5000 },
          { signature: 'sig2', blockTime: 2000, feePayer: 'wallet1', signers: ['wallet1'], priorityFee: 5000 },
        ],
        tokenAccountEvents: [],
        pdaInteractions: [],
        feePayers: new Set(['wallet1']),
        signers: new Set(['wallet1']),
        programs: new Set(),
      };

      const signals = detectPriorityFeeFingerprinting(context);
      expect(signals.length).toBe(0);
      console.log('✓ No pattern detected (too few transactions)');
    });
  });

  describe('detectATALinkage', () => {
    it('should detect one wallet creating ATAs for multiple owners', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [],
        instructions: [],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 3000 },
        transactionCount: 3,
        transactions: [
          { signature: 'sig1', blockTime: 1000, feePayer: 'funder', signers: ['funder'] },
          { signature: 'sig2', blockTime: 2000, feePayer: 'funder', signers: ['funder'] },
          { signature: 'sig3', blockTime: 3000, feePayer: 'funder', signers: ['funder'] },
        ],
        tokenAccountEvents: [
          { type: 'create', tokenAccount: 'ata1', owner: 'ownerA', signature: 'sig1', blockTime: 1000 },
          { type: 'create', tokenAccount: 'ata2', owner: 'ownerB', signature: 'sig2', blockTime: 2000 },
          { type: 'create', tokenAccount: 'ata3', owner: 'ownerC', signature: 'sig3', blockTime: 3000 },
        ],
        pdaInteractions: [],
        feePayers: new Set(['funder']),
        signers: new Set(['funder']),
        programs: new Set(),
      };

      const signals = detectATALinkage(context);
      expect(signals).toBeInstanceOf(Array);
      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0].id).toBe('ata-creator-linkage');
      expect(signals[0].severity).toBe('HIGH');
      console.log('✓ Detected ATA creator linking multiple wallets');
    });

    it('should ignore self-creation of token accounts', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [],
        instructions: [],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 3000 },
        transactionCount: 3,
        transactions: [
          { signature: 'sig1', blockTime: 1000, feePayer: 'wallet1', signers: ['wallet1'] },
          { signature: 'sig2', blockTime: 2000, feePayer: 'wallet1', signers: ['wallet1'] },
          { signature: 'sig3', blockTime: 3000, feePayer: 'wallet1', signers: ['wallet1'] },
        ],
        tokenAccountEvents: [
          { type: 'create', tokenAccount: 'ata1', owner: 'wallet1', signature: 'sig1', blockTime: 1000 },
          { type: 'create', tokenAccount: 'ata2', owner: 'wallet1', signature: 'sig2', blockTime: 2000 },
          { type: 'create', tokenAccount: 'ata3', owner: 'wallet1', signature: 'sig3', blockTime: 3000 },
        ],
        pdaInteractions: [],
        feePayers: new Set(['wallet1']),
        signers: new Set(['wallet1']),
        programs: new Set(),
      };

      const signals = detectATALinkage(context);
      const linkageSignal = signals.find(s => s.id === 'ata-creator-linkage');
      expect(linkageSignal).toBeUndefined();
      console.log('✓ Self-creation ignored (no false positive)');
    });

    it('should detect batch token account creation', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [],
        instructions: [],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 1300 },
        transactionCount: 4,
        transactions: [
          { signature: 'sig1', blockTime: 1000, feePayer: 'wallet1', signers: ['wallet1'] },
          { signature: 'sig2', blockTime: 1100, feePayer: 'wallet1', signers: ['wallet1'] },
          { signature: 'sig3', blockTime: 1200, feePayer: 'wallet1', signers: ['wallet1'] },
          { signature: 'sig4', blockTime: 1300, feePayer: 'wallet1', signers: ['wallet1'] },
        ],
        tokenAccountEvents: [
          { type: 'create', tokenAccount: 'ata1', owner: 'wallet1', signature: 'sig1', blockTime: 1000 },
          { type: 'create', tokenAccount: 'ata2', owner: 'wallet1', signature: 'sig2', blockTime: 1100 },
          { type: 'create', tokenAccount: 'ata3', owner: 'wallet1', signature: 'sig3', blockTime: 1200 },
          { type: 'create', tokenAccount: 'ata4', owner: 'wallet1', signature: 'sig4', blockTime: 1300 },
        ],
        pdaInteractions: [],
        feePayers: new Set(['wallet1']),
        signers: new Set(['wallet1']),
        programs: new Set(),
      };

      const signals = detectATALinkage(context);
      const batchSignal = signals.find(s => s.id === 'ata-funding-pattern');
      expect(batchSignal).toBeDefined();
      expect(batchSignal?.severity).toBe('MEDIUM');
      console.log('✓ Detected batch token account creation');
    });
  });

  describe('detectStakingDelegationPatterns', () => {
    it('should detect concentrated delegation to one validator', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [],
        instructions: [
          { programId: 'Stake11111111111111111111111111111111111111', category: 'stake', signature: 'sig1', blockTime: 1000, accounts: ['stakeAccount1', 'validator1'] },
          { programId: 'Stake11111111111111111111111111111111111111', category: 'stake', signature: 'sig2', blockTime: 2000, accounts: ['stakeAccount2', 'validator1'] },
          { programId: 'Stake11111111111111111111111111111111111111', category: 'stake', signature: 'sig3', blockTime: 3000, accounts: ['stakeAccount3', 'validator1'] },
        ],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 3000 },
        transactionCount: 3,
        transactions: [],
        tokenAccountEvents: [],
        pdaInteractions: [],
        feePayers: new Set(['wallet1']),
        signers: new Set(['wallet1']),
        programs: new Set(['Stake11111111111111111111111111111111111111']),
      };

      const signals = detectStakingDelegationPatterns(context);
      expect(signals).toBeInstanceOf(Array);
      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0].id).toBe('stake-delegation-pattern');
      expect(signals[0].severity).toBe('MEDIUM');
      console.log('✓ Detected concentrated staking delegation');
    });

    it('should return empty array with no stake instructions', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [],
        instructions: [
          { programId: '11111111111111111111111111111111', category: 'transfer', signature: 'sig1', blockTime: 1000 },
        ],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 1000 },
        transactionCount: 1,
        transactions: [],
        tokenAccountEvents: [],
        pdaInteractions: [],
        feePayers: new Set(['wallet1']),
        signers: new Set(['wallet1']),
        programs: new Set(),
      };

      const signals = detectStakingDelegationPatterns(context);
      expect(signals.length).toBe(0);
      console.log('✓ No staking pattern detected (no stake instructions)');
    });
  });

  describe('detectIdentityMetadataExposure', () => {
    it('should detect Metaplex NFT interactions', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [],
        instructions: [
          { programId: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', category: 'program_interaction', signature: 'sig1', blockTime: 1000 },
          { programId: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', category: 'program_interaction', signature: 'sig2', blockTime: 2000 },
        ],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 2000 },
        transactionCount: 2,
        transactions: [],
        tokenAccountEvents: [],
        pdaInteractions: [],
        feePayers: new Set(['wallet1']),
        signers: new Set(['wallet1']),
        programs: new Set(['metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s']),
      };

      const signals = detectIdentityMetadataExposure(context);
      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0].id).toBe('nft-metadata-exposure');
      expect(signals[0].severity).toBe('MEDIUM');
      console.log('✓ Detected NFT metadata exposure');
    });

    it('should detect Bonfida .sol domain interactions', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [],
        instructions: [
          { programId: 'namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX', category: 'program_interaction', signature: 'sig1', blockTime: 1000 },
        ],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 1000 },
        transactionCount: 1,
        transactions: [],
        tokenAccountEvents: [],
        pdaInteractions: [],
        feePayers: new Set(['wallet1']),
        signers: new Set(['wallet1']),
        programs: new Set(['namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX']),
      };

      const signals = detectIdentityMetadataExposure(context);
      expect(signals.length).toBeGreaterThan(0);
      expect(signals[0].id).toBe('domain-name-linkage');
      expect(signals[0].severity).toBe('HIGH');
      console.log('✓ Detected .sol domain name linkage');
    });

    it('should return empty array with no relevant programs', () => {
      const context: ScanContext = {
        target: 'wallet1',
        targetType: 'wallet',
        transfers: [],
        instructions: [
          { programId: '11111111111111111111111111111111', category: 'transfer', signature: 'sig1', blockTime: 1000 },
        ],
        counterparties: new Set(),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 1000 },
        transactionCount: 1,
        transactions: [],
        tokenAccountEvents: [],
        pdaInteractions: [],
        feePayers: new Set(['wallet1']),
        signers: new Set(['wallet1']),
        programs: new Set(),
      };

      const signals = detectIdentityMetadataExposure(context);
      expect(signals.length).toBe(0);
      console.log('✓ No identity metadata exposure (no relevant programs)');
    });
  });

});
