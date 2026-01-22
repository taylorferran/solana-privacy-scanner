---
sidebar_position: 4
---

# Examples

Real-world examples of using the `/solana-privacy-scan` skill in Claude Code.

## Example 1: Fixing Fee Payer Reuse

### Initial Code

You have a batch transfer function with a privacy issue:

**src/batch-transfer.ts:**
```typescript
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';

async function batchTransfer(
  connection: Connection,
  wallet: Keypair,
  recipients: PublicKey[],
  amounts: number[]
) {
  const feePayer = Keypair.generate();  // Created once

  for (let i = 0; i < recipients.length; i++) {
    const transaction = new Transaction();

    // ... add transfer instruction ...

    // Reused fee payer - privacy leak!
    await connection.sendTransaction(transaction, [wallet, feePayer]);
  }
}
```

### Running the Scan

```
You: /solana-privacy-scan src/batch-transfer.ts
```

### Claude's Response

```
Claude: I found 1 CRITICAL privacy issue in your code:

📁 src/batch-transfer.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer reuse detected
   Line 9:8

   The fee payer 'feePayer' is declared outside the loop at line 9
   but reused for all transactions inside the loop. This makes all
   transactions linkable on-chain.

   Code:
       7 |   amounts: number[]
       8 | ) {
   >   9 |   const feePayer = Keypair.generate();
      10 |
      11 |   for (let i = 0; i < recipients.length; i++) {

   Impact: All transactions in the batch can be linked together,
   revealing that they came from the same source despite using
   different fee payers.

   Occurrences: feePayer used 1 time inside the loop

   Fix: Move the fee payer generation inside the loop so each
   transaction gets a unique fee payer.

   Would you like me to fix this?
```

### Applying the Fix

```
You: Yes, please fix it

Claude: I'll move the fee payer generation inside the loop. Here's the change:

```diff
--- src/batch-transfer.ts
+++ src/batch-transfer.ts
@@ -6,12 +6,12 @@
   recipients: PublicKey[],
   amounts: number[]
 ) {
-  const feePayer = Keypair.generate();
-
   for (let i = 0; i < recipients.length; i++) {
+    const feePayer = Keypair.generate();
+
     const transaction = new Transaction();

     // ... add transfer instruction ...

     await connection.sendTransaction(transaction, [wallet, feePayer]);
   }
 }
```

This ensures each transaction has a unique fee payer, preventing
on-chain linkability.

Shall I apply this fix?
```

```
You: Yes

Claude: ✅ Fixed! Each transaction now gets its own fee payer,
        maintaining privacy across the batch.
```

### Verification

```
You: /solana-privacy-scan src/batch-transfer.ts

Claude: ✅ No privacy issues detected!

        The file passed all privacy checks.
```

## Example 2: Removing PII from Memos

### Initial Code

**src/payment.ts:**
```typescript
import { createMemoInstruction } from '@solana/spl-memo';

async function sendPayment(recipient: PublicKey, amount: number) {
  const transaction = new Transaction();

  // Add transfer instruction...

  // BAD: Email in memo
  transaction.add(
    createMemoInstruction(
      `Payment to john.doe@example.com for invoice #1234`,
      [wallet.publicKey]
    )
  );

  await connection.sendTransaction(transaction, [wallet]);
}
```

### Running the Scan

```
You: /solana-privacy-scan src/payment.ts
```

### Claude's Response

```
Claude: I found 1 CRITICAL privacy issue:

