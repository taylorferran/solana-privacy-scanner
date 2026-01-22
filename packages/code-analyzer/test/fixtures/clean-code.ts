// Test fixture: Clean code with no privacy issues
// This should detect NO issues

import { Keypair, Connection, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

async function privacySafeTransfer(recipient: PublicKey, amount: number) {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = Keypair.generate();

  // GOOD: Unique fee payer for this transaction
  const feePayer = Keypair.generate();

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: recipient,
      lamports: amount
    })
  );

  // No memo, unique fee payer - privacy safe
  await connection.sendTransaction(transaction, [wallet, feePayer]);
}

async function privacySafeBatch(recipients: PublicKey[]) {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = Keypair.generate();

  for (const recipient of recipients) {
    // GOOD: New fee payer for each transfer
    const feePayer = Keypair.generate();

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports: 1000000
      })
    );

    await connection.sendTransaction(transaction, [wallet, feePayer]);
  }
}
