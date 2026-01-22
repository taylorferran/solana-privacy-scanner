/**
 * Privacy tests using solana-privacy-devtools
 * These tests verify that our implementation maintains privacy standards
 */

import { describe, it, expect } from 'vitest';
import { Connection, Keypair } from '@solana/web3.js';
import { simulateTransactionPrivacy } from 'solana-privacy-devtools/simulator';
import { buildTransferTransaction } from '../src/transfer.js';
import { generateFeePayer, generateSafeReference, isMemoSafe } from '../src/utils.js';

const connection = new Connection('https://api.devnet.solana.com');

describe('Privacy Tests', () => {
  describe('Fee Payer Generation', () => {
    it('should generate unique fee payers', () => {
      const feePayer1 = generateFeePayer();
      const feePayer2 = generateFeePayer();
      const feePayer3 = generateFeePayer();

      const addresses = new Set([
        feePayer1.publicKey.toBase58(),
        feePayer2.publicKey.toBase58(),
        feePayer3.publicKey.toBase58(),
      ]);

      // All three should be unique
      expect(addresses.size).toBe(3);
    });

    it('should create valid keypairs', () => {
      const feePayer = generateFeePayer();
      expect(feePayer.publicKey).toBeDefined();
      expect(feePayer.secretKey).toBeDefined();
    });
  });

  describe('Safe Memo Generation', () => {
    it('should generate opaque references', () => {
      const ref1 = generateSafeReference();
      const ref2 = generateSafeReference();

      // Should start with "ref:"
      expect(ref1).toMatch(/^ref:[a-f0-9-]{36}$/);
      expect(ref2).toMatch(/^ref:[a-f0-9-]{36}$/);

      // Should be unique
      expect(ref1).not.toBe(ref2);
    });

    it('should detect email addresses in memos', () => {
      expect(isMemoSafe('Payment to user@example.com')).toBe(false);
      expect(isMemoSafe('Contact: alice@domain.org')).toBe(false);
    });

    it('should detect phone numbers in memos', () => {
      expect(isMemoSafe('Call me at +1-555-123-4567')).toBe(false);
      expect(isMemoSafe('Phone: (555) 123-4567')).toBe(false);
    });

    it('should detect names in memos', () => {
      expect(isMemoSafe('Payment to John Smith')).toBe(false);
      expect(isMemoSafe('From Alice Johnson')).toBe(false);
    });

    it('should allow safe generic memos', () => {
      expect(isMemoSafe('Payment')).toBe(true);
      expect(isMemoSafe('Transfer')).toBe(true);
      expect(isMemoSafe('ref:abc123')).toBe(true);
    });
  });

  describe('Transaction Privacy', () => {
    it('should build transaction with LOW privacy risk', async () => {
      const from = Keypair.generate();
      const to = Keypair.generate().publicKey;

      const tx = buildTransferTransaction({
        from,
        to,
        amount: 0.1,
        memo: 'Payment', // Safe generic memo
      });

      const report = await simulateTransactionPrivacy(tx, connection);

      expect(report).toHavePrivacyRisk('LOW');
      expect(report).toHaveNoHighRiskSignals();
    });

    it('should not leak user relationships', async () => {
      const from = Keypair.generate();
      const to = Keypair.generate().publicKey;

      const tx = buildTransferTransaction({
        from,
        to,
        amount: 0.5,
      });

      const report = await simulateTransactionPrivacy(tx, connection);

      expect(report).toNotLeakUserRelationships();
    });

    it('should not have fee payer reuse signal', async () => {
      const from = Keypair.generate();
      const to = Keypair.generate().publicKey;

      const tx = buildTransferTransaction({
        from,
        to,
        amount: 1.0,
      });

      const report = await simulateTransactionPrivacy(tx, connection);

      expect(report).toNotHaveSignal('fee-payer-reuse');
    });

    it('should maintain privacy score above threshold', async () => {
      const from = Keypair.generate();
      const to = Keypair.generate().publicKey;

      const tx = buildTransferTransaction({
        from,
        to,
        amount: 0.25,
        memo: generateSafeReference(),
      });

      const report = await simulateTransactionPrivacy(tx, connection);

      expect(report).toHavePrivacyScore(70);
    });
  });

  describe('Batch Transfers', () => {
    it('should use unique fee payers for multiple transfers', () => {
      const feePayers = [
        generateFeePayer(),
        generateFeePayer(),
        generateFeePayer(),
      ];

      const uniqueAddresses = new Set(
        feePayers.map(fp => fp.publicKey.toBase58())
      );

      expect(uniqueAddresses.size).toBe(3);
    });
  });
});
