// Examples of privacy-violating patterns

import { Keypair, Connection, Transaction, SystemProgram } from '@solana/web3.js';

// ❌ BAD: Fee payer reused in loop
async function badBatchTransfer(recipients) {
  const connection = new Connection('...');
  const wallet = Keypair.generate();
  const feePayer = Keypair.generate();  // ← Declared outside

  for (const recipient of recipients) {
    await connection.sendTransaction(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipient,
          lamports: 1000000
        })
      ),
      [wallet, feePayer]  // ← REUSED - creates linkable transactions
    );
  }
}

// ❌ BAD: PII in memo
async function badMemo() {
  const connection = new Connection('...');
  await connection.sendTransaction(
    new Transaction().add(
      createMemoInstruction("Payment to john@example.com")  // ← Email exposed on-chain
    ),
    [wallet]
  );
}

// ❌ BAD: Sequential reuse
async function badSequential() {
  const feePayer = Keypair.generate();

  await sendTransaction(tx1, [wallet, feePayer]);  // ← Linked
  await sendTransaction(tx2, [wallet, feePayer]);  // ← Linked
  await sendTransaction(tx3, [wallet, feePayer]);  // ← Linked
}
