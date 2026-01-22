---
name: solana-privacy-scan
description: Scan Solana TypeScript/JavaScript code for privacy vulnerabilities using static analysis
disable-model-invocation: true
allowed-tools: Bash, Read, Edit, Glob
---

# Solana Privacy Scanner

Scan Solana code for privacy vulnerabilities by running the static analyzer and presenting results clearly.

## Usage

User invokes: `/solana-privacy-scan [path]`

Default path: Current directory

## Workflow

### Step 1: Check if analyzer is installed

First, verify the analyzer tool is available:

```bash
which npx
```

### Step 2: Run the analyzer

Execute the analyzer on the specified path:

```bash
npx solana-privacy-analyzer scan [path] --json
```

If not installed, tell the user:
```
⚠️  Solana Privacy Analyzer not found

Install it first:
npm install --save-dev solana-privacy-analyzer

Then run /solana-privacy-scan again
```

### Step 3: Parse JSON results

The analyzer returns:
```json
{
  "issues": [
    {
      "type": "fee-payer-reuse" | "memo-pii",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "file": "path/to/file.ts",
      "line": 45,
      "message": "Description",
      "suggestion": "How to fix",
      "codeSnippet": "...",
      "identifier": "variable-name"
    }
  ],
  "summary": {
    "critical": 2,
    "high": 1,
    "total": 3
  }
}
```

### Step 4: Present results

**If no issues:**
```
✅ Privacy Scan Complete

Analyzed X files - no privacy issues detected!
```

**If issues found:**
```
🔒 Privacy Scan Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found X issues:

🔴 CRITICAL: 2 issues

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 src/transfer.ts

1. 🔴 CRITICAL: Fee Payer Reused in Loop
   Line 45

   Current code:
   [Show code snippet from result]

   ⚠️  Privacy Impact:
   All transfers will be linkable on-chain

   ✅ Fix:
   Move fee payer generation inside the loop

   Type 'fix 1' to apply automatically

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commands:
• 'fix all' - Apply all fixes
• 'fix 1' - Fix specific issue
```

### Step 5: Apply fixes when requested

When user types `fix N`:

1. Read the file with the issue
2. Apply the suggested fix using Edit tool
3. Re-run scan to verify
4. Report success

## Fix Patterns

### Fee Payer Reuse

Move declaration inside loop:
```typescript
// Before
const feePayer = Keypair.generate();
for (...) {
  await send(tx, [wallet, feePayer]);
}

// After
for (...) {
  const feePayer = Keypair.generate();
  await send(tx, [wallet, feePayer]);
}
```

### PII in Memos

Replace with generic text:
```typescript
// Before
createMemoInstruction("Payment to user@example.com")

// After  
createMemoInstruction("Payment")
```

## Important

- Always re-run scan after fixing
- Explain WHY issues matter
- Be clear about privacy impact
- Only edit with user confirmation
