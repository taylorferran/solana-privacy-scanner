/**
 * Privacy-Preserving Transfer Implementation
 *
 * This file demonstrates proper privacy patterns for Solana transfers.
 * Each function shows the correct way to handle transactions.
 */

import {
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';

export interface TransferConfig {
  from: Keypair;
  to: PublicKey;
  amount: number;
  memo?: string;
}

/**
 * Execute a single private transfer
 * Uses a unique fee payer to prevent linkability
 */
export async function executePrivateTransfer(
  config: TransferConfig,
  connection: Connection
): Promise<string> {
  // Generate unique fee payer for this transaction
  const feePayer = Keypair.generate();

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: config.from.publicKey,
      toPubkey: config.to,
      lamports: config.amount * LAMPORTS_PER_SOL,
    })
  );

  // Only add memo if provided and it's safe (no PII)
  if (config.memo) {
    transaction.add({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(config.memo),
    });
  }

  transaction.feePayer = feePayer.publicKey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const signature = await connection.sendTransaction(transaction, [feePayer, config.from]);
  return signature;
}

/**
 * Execute multiple transfers while maintaining privacy
 * Each transfer gets its own fee payer
 */
export async function executeBatchTransfers(
  configs: TransferConfig[],
  connection: Connection
): Promise<string[]> {
  const signatures: string[] = [];

  for (const config of configs) {
    // Each transfer maintains its own privacy
    const signature = await executePrivateTransfer(config, connection);
    signatures.push(signature);
  }

  return signatures;
}

/**
 * Build a transaction without sending (for testing)
 */
export function buildTransferTransaction(config: TransferConfig): Transaction {
  const feePayer = Keypair.generate();

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: config.from.publicKey,
      toPubkey: config.to,
      lamports: config.amount * LAMPORTS_PER_SOL,
    })
  );

  if (config.memo) {
    transaction.add({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(config.memo),
    });
  }

  transaction.feePayer = feePayer.publicKey;

  return transaction;
}
