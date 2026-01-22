// Examples of privacy-safe patterns

import { Keypair, Connection, Transaction, SystemProgram } from '@solana/web3.js';

// ✅ GOOD: Unique fee payer per transaction
async function goodBatchTransfer(recipients) {
  const connection = new Connection('...');
  const wallet = Keypair.generate();

  for (const recipient of recipients) {
    const feePayer = Keypair.generate();  // ← Generated inside loop

    await connection.sendTransaction(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipient,
          lamports: 1000000
        })
      ),
      [wallet, feePayer]  // ← Unique fee payer, not linked
    );
  }
}

// ✅ GOOD: Generic memo (or no memo at all)
async function goodMemo() {
  const connection = new Connection('...');
  await connection.sendTransaction(
    new Transaction().add(
      SystemProgram.transfer({...}),
      createMemoInstruction("Payment")  // ← Generic, no PII
    ),
    [wallet]
  );
}

// ✅ BEST: No memo
async function bestNoMemo() {
  const connection = new Connection('...');
  await connection.sendTransaction(
    new Transaction().add(
      SystemProgram.transfer({...})  // ← No memo field
    ),
    [wallet]
  );
}

// ✅ GOOD: Inline generation
async function goodInline() {
  await sendTransaction(tx1, [wallet, Keypair.generate()]);  // ← Not linked
  await sendTransaction(tx2, [wallet, Keypair.generate()]);  // ← Not linked
  await sendTransaction(tx3, [wallet, Keypair.generate()]);  // ← Not linked
}