📁 src/payment.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL PII detected in memo: email
   Line 10:7

   Found email address 'john.doe@example.com' in transaction memo.
   This personal information will be permanently stored on-chain
   and publicly searchable.

   Code:
       8 |   transaction.add(
       9 |     createMemoInstruction(
   >  10 |       `Payment to john.doe@example.com for invoice #1234`,
      11 |       [wallet.publicKey]
      12 |     )

   Impact: The email links the wallet address to a real person,
   completely defeating transaction privacy.

   Suggestion: Remove personal information from memo. Use generic
   text or omit memo entirely. Store sensitive details off-chain.

   Would you like me to fix this?
```

### Discussion

```
You: What should I put in the memo instead?

Claude: Great question! You have a few options:

1. **Generic memo:**
   ```typescript
   createMemoInstruction("Payment")
   ```

   Pros: Simple, maintains basic context
   Cons: Less informative

2. **Reference ID only:**
   ```typescript
   createMemoInstruction("INV-1234")
   ```

   Pros: You can look up details in your database
   Cons: Still reveals transaction purpose

3. **Encrypted memo:**
   ```typescript
   const encrypted = encryptMemo({
     recipient: "john.doe@example.com",
     invoice: "1234"
   }, recipientPublicKey);
   createMemoInstruction(encrypted)
   ```

   Pros: Secure, only recipient can decrypt
   Cons: More complex to implement

4. **No memo:**
   Just omit the memo instruction entirely and store details
   in your private database.

   Pros: Maximum privacy
   Cons: No on-chain reference

Which approach fits your use case?
```

```
You: Let's use option 4, no memo

Claude: Perfect choice for maximum privacy. I'll remove the memo
        instruction entirely:

```diff
--- src/payment.ts
+++ src/payment.ts
@@ -3,13 +3,8 @@
 async function sendPayment(recipient: PublicKey, amount: number) {
   const transaction = new Transaction();

   // Add transfer instruction...

-  transaction.add(
-    createMemoInstruction(
-      `Payment to john.doe@example.com for invoice #1234`,
-      [wallet.publicKey]
-    )
-  );
+  // Memo removed for privacy - store details in private database

   await connection.sendTransaction(transaction, [wallet]);
 }
```

Shall I apply this?
```

```
You: Yes

Claude: ✅ Fixed! The memo has been removed. Remember to store
        invoice details in your private database instead.
```

## Example 3: Scanning a Large Codebase

### Initial Scan

```
You: /solana-privacy-scan src/
```

### Claude's Response

```
Claude: I found 7 privacy issues across 5 files:

📊 Summary
Files analyzed: 12
Total issues: 7

  🔴 CRITICAL: 3
  🟡 HIGH: 2
  🔵 MEDIUM: 2

Issues by file:

📁 src/batch-transfer.ts (2 issues)
  1. 🔴 CRITICAL Fee payer reuse (line 15)
  2. 🔵 MEDIUM Descriptive memo (line 28)

📁 src/user-registration.ts (2 issues)
  3. 🔴 CRITICAL PII in memo: email (line 42)
  4. 🟡 HIGH PII in memo: name (line 44)

📁 src/rewards.ts (1 issue)
  5. 🔵 MEDIUM Descriptive memo (line 67)

📁 src/donation.ts (1 issue)
  6. 🟡 HIGH PII in memo: name (line 103)

📁 src/legacy/old-transfer.ts (1 issue)
  7. 🔴 CRITICAL Fee payer reuse (line 89)

Would you like me to fix these issues? We can do them all at once
or go through them one by one.
```

### Batch Fixing

```
You: Fix all the CRITICAL issues first

Claude: I'll fix the 3 CRITICAL issues:

Issue #1: Moving fee payer generation inside loop (src/batch-transfer.ts:15)
Issue #3: Removing email from memo (src/user-registration.ts:42)
Issue #7: Moving fee payer generation inside loop (src/legacy/old-transfer.ts:89)

Here are the changes:

[Shows diffs for all 3 files]

Shall I apply all these fixes?
```

```
You: Yes

Claude: ✅ Applied all 3 fixes!

Remaining issues:
  🟡 HIGH: 2
  🔵 MEDIUM: 2

Would you like to address the HIGH severity issues next?
```

## Example 4: Learning Mode

### Understanding Fee Payer Reuse

