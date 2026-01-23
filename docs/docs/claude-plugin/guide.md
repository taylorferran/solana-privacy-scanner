---
sidebar_position: 1
---

# Claude Plugin Guide

Privacy analysis plugin for Claude Code that detects and fixes privacy vulnerabilities in Solana code during development.

## What It Does

The `/solana-privacy-scan` skill runs static analysis on your Solana code and provides interactive fixing:

1. Scans your TypeScript/JavaScript code
2. Detects privacy issues (fee payer reuse, PII in memos)
3. Explains each issue and privacy impact
4. Proposes fixes for your approval
5. Applies fixes automatically

## Installation

### Prerequisites

Install Claude Code CLI:

```bash
npm install -g claude-code
```

Install the privacy analyzer in your Solana project:

```bash
npm install --save-dev solana-privacy-analyzer
```

Or globally:

```bash
npm install -g solana-privacy-analyzer
```

### Load the Plugin

**Method 1: Clone Repository**

```bash
git clone https://github.com/taylorferran/solana-privacy-scanner
cd solana-privacy-scanner

# Start Claude Code with plugin
claude --plugin-dir packages/claude-plugin
```

**Method 2: Set Default Plugin Directory**

Make the plugin load automatically by setting an environment variable.

For Bash (`~/.bashrc`) or Zsh (`~/.zshrc`):

```bash
export CLAUDE_PLUGIN_DIR=/path/to/solana-privacy-scanner/packages/claude-plugin
```

Then reload your shell:

```bash
source ~/.bashrc  # or ~/.zshrc
```

Now just run `claude` and the plugin loads automatically.

### Verify Installation

Start Claude Code and check for the skill:

```bash
claude
```

Then:

```
/help
```

You should see `solana-privacy-scan` in the list.

## Usage

### Basic Commands

```
# Scan current directory
/solana-privacy-scan

# Scan specific directory
/solana-privacy-scan src/

# Scan specific file
/solana-privacy-scan src/transfer.ts

# Scan multiple paths
/solana-privacy-scan src/ lib/ utils/
```

### Interactive Workflow

```
You: /solana-privacy-scan src/

Claude: I found 2 privacy issues:

📁 src/transfer.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer 'feePayer' declared outside loop
   Line 15:8

   This fee payer is reused across all transactions, making them
   linkable on-chain.

   Would you like me to fix this?

You: Yes, please fix it

Claude: I'll move the fee payer generation inside the loop...
        [Shows diff]

        Shall I apply this fix?

You: Yes

Claude: ✅ Fixed! Each transaction now has a unique fee payer.
```

## What It Detects

### Fee Payer Reuse (CRITICAL)

**Bad Pattern:**

```typescript
// Fee payer declared outside loop
const feePayer = Keypair.generate();

for (const recipient of recipients) {
  const tx = new Transaction().add(/* ... */);

  // Reused fee payer - ALL TRANSACTIONS LINKABLE
  await sendAndConfirmTransaction(connection, tx, [wallet, feePayer]);
}
```

**Good Pattern:**

```typescript
for (const recipient of recipients) {
  // New fee payer each iteration
  const feePayer = Keypair.generate();

  const tx = new Transaction().add(/* ... */);
  await sendAndConfirmTransaction(connection, tx, [wallet, feePayer]);
}
```

When a fee payer is reused, anyone can query the blockchain for all transactions signed by that fee payer, revealing all recipients, amounts, timing, and relationships.

### PII in Memos (CRITICAL/HIGH/MEDIUM)

Detects personally identifiable information in transaction memos. Memos are permanently stored on-chain.

**Severity Levels:**
- **CRITICAL** - Email addresses, phone numbers, SSN, credit cards
- **HIGH** - Personal names, URLs with sensitive parameters
- **MEDIUM** - Descriptive content that may reveal identity

**Bad Examples:**

```typescript
// CRITICAL: Email in memo
const memo = createMemoInstruction("Payment to alice@example.com");

// HIGH: Personal name
const memo = createMemoInstruction("Payment for John Smith");

// MEDIUM: Descriptive content
const memo = createMemoInstruction("Rent payment for apartment 4B");
```

**Good Examples:**

```typescript
// GOOD: Generic memo
const memo = createMemoInstruction("Payment");

// GOOD: Opaque reference
const memo = createMemoInstruction("REF:8a7b3d2e");

// BEST: No memo at all
// Just omit the memo instruction
```

## Example Session

### Initial Code with Privacy Issue

**src/batch-transfer.ts:**

