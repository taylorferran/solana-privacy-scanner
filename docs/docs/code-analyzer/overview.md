---
sidebar_position: 1
---

# Code Analyzer Overview

The Solana Privacy Analyzer is a **static code analysis tool** that detects privacy vulnerabilities in your Solana TypeScript/JavaScript code **before deployment**.

Unlike the main scanner which analyzes on-chain data, the code analyzer examines your source code to catch privacy leaks during development.

## What It Does

🔍 **Static Analysis** - Analyzes code patterns using AST parsing
⚡ **Fast** - Scans typical projects in under 5 seconds
🎯 **Deterministic** - 100% reliable detection for supported patterns
🔧 **CI/CD Ready** - Integrates into your development workflow
📊 **Clear Reports** - Detailed output with fix suggestions

## Installation

```bash
npm install --save-dev solana-privacy-analyzer
```

## Quick Start

```bash
# Scan your code
npx solana-privacy-analyzer scan src/

# Output as JSON for CI/CD
npx solana-privacy-analyzer scan src/ --json

# Exclude low severity issues
npx solana-privacy-analyzer scan src/ --no-low
```

## What It Detects

### 1. Fee Payer Reuse (CRITICAL)

Detects when a fee payer is declared outside a loop and reused across multiple transactions.

**Bad:**
```typescript
const feePayer = Keypair.generate();  // Outside loop
for (const recipient of recipients) {
  await sendTransaction(tx, [wallet, feePayer]);  // REUSED
}
```

**Good:**
```typescript
for (const recipient of recipients) {
  const feePayer = Keypair.generate();  // Inside loop
  await sendTransaction(tx, [wallet, feePayer]);
}
```

**Impact:** All transactions become linkable on-chain, completely compromising privacy.

### 2. PII in Memos (CRITICAL/HIGH/MEDIUM)

Detects personally identifiable information in transaction memos:

- **CRITICAL**: Emails, phone numbers, SSNs, credit cards
- **HIGH**: Personal names, URLs with sensitive parameters
- **MEDIUM**: Descriptive content that may reveal identity

**Bad:**
```typescript
createMemoInstruction("Payment to john@example.com")
createMemoInstruction("User: John Smith")
createMemoInstruction("Contact: +1-555-123-4567")
```

**Good:**
```typescript
createMemoInstruction("Payment")  // Generic
// Or omit memo entirely
```

**Impact:** Personal information permanently exposed on-chain and searchable forever.

## Output Format

### Human-Readable (Default)

```
🔒 Running Solana Privacy Analyzer...

📊 Scan Summary
Files analyzed: 5
Total issues: 3

  🔴 CRITICAL: 2
  🔵 MEDIUM: 1

📋 Detailed Issues

📁 src/transfer.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer 'feePayer' declared outside loop
   Line 45:8
   Suggestion: Move fee payer generation inside the loop

   Code:
      43 |
      44 |   // Declared outside
   >  45 |   const feePayer = Keypair.generate();
      46 |
      47 |   for (let i = 0; i < recipients.length; i++) {
```

### JSON (for CI/CD)

```json
{
  "issues": [
    {
      "type": "fee-payer-reuse",
      "severity": "CRITICAL",
      "file": "src/transfer.ts",
      "line": 45,
      "column": 8,
      "message": "Fee payer 'feePayer' declared outside loop but reused inside",
      "suggestion": "Move fee payer generation inside the loop",
      "identifier": "feePayer",
      "occurrences": 5
    }
  ],
  "summary": {
    "critical": 2,
    "high": 0,
    "medium": 1,
    "low": 0,
    "total": 3
  },
  "filesAnalyzed": 5,
  "timestamp": 1234567890
}
```

## Use Cases

### Pre-Commit Checks

Catch issues before they're committed:

```bash
#!/bin/bash
# .git/hooks/pre-commit
npx solana-privacy-analyzer scan --staged --no-low
```

### CI/CD Integration

Block merges with privacy issues:

```yaml
# .github/workflows/privacy-check.yml
- name: Privacy Scan
  run: |
    npx solana-privacy-analyzer scan src/ --json > report.json
    CRITICAL=$(jq '.summary.critical' report.json)
    if [ "$CRITICAL" -gt 0 ]; then
      echo "❌ Critical privacy issues found"
      exit 1
    fi
```

### Local Development

Check your code anytime:

```bash
npx solana-privacy-analyzer scan src/
```

## Exit Codes

- `0` - No critical or high severity issues found
- `1` - Critical/high issues found OR analysis failed

## Next Steps

- [Installation & Usage](./installation) - Detailed setup guide
- [CI/CD Integration](./ci-cd) - Set up automated checks
- [CLI Reference](./cli-reference) - All commands and options
- [Claude Code Plugin](../claude-plugin/overview) - AI-powered fixing