```
You: Can you explain why fee payer reuse is such a big deal?

Claude: Absolutely! Let me break down the privacy implications:

**What happens on-chain:**

When you reuse a fee payer, all transactions signed by that fee
payer can be linked together on the blockchain. Here's a concrete
example:

```typescript
// BAD: Same fee payer
const feePayer = Keypair.generate();
for (const recipient of [Alice, Bob, Charlie]) {
  await send(recipient, amount, [wallet, feePayer]);
}
```

On-chain, an observer sees:

1. Transaction A: Wallet_1 → Alice (fee payer: FP_123)
2. Transaction B: Wallet_1 → Bob (fee payer: FP_123)
3. Transaction C: Wallet_1 → Charlie (fee payer: FP_123)

**What the observer learns:**

- All three transactions came from the same source (Wallet_1)
- They were sent as a batch (same fee payer)
- Likely the same entity controls all three destinations
- Pattern analysis can reveal business logic

**With unique fee payers:**

```typescript
// GOOD: Unique fee payer per transaction
for (const recipient of [Alice, Bob, Charlie]) {
  const feePayer = Keypair.generate();
  await send(recipient, amount, [wallet, feePayer]);
}
```

On-chain:

1. Transaction A: Wallet_1 → Alice (fee payer: FP_abc)
2. Transaction B: Wallet_1 → Bob (fee payer: FP_def)
3. Transaction C: Wallet_1 → Charlie (fee payer: FP_ghi)

**What the observer sees:**

- Three independent transactions
- No obvious connection between them
- Could be from different sources/times
- Much harder to perform pattern analysis

**Bottom line:**

Fee payer reuse is like using the same return address on all your
letters - it makes them all linkable even if the content is private.
```

### Exploring Trade-offs

```
You: Doesn't generating a new keypair for each transaction cost gas?

Claude: Great question! Let's look at the costs:

**Computation Cost:**
- Keypair.generate() is client-side only
- Takes ~1-2ms per call
- No on-chain computation cost
- No gas fees for generation

**Transaction Cost:**
The fee payer account needs a small SOL balance:
- Minimum: ~0.000005 SOL per transaction (rent-exempt)
- For 100 transactions: ~0.0005 SOL total
- At $100/SOL: ~$0.05 total cost

**Privacy Benefit:**
- Transactions become unlinkable
- Observers can't correlate activity
- Protects user privacy
- Prevents pattern analysis

**Optimization Options:**

If cost is a concern:

1. **Reuse within safety margin:**
   ```typescript
   const feePayer = Keypair.generate();
   for (let i = 0; i < 5; i++) {  // Small batch
     // Use feePayer
   }
   ```
   Links only 5 transactions instead of all

2. **Time-based rotation:**
   ```typescript
   let feePayer = Keypair.generate();
   let lastRotation = Date.now();

   if (Date.now() - lastRotation > 60000) {
     feePayer = Keypair.generate();
     lastRotation = Date.now();
   }
   ```

3. **Budget threshold:**
   Only generate new fee payer for high-value transactions

**Recommendation:**

For maximum privacy: unique fee payer per transaction
The cost is negligible compared to the privacy benefit.
```

## Example 5: Pre-Commit Workflow

### Before Committing

```
You: I'm about to commit these changes. Can you check for privacy issues?

/solana-privacy-scan src/new-feature.ts

Claude: ✅ No privacy issues detected!

        The file passed all privacy checks. Safe to commit!
```

### Found Issues

```
You: /solana-privacy-scan src/

Claude: Found 1 CRITICAL issue in staged changes:

📁 src/new-feature.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer reuse
   Line 45:8

This was introduced in your recent changes. Would you like me
to fix it before you commit?
```

```
You: Yes please

Claude: [Applies fix]

        ✅ Fixed! Now you can commit safely:

        git add src/new-feature.ts
        git commit -m "Add new feature (privacy-safe)"
```

## Example 6: Code Review

### Reviewing a PR

```
You: I'm reviewing a PR that adds batch payments. Can you check it?

/solana-privacy-scan src/batch-payments.ts

Claude: I found 2 issues in the PR:

📁 src/batch-payments.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer reuse (line 23)
   This is the main privacy concern. The batch payment function
   reuses a single fee payer across all payments.

2. 🔵 MEDIUM Descriptive memo (line 45)
   Minor issue: memo says "Batch payment #123" which reveals
   this is part of a batch operation.

**PR Feedback:**

The functionality looks good, but I'd recommend:

1. Generate unique fee payer per payment (MUST fix)
2. Use generic memo or omit it (SHOULD fix)

With these changes, the feature will be privacy-safe.

Would you like me to provide code suggestions for the PR author?
```

## Next Steps

- [Usage Guide](./usage) - Detailed command reference
- [Installation](./installation) - Set up the plugin
- [Code Analyzer CLI](../code-analyzer/overview) - Standalone tool
- [CI/CD Integration](../code-analyzer/ci-cd) - Automate checks
