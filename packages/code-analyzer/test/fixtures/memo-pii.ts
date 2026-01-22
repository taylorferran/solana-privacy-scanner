// Test fixture: PII in transaction memos
// This should detect multiple CRITICAL and HIGH issues

import { Keypair, Connection, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { createMemoInstruction } from '@solana/spl-memo';

async function transferWithBadMemos() {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = Keypair.generate();
  const recipient = new PublicKey('...');

  // BAD: Email in memo (CRITICAL)
  await connection.sendTransaction(
    new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports: 1000000
      }),
      createMemoInstruction("Payment to john.doe@example.com", [wallet.publicKey])
    ),
    [wallet]
  );

  // BAD: Phone number in memo (CRITICAL)
  await connection.sendTransaction(
    new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports: 1000000
      }),
      createMemoInstruction("Contact: +1-555-123-4567", [wallet.publicKey])
    ),
    [wallet]
  );

  // BAD: Personal name pattern (HIGH)
  await connection.sendTransaction(
    new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports: 1000000
      }),
      createMemoInstruction("Customer: John Smith", [wallet.publicKey])
    ),
    [wallet]
  );

  // BAD: Descriptive content (MEDIUM)
  await connection.sendTransaction(
    new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports: 1000000
      }),
      createMemoInstruction("Payment for order #12345 from customer account ABC", [wallet.publicKey])
    ),
    [wallet]
  );
}

// GOOD: Generic memo
async function transferWithGoodMemo() {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = Keypair.generate();
  const recipient = new PublicKey('...');

  await connection.sendTransaction(
    new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports: 1000000
      }),
      createMemoInstruction("Payment", [wallet.publicKey])
    ),
    [wallet]
  );
}

// BEST: No memo at all
async function transferWithoutMemo() {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const wallet = Keypair.generate();
  const recipient = new PublicKey('...');

  await connection.sendTransaction(
    new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports: 1000000
      })
    ),
    [wallet]
  );
}
