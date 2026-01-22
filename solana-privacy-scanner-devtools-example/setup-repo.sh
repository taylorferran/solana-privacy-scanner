#!/bin/bash

# Setup script for example repository

echo "Setting up solana-privacy-scanner-devtools-example repository..."

# Initialize git repo
git init

# Create main branch with good code
git add .
git commit -m "Initial commit: Privacy-preserving implementation

- Unique fee payer generation per transaction
- Safe memo utilities
- Privacy tests with devtools matchers
- Static analyzer integration
- CI/CD workflow

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Rename to main if needed
git branch -M main

echo ""
echo "✓ Main branch created with privacy-preserving code"
echo ""

# Create bad-privacy branch
git checkout -b feat/bad-privacy

# Replace transfer.ts with bad implementation
cat > src/transfer.ts << 'EOF'
/**
 * PRIVACY VIOLATION EXAMPLE
 *
 * This file demonstrates BAD privacy patterns that should be caught by:
 * 1. Static analyzer (detecting code patterns)
 * 2. Runtime tests (testing actual transactions)
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

// CRITICAL VIOLATION: Shared fee payer across transactions
const SHARED_FEE_PAYER = Keypair.generate();

/**
 * Execute a single transfer
 * ❌ PRIVACY ISSUE: Uses shared fee payer
 */
export async function executePrivateTransfer(
  config: TransferConfig,
  connection: Connection
): Promise<string> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: config.from.publicKey,
      toPubkey: config.to,
      lamports: config.amount * LAMPORTS_PER_SOL,
    })
  );

  // ❌ PRIVACY ISSUE: PII in memo field
  if (config.memo) {
    transaction.add({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(config.memo),
    });
  }

  // ❌ Using shared fee payer - links all transactions together
  transaction.feePayer = SHARED_FEE_PAYER.publicKey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const signature = await connection.sendTransaction(transaction, [SHARED_FEE_PAYER, config.from]);
  return signature;
}

/**
 * Execute multiple transfers
 * ❌ CRITICAL PRIVACY ISSUE: Fee payer reuse in loop
 */
export async function executeBatchTransfers(
  configs: TransferConfig[],
  connection: Connection
): Promise<string[]> {
  const signatures: string[] = [];

  // ❌ CRITICAL: Same fee payer used for all transactions in loop
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: config.from.publicKey,
        toPubkey: config.to,
        lamports: config.amount * LAMPORTS_PER_SOL,
      })
    );

    // ❌ HIGH: PII leaked in memo - email address pattern
    const userEmail = `user${i}@example.com`;
    transaction.add({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(`Payment to ${userEmail}`),
    });

    transaction.feePayer = SHARED_FEE_PAYER.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signature = await connection.sendTransaction(transaction, [SHARED_FEE_PAYER, config.from]);
    signatures.push(signature);
  }

  return signatures;
}

/**
 * Build a transaction without sending
 * ❌ PRIVACY ISSUE: Uses shared fee payer
 */
export function buildTransferTransaction(config: TransferConfig): Transaction {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: config.from.publicKey,
      toPubkey: config.to,
      lamports: config.amount * LAMPORTS_PER_SOL,
    })
  );

  // ❌ MEDIUM: Descriptive memo that leaks information
  if (config.memo) {
    const descriptiveMemo = `Transfer of ${config.amount} SOL to recipient for services rendered in January 2024`;
    transaction.add({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(descriptiveMemo),
    });
  }

  // ❌ Using shared fee payer
  transaction.feePayer = SHARED_FEE_PAYER.publicKey;

  return transaction;
}
EOF

git add src/transfer.ts
git commit -m "feat: Add batch transfer with shared fee payer

Implements batch transfer functionality using a shared fee payer
for cost optimization. This reduces the number of accounts that
need to be funded.

❌ This introduces privacy issues - analyzer should detect

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo "✓ feat/bad-privacy branch created with privacy violations"
echo ""

# Go back to main
git checkout main

echo "Repository setup complete!"
echo ""
echo "Branches created:"
echo "  - main: Privacy-preserving implementation (CI passes ✓)"
echo "  - feat/bad-privacy: Privacy violations (CI fails ✗)"
echo ""
echo "Next steps:"
echo "  1. Run 'npm install'"
echo "  2. Test main branch: 'npm test && npm run analyze'"
echo "  3. Test bad branch: 'git checkout feat/bad-privacy && npm test'"
echo ""
echo "To create PRs, push to GitHub:"
echo "  git remote add origin <your-repo-url>"
echo "  git push -u origin main"
echo "  git push origin feat/bad-privacy"