```typescript
async function batchTransfer(
  connection: Connection,
  wallet: Keypair,
  recipients: PublicKey[],
  amounts: number[]
) {
  const feePayer = Keypair.generate();  // Created once

  for (let i = 0; i < recipients.length; i++) {
    const tx = new Transaction();
    // ... add transfer instruction ...

    // Reused fee payer - privacy leak!
    await connection.sendTransaction(tx, [wallet, feePayer]);
  }
}
```

### Run the Scan

```
/solana-privacy-scan src/batch-transfer.ts
```

### Claude Detects and Fixes

```
Claude: I found 1 CRITICAL privacy issue:

📁 src/batch-transfer.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer reuse detected
   Line 9:8

   The fee payer is declared outside the loop but reused for all
   transactions. This makes all transactions linkable on-chain.

   Would you like me to fix this?
```

### Apply the Fix

```
You: Yes

Claude: Moving fee payer generation inside the loop:

--- src/batch-transfer.ts
+++ src/batch-transfer.ts
@@ -6,8 +6,8 @@
   amounts: number[]
 ) {
-  const feePayer = Keypair.generate();
-
   for (let i = 0; i < recipients.length; i++) {
+    const feePayer = Keypair.generate();
+
     const tx = new Transaction();
     // ... add transfer instruction ...

✅ Fixed! Each transaction now gets a unique fee payer.
```

## Common Use Cases

### Before Committing Code

```
/solana-privacy-scan
```

Quick scan before commit to catch privacy issues.

### During Code Review

```
/solana-privacy-scan src/new-feature.ts
```

Check that new code doesn't introduce privacy leaks.

### Refactoring Legacy Code

```
/solana-privacy-scan src/legacy/
```

Get a comprehensive list of all privacy issues to fix systematically.

### Learning Privacy Patterns

Scan example code and ask Claude to explain:

```
You: /solana-privacy-scan examples/

You: Why is reusing fee payers bad?

Claude: When you reuse the same fee payer across multiple transactions,
        all those transactions become linkable on-chain...
```

## Output Format

### Summary

```
🔒 Privacy Scan Results

Files analyzed: 5
Total issues: 3

  🔴 CRITICAL: 2
  🔵 MEDIUM: 1
```

### Issue Details

```
📁 src/transfer.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer reuse detected
   Line 45:8

   The fee payer 'feePayer' is declared outside the loop but used
   inside, making all 10 transactions linkable on-chain.

   Code:
      43 |
      44 |   // Declared outside
   >  45 |   const feePayer = Keypair.generate();
      46 |
      47 |   for (let i = 0; i < recipients.length; i++) {

   Impact: Complete loss of transaction privacy
   Fix: Move fee payer generation inside the loop
```

### Clean Results

```
✅ No privacy issues detected!

All 12 files passed privacy checks.
```

## Working with Claude

### Focus on Critical Issues

```
You: Let's focus on just the CRITICAL issues first

Claude: I'll address the 2 CRITICAL issues...
```

### Batch Fixing

```
You: Fix all of these

Claude: I'll fix all 5 issues. Here are the changes...
```

### Selective Fixing

```
You: Fix issues 1 and 3, leave 2 for now

Claude: I'll fix the fee payer reuse (issue 1) and memo PII (issue 3)...
```

### Understanding Issues

```
You: Why is this a problem?

Claude: This is CRITICAL because when you reuse a fee payer...
        [detailed explanation with on-chain privacy impact]
```

## Best Practices

1. **Scan Early and Often** - Run during development, not just before deployment
2. **Understand, Don't Just Fix** - Ask Claude to explain issues to learn privacy patterns
3. **Review All Fixes** - Check diffs, verify functionality preserved
4. **Combine with Testing** - Run tests after applying fixes
5. **Use with CI/CD** - Plugin for interactive development, CLI for automated checks

## Limitations

### Detection Coverage

Currently detects:
- ✅ Fee payer reuse in loops
- ✅ PII in memos
- ❌ Complex privacy patterns (not yet implemented)

For undetected patterns, ask Claude for manual review.

### Static Analysis Only

Cannot detect:
- Runtime behavior
- External API calls that leak data
- Network-level privacy issues

Use as one layer of privacy defense.

## Updating

### Update Plugin

```bash
cd /path/to/solana-privacy-scanner
git pull origin main
```

### Update Analyzer

```bash
npm install --save-dev solana-privacy-analyzer@latest

# Or globally
npm update -g solana-privacy-analyzer
```

## Links

- [GitHub Repository](https://github.com/taylorferran/solana-privacy-scanner)
- [Toolkit CLI](../toolkit/overview)
- [Core Library](../core/usage)
