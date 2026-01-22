---
name: solana-privacy-scan
description: Scan Solana TypeScript/JavaScript code for privacy vulnerabilities using static analysis. Run this when the user asks to check privacy, or when working with Solana transaction code.
disable-model-invocation: true
allowed-tools: Bash, Read, Edit, Glob
---

# Solana Privacy Scanner Skill

You help developers find and fix privacy vulnerabilities in Solana code by running the `solana-privacy-analyzer` tool and presenting results clearly.

## When to Use

Run this skill when:
- User explicitly asks: `/solana-privacy-scan`
- User mentions checking privacy in Solana code
- User is writing transaction code that might have privacy issues

## How It Works

### Step 1: Run the Analyzer

Execute the analyzer tool on the specified path (or current directory if not specified):

```bash
npx solana-privacy-analyzer scan [path] --json
```

If the analyzer is not installed, tell the user:

```
⚠️  Solana Privacy Analyzer not found

This plugin requires the analyzer tool to be installed.

Install it:
npm install --save-dev solana-privacy-analyzer

Then re-run: /solana-privacy-scan
```

### Step 2: Parse Results

The analyzer returns JSON with this structure:

```json
{
  "issues": [
    {
      "type": "fee-payer-reuse" | "memo-pii",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "file": "path/to/file.ts",
      "line": 45,
      "column": 8,
      "message": "Fee payer 'feePayer' reused in loop",
      "suggestion": "Move fee payer generation inside the loop",
      "codeSnippet": "...",
      "identifier": "feePayer",
      "occurrences": 3
    }
  ],
  "summary": {
    "critical": 2,
    "high": 1,
    "medium": 0,
    "low": 0,
    "total": 3
  },
  "filesAnalyzed": 10
}
```

### Step 3: Present Results

**If no issues (total === 0):**

```
✅ Privacy Scan Complete

Analyzed X files - no privacy issues detected!

Your code follows privacy best practices.
```

**If issues found:**

Format a detailed, actionable report:

```
🔒 Privacy Scan Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyzed X files, found Y issues:

🔴 CRITICAL: 2 issues (must fix)
🟡 HIGH: 1 issue (should fix)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 src/transfer.ts

1. 🔴 CRITICAL: Fee Payer Reused in Loop
   Line 45

   Current code:
   ```typescript
   const feePayer = Keypair.generate();  // ← Declared outside loop

   for (const recipient of recipients) {
     await sendTransaction(tx, [wallet, feePayer]);  // ← Reused
   }
   ```

   ⚠️  Privacy Impact:
   All transfers will be linked on-chain. Anyone analyzing the blockchain
   can see they came from the same source, completely defeating privacy.

   ✅ Fix:
   ```typescript
   for (const recipient of recipients) {
     const feePayer = Keypair.generate();  // ← Generate inside loop
     await sendTransaction(tx, [wallet, feePayer]);
   }
   ```

   Type 'fix 1' to apply this fix automatically

2. 🔴 CRITICAL: Email in Memo Field
   Line 78

   Current code:
   ```typescript
   createMemoInstruction("Payment to user@example.com")
   ```

   ⚠️  Privacy Impact:
   Email permanently exposed on-chain and searchable forever.

   ✅ Fix: Remove PII entirely
   ```typescript
   createMemoInstruction("Payment")
   ```

   Type 'fix 2' to apply this fix automatically

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Privacy Score: 3/10 (High Risk)

Commands:
• 'fix all' - Apply all automatic fixes
• 'fix 1,2' - Fix specific issues
• 'explain [type]' - Learn about a vulnerability type
```

### Step 4: Apply Fixes (When Requested)

When user types `fix N` or `fix all`:

1. **Read the file** with the issue
2. **Apply the suggested fix** using Edit tool
3. **Re-run the scan** to verify
4. **Report success**:

```
✅ Applied fixes for issues #1, #2

Re-running scan...
✅ All critical issues resolved!

Privacy scan now shows:
- 0 critical issues
- 0 high issues
```

## Fix Logic by Issue Type

### Fee Payer Reuse in Loop

**Pattern to fix:**
```typescript
const feePayer = Keypair.generate();  // Outside loop
for (...) {
  await sendTransaction(tx, [wallet, feePayer]);  // Reused
}
```

**Fixed version:**
```typescript
for (...) {
  const feePayer = Keypair.generate();  // Inside loop
  await sendTransaction(tx, [wallet, feePayer]);
}
```

**Steps:**
1. Read file
2. Find the fee payer declaration line
3. Remove it from outside the loop
4. Add it inside the loop body at the beginning
5. Edit file with changes

### PII in Memos

**Pattern to fix:**
```typescript
createMemoInstruction("Email: user@example.com")
```

**Fixed version:**
```typescript
createMemoInstruction("Payment")  // Generic
// Or remove memo instruction entirely
```

**Steps:**
1. Read file
2. Find the memo instruction with PII
3. Replace the string content with generic text like "Payment" or "Transfer"
4. Edit file with changes

### Sequential Reuse

**Pattern to fix:**
```typescript
const feePayer = Keypair.generate();
await sendTransaction(tx1, [wallet, feePayer]);
await sendTransaction(tx2, [wallet, feePayer]);
```

**Fixed version:**
```typescript
await sendTransaction(tx1, [wallet, Keypair.generate()]);
await sendTransaction(tx2, [wallet, Keypair.generate()]);
```

**Steps:**
1. Read file
2. Find all usages of the fee payer variable
3. Replace each usage with inline `Keypair.generate()`
4. Remove the original declaration
5. Edit file with changes

## Educational Explanations

When user asks for explanation (`explain [type]`), provide context:

### Fee Payer Reuse

```
💡 Why Fee Payer Reuse Matters

On Solana, every transaction has a "fee payer" - the account that pays
for transaction fees. When you reuse the same fee payer across multiple
transactions, they become linkable on-chain.

Think of it like using the same credit card for every purchase - it
creates a paper trail linking all your activity together.

Privacy-safe pattern:
• Generate a NEW fee payer for each transaction
• Or batch transactions you're okay being linked

Trade-off:
• More fee payers = higher cost (each needs SOL for fees)
• But essential for privacy-critical applications
```

### Memo PII

```
💡 Why Memo PII Matters

Transaction memos are permanently public and searchable on-chain. They
can NEVER be deleted.

Never include in memos:
• Email addresses, phone numbers, names
• Order numbers that link to real-world purchases
• Anything you wouldn't put on a public billboard

For internal tracking:
• Use off-chain databases
• Reference generic transaction IDs
• Keep sensitive data in your own systems
```

## Error Handling

**If analyzer fails:**
```
❌ Privacy scan failed

Error: [error message]

Troubleshooting:
1. Ensure analyzer is installed: npm install --save-dev solana-privacy-analyzer
2. Check file paths are valid
3. Verify files are TypeScript/JavaScript

Run `/solana-privacy-scan` again after fixing
```

**If file editing fails:**
```
❌ Failed to apply fix

[Error details]

You can apply this fix manually:
[Show the suggested change]
```

## Important Notes

- **Always re-run scan after fixing** to verify issues are resolved
- **Be conservative** - Don't edit code without user confirmation
- **Explain impact** - Help users understand WHY issues matter
- **Offer alternatives** - Sometimes architectural changes are better than simple fixes
- **Never skip critical issues** - These compromise privacy completely

## Success Indicators

You're doing this right when:
- Results are clear and actionable
- Fixes actually resolve the issues
- Users understand the privacy implications
- Code changes are safe and correct
