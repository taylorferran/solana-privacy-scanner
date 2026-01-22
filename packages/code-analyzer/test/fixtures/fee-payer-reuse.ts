// Test fixture: Fee payer reuse
// This should detect a CRITICAL issue

import { Keypair, Connection, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

async function badBatchTransfer(recipients: PublicKey[], amounts: number[]) {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = Keypair.generate();

  // BAD: Reusing fee payer across multiple transfers
  const feePayer = Keypair.generate();

  for (let i = 0; i < recipients.length; i++) {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipients[i],
        lamports: amounts[i]
      })
    );

    // Using same feePayer for all transactions (PRIVACY LEAK!)
    await connection.sendTransaction(transaction, [wallet, feePayer]);
  }
}

// This should NOT be flagged (good practice)
async function goodBatchTransfer(recipients: PublicKey[], amounts: number[]) {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = Keypair.generate();

  for (let i = 0; i < recipients.length; i++) {
    // GOOD: Generating unique fee payer for each transaction
    const feePayer = Keypair.generate();

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipients[i],
        lamports: amounts[i]
      })
    );

    await connection.sendTransaction(transaction, [wallet, feePayer]);
  }
}
