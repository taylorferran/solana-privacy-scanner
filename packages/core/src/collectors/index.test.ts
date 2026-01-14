import { describe, it, expect, beforeAll } from 'vitest';
import { config } from 'dotenv';
import { RPCClient } from '../rpc/client.js';
import {
  collectWalletData,
  collectTransactionData,
  collectProgramData,
} from './index.js';

// Load .env.local for testing
config({ path: '.env.local' });

describe('Data Collection Layer', () => {
  let client: RPCClient;

  beforeAll(() => {
    const rpcUrl = process.env.SOLANA_RPC;
    
    if (!rpcUrl) {
      throw new Error('SOLANA_RPC environment variable not set in .env.local');
    }

    client = new RPCClient({
      rpcUrl,
      maxConcurrency: 5,
      maxRetries: 2,
      debug: false,
    });
  });

  describe('collectWalletData', () => {
    it('should fetch wallet data for a known active address', async () => {
      // Using test wallet address
      const address = 'zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE';
      
      const data = await collectWalletData(client, address, {
        maxSignatures: 10,
        includeTokenAccounts: true,
      });

      // Verify we got data
      expect(data).toBeDefined();
      expect(data.address).toBe(address);
      
      // Should have signatures
      expect(data.signatures).toBeDefined();
      expect(Array.isArray(data.signatures)).toBe(true);
      console.log(`✓ Fetched ${data.signatures.length} signatures`);
      
      // Should have transactions
      expect(data.transactions).toBeDefined();
      expect(Array.isArray(data.transactions)).toBe(true);
      expect(data.transactions.length).toBeGreaterThan(0);
      console.log(`✓ Fetched ${data.transactions.length} transactions`);
      
      // Each transaction should have required fields
      const firstTx = data.transactions[0];
      expect(firstTx.signature).toBeDefined();
      expect(typeof firstTx.signature).toBe('string');
      expect(firstTx.blockTime).toBeDefined();
      
      // Token accounts should be fetched
      expect(data.tokenAccounts).toBeDefined();
      expect(Array.isArray(data.tokenAccounts)).toBe(true);
      console.log(`✓ Fetched ${data.tokenAccounts.length} token accounts`);
    });

    it('should respect maxSignatures limit', async () => {
      const address = 'zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE';
      
      const data = await collectWalletData(client, address, {
        maxSignatures: 5,
      });

      expect(data.signatures.length).toBeLessThanOrEqual(5);
      expect(data.transactions.length).toBeLessThanOrEqual(5);
      console.log(`✓ Respected limit: ${data.signatures.length} signatures`);
    });

    it('should handle wallet with no token accounts', async () => {
      const address = 'zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE';
      
      const data = await collectWalletData(client, address, {
        maxSignatures: 3,
        includeTokenAccounts: false,
      });

      expect(data.tokenAccounts).toEqual([]);
      console.log(`✓ Skipped token accounts as requested`);
    });
  });

  describe('collectTransactionData', () => {
    it('should fetch full transaction data for a known signature', async () => {
      // First get a real signature from the test wallet
      const address = 'zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE';
      const signatures = await client.getSignaturesForAddress(address, { limit: 1 });
      
      if (signatures.length === 0) {
        console.log('⚠ No signatures found for test wallet');
        return;
      }

      const signature = signatures[0].signature;
      console.log(`  Using signature from wallet: ${signature}`);
      
      const data = await collectTransactionData(client, signature);

      // Verify transaction data
      expect(data).toBeDefined();
      expect(data.signature).toBe(signature);
      expect(data.transaction).toBeDefined();
      expect(data.blockTime).toBeDefined();
      
      console.log(`✓ Fetched transaction: ${signature.slice(0, 8)}...`);
      console.log(`  Block time: ${data.blockTime}`);
      
      if (data.transaction) {
        console.log(`  Slot: ${data.transaction.slot}`);
      }
    });
  });

  describe('collectProgramData', () => {
    it('should fetch program data for a known program', async () => {
      // Using Jupiter Aggregator v6 - smaller program with recent activity
      const programId = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4';
      
      const data = await collectProgramData(client, programId, {
        maxAccounts: 5,
        maxTransactions: 5,
      });

      // Verify program data
      expect(data).toBeDefined();
      expect(data.programId).toBe(programId);
      
      // Should have accounts or transactions
      expect(data.accounts).toBeDefined();
      expect(Array.isArray(data.accounts)).toBe(true);
      
      expect(data.relatedTransactions).toBeDefined();
      expect(Array.isArray(data.relatedTransactions)).toBe(true);
      
      console.log(`✓ Fetched ${data.accounts.length} program accounts`);
      console.log(`✓ Fetched ${data.relatedTransactions.length} related transactions`);
    });

    it('should respect limits on program data collection', async () => {
      const programId = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4';
      
      const data = await collectProgramData(client, programId, {
        maxAccounts: 3,
        maxTransactions: 2,
      });

      expect(data.accounts.length).toBeLessThanOrEqual(3);
      expect(data.relatedTransactions.length).toBeLessThanOrEqual(2);
      
      console.log(`✓ Respected limits: ${data.accounts.length} accounts, ${data.relatedTransactions.length} txs`);
    });
  });

  describe('RPC Client Health', () => {
    it('should have a healthy RPC connection', async () => {
      const isHealthy = await client.healthCheck();
      expect(isHealthy).toBe(true);
      console.log('✓ RPC connection is healthy');
    });

    it('should report stats correctly', () => {
      const stats = client.getStats();
      expect(stats).toHaveProperty('activeRequests');
      expect(stats).toHaveProperty('queueLength');
      expect(typeof stats.activeRequests).toBe('number');
      expect(typeof stats.queueLength).toBe('number');
      console.log(`✓ RPC stats: ${stats.activeRequests} active, ${stats.queueLength} queued`);
    });
  });
});
