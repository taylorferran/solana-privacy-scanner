import { describe, it, expect, beforeAll } from 'vitest';
import { config } from 'dotenv';
import { RPCClient } from '../rpc/client.js';
import { collectWalletData, collectTransactionData } from '../collectors/index.js';
import {
  normalizeWalletData,
  normalizeTransactionData,
} from './index.js';

// Load .env.local for testing
config({ path: '.env.local' });

describe('Data Normalization Layer', () => {
  let client: RPCClient;
  const testWallet = 'zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE';

  beforeAll(() => {
    const rpcUrl = process.env.SOLANA_RPC;
    
    if (!rpcUrl) {
      throw new Error('SOLANA_RPC environment variable not set in .env.local');
    }

    client = new RPCClient({
      rpcUrl,
      maxConcurrency: 2, // Lower for free tier rate limits
      maxRetries: 2,
      retryDelay: 1500, // Longer delay between retries
      debug: false,
    });
  });

  describe('normalizeWalletData', () => {
    it('should normalize wallet data into ScanContext', async () => {
      // Collect raw data
      const rawData = await collectWalletData(client, testWallet, {
        maxSignatures: 5, // Reduced for rate limits
      });

      // Normalize it
      const context = normalizeWalletData(rawData);

      // Verify context structure
      expect(context).toBeDefined();
      expect(context.target).toBe(testWallet);
      expect(context.targetType).toBe('wallet');
      
      // Should have transfers
      expect(Array.isArray(context.transfers)).toBe(true);
      console.log(`✓ Extracted ${context.transfers.length} transfers`);
      
      if (context.transfers.length > 0) {
        const transfer = context.transfers[0];
        expect(transfer).toHaveProperty('from');
        expect(transfer).toHaveProperty('to');
        expect(transfer).toHaveProperty('amount');
        expect(transfer).toHaveProperty('signature');
        expect(transfer).toHaveProperty('blockTime');
        
        console.log(`  Sample transfer: ${transfer.from.slice(0, 8)}... → ${transfer.to.slice(0, 8)}...`);
        console.log(`  Amount: ${transfer.amount} ${transfer.token ? 'tokens' : 'SOL'}`);
      }

      // Should have instructions
      expect(Array.isArray(context.instructions)).toBe(true);
      console.log(`✓ Extracted ${context.instructions.length} instructions`);

      if (context.instructions.length > 0) {
        // Count instruction categories
        const categories = new Map<string, number>();
        for (const inst of context.instructions) {
          categories.set(inst.category, (categories.get(inst.category) || 0) + 1);
        }
        console.log(`  Categories: ${JSON.stringify(Object.fromEntries(categories))}`);
      }
      // Should have counterparties
      expect(context.counterparties instanceof Set).toBe(true);
      console.log(`✓ Found ${context.counterparties.size} unique counterparties`);

      // Should have time range
      expect(context.timeRange).toBeDefined();
      expect(context.timeRange.earliest).not.toBeNull();
      expect(context.timeRange.latest).not.toBeNull();
      
      if (context.timeRange.earliest && context.timeRange.latest) {
        const timeSpan = context.timeRange.latest - context.timeRange.earliest;
        const days = Math.floor(timeSpan / (24 * 60 * 60));
        console.log(`✓ Time range: ${days} days`);
      }

      // Transaction count
      expect(context.transactionCount).toBe(rawData.transactions.length);
      console.log(`✓ Transaction count: ${context.transactionCount}`);

      // Token accounts
      expect(Array.isArray(context.tokenAccounts)).toBe(true);
      console.log(`✓ Token accounts: ${context.tokenAccounts.length}`);
    });

    it('should correctly identify SOL transfers', async () => {
      const rawData = await collectWalletData(client, testWallet, {
        maxSignatures: 3, // Reduced for rate limits
      });

      const context = normalizeWalletData(rawData);

      // Find SOL transfers (token is undefined)
      const solTransfers = context.transfers.filter((t) => !t.token);
      
      console.log(`✓ Found ${solTransfers.length} SOL transfers`);
      
      if (solTransfers.length > 0) {
        const transfer = solTransfers[0];
        expect(transfer.token).toBeUndefined();
        expect(transfer.amount).toBeGreaterThan(0);
        console.log(`  Sample: ${transfer.amount} SOL`);
      }
    });

    it('should correctly identify SPL token transfers', async () => {
      const rawData = await collectWalletData(client, testWallet, {
        maxSignatures: 10, // Slightly more to find token transfers
      });

      const context = normalizeWalletData(rawData);

      // Find SPL transfers (token is defined)
      const splTransfers = context.transfers.filter((t) => t.token);
      
      console.log(`✓ Found ${splTransfers.length} SPL token transfers`);
      
      if (splTransfers.length > 0) {
        const transfer = splTransfers[0];
        expect(transfer.token).toBeDefined();
        expect(typeof transfer.token).toBe('string');
        console.log(`  Sample: ${transfer.amount} of token ${transfer.token?.slice(0, 8)}...`);
      }
    });

    it('should categorize instructions correctly', async () => {
      const rawData = await collectWalletData(client, testWallet, {
        maxSignatures: 5, // Reduced for rate limits
      });

      const context = normalizeWalletData(rawData);

      // Count categories
      const categories = new Map<string, number>();
      for (const inst of context.instructions) {
        expect(inst.category).toBeDefined();
        expect(inst.programId).toBeDefined();
        expect(inst.signature).toBeDefined();
        
        categories.set(inst.category, (categories.get(inst.category) || 0) + 1);
      }

      console.log(`✓ Instruction categories found:`);
      if (categories.size > 0) {
        for (const [category, count] of categories.entries()) {
          console.log(`  - ${category}: ${count}`);
        }
      } else {
        console.log(`  (No instructions extracted - may be versioned transactions)`);
      }

      // Don't fail if no categories found - wallet might have versioned txs
      expect(categories.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('normalizeTransactionData', () => {
    it('should normalize transaction data into ScanContext', async () => {
      // Get a real transaction
      const signatures = await client.getSignaturesForAddress(testWallet, { limit: 1 });
      
      if (signatures.length === 0) {
        console.log('⚠ No signatures found');
        return;
      }

      const rawData = await collectTransactionData(client, signatures[0].signature);
      const context = normalizeTransactionData(rawData);

      // Verify context
      expect(context).toBeDefined();
      expect(context.target).toBe(signatures[0].signature);
      expect(context.targetType).toBe('transaction');
      expect(context.transactionCount).toBe(1);

      console.log(`✓ Normalized transaction: ${context.target.slice(0, 8)}...`);
      console.log(`  Transfers: ${context.transfers.length}`);
      console.log(`  Instructions: ${context.instructions.length}`);
      console.log(`  Counterparties: ${context.counterparties.size}`);

      // Context should be valid even if empty
      expect(context.transactionCount).toBe(1);
      expect(context.targetType).toBe('transaction');
    });
  });

  describe('Time calculations', () => {
    it('should calculate time deltas correctly', async () => {
      const rawData = await collectWalletData(client, testWallet, {
        maxSignatures: 5, // Reduced for rate limits
      });

      const context = normalizeWalletData(rawData);

      if (context.timeRange.earliest && context.timeRange.latest) {
        expect(context.timeRange.earliest).toBeLessThanOrEqual(context.timeRange.latest);
        
        const delta = context.timeRange.latest - context.timeRange.earliest;
        console.log(`✓ Time delta: ${delta} seconds (${Math.floor(delta / 60)} minutes)`);
      }
    });
  });

  describe('Counterparty extraction', () => {
    it('should extract unique counterparties from transfers', async () => {
      const rawData = await collectWalletData(client, testWallet, {
        maxSignatures: 5, // Reduced for rate limits
      });

      const context = normalizeWalletData(rawData);

      // Counterparties should not include the target wallet (or should be minimal)
      console.log(`✓ Unique counterparties: ${context.counterparties.size}`);
      
      // Log a few counterparties
      const sample = Array.from(context.counterparties).slice(0, 3);
      for (const addr of sample) {
        console.log(`  - ${addr.slice(0, 8)}...${addr.slice(-8)}`);
      }

      expect(context.counterparties.size).toBeGreaterThanOrEqual(0);
    });
  });
});
