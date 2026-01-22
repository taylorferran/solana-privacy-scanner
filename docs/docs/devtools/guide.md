---
sidebar_position: 1
---

# Devtools Guide

Solana Privacy Devtools provides a complete toolkit for catching privacy leaks throughout your development workflow. Static analysis, transaction simulation, test matchers, and CI/CD integration.

## What It Does

**Static Code Analysis** - Detect privacy anti-patterns in TypeScript/JavaScript source code before deployment

**Transaction Simulation** - Test privacy impact before sending transactions to the network

**Test Matchers** - Privacy-specific assertions for Vitest/Jest test suites

**CI/CD Integration** - Automated privacy checks in GitHub Actions and pre-commit hooks

## Installation

```bash
npm install --save-dev solana-privacy-devtools
```

Run the interactive setup wizard:

```bash
npx privacy-scanner-init
```

This guides you through creating `.privacyrc` configuration, setting up GitHub Actions, installing pre-commit hooks, and configuring test matchers.

## Static Code Analysis

Scan your codebase for privacy vulnerabilities using AST parsing.

### Basic Usage

```bash
# Scan all source files
npx solana-privacy-devtools scan 'src/**/*.ts'

# Output as JSON for CI/CD
npx solana-privacy-devtools scan src/ --json

# Exclude low severity issues
npx solana-privacy-devtools scan src/ --no-low
```

### What It Detects

#### Fee Payer Reuse (CRITICAL)

The most severe privacy leak on Solana. Detects when a fee payer is declared outside a loop and reused across multiple transactions.

**Bad Pattern:**

```typescript
// CRITICAL: Fee payer declared outside loop
const SHARED_FEE_PAYER = Keypair.generate();

for (const recipient of recipients) {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: recipient,
      lamports: amount,
    })
  );

  // Fee payer reused - ALL TRANSACTIONS ARE LINKABLE
  await sendAndConfirmTransaction(connection, tx, [wallet, SHARED_FEE_PAYER]);
}
```

**Good Pattern:**

```typescript
// GOOD: Fee payer generated inside loop
for (const recipient of recipients) {
  const feePayer = Keypair.generate();  // New fee payer each iteration

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: recipient,
      lamports: amount,
    })
  );

  await sendAndConfirmTransaction(connection, tx, [wallet, feePayer]);
}
```

When the same fee payer is reused across transactions, all those transactions become linkable on-chain. Anyone can query the blockchain for all transactions signed by that fee payer, revealing all recipients, amounts, timing, and relationships.

#### PII in Memos (CRITICAL/HIGH/MEDIUM)

Detects personally identifiable information in transaction memos. Memos are permanently stored on-chain and fully public.

**Severity Levels:**

- **CRITICAL** - Email addresses, phone numbers, SSN patterns, credit card numbers
- **HIGH** - Personal names, URLs with sensitive parameters, addresses
- **MEDIUM** - Descriptive content that may reveal identity

**Bad Examples:**

```typescript
// CRITICAL: Email in memo
const memo = createMemoInstruction("Payment to alice@example.com");

// HIGH: Personal name in memo
const memo = createMemoInstruction("Payment for John Smith");

// MEDIUM: Descriptive content
const memo = createMemoInstruction("Rent payment for apartment 4B");
```

**Good Examples:**

```typescript
// GOOD: Generic, non-identifying memo
const memo = createMemoInstruction("Payment");

// GOOD: Opaque reference ID
const memo = createMemoInstruction("REF:8a7b3d2e");

// BEST: No memo at all
// Just omit the memo instruction entirely
```

### Example Output

```
🔒 Running Solana Privacy Analyzer...

📊 Scan Summary
Files analyzed: 5
Total issues: 2

  🔴 CRITICAL: 1
  🔵 MEDIUM: 1

📋 Detailed Issues

📁 src/transfer.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer 'SHARED_FEE_PAYER' declared outside loop
   Line 26:6
   Suggestion: Move fee payer generation inside the loop
```

## Transaction Simulation

Test privacy impact before sending transactions to the network. No mainnet fees, no permanent on-chain data.

### Single Transaction Analysis

```typescript
import { simulateTransactionPrivacy } from 'solana-privacy-devtools/simulator';
import { Connection, Transaction } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const tx = new Transaction().add(/* your instruction */);

// Simulate privacy impact (doesn't send transaction)
const report = await simulateTransactionPrivacy(tx, connection);

console.log(`Risk Level: ${report.overallRisk}`);
console.log(`Signals: ${report.signals.length}`);

if (report.overallRisk === 'HIGH') {
  console.warn('High privacy risks detected!');
  // Don't send the transaction
}
```

### Transaction Flow Analysis

Test multi-transaction user flows:

```typescript
import { simulateTransactionFlow } from 'solana-privacy-devtools/simulator';

const flow = [
  { tx: swapTx, description: 'Token swap' },
  { tx: transferTx, description: 'Send to recipient' },
  { tx: stakeTx, description: 'Stake remaining' }
];

const flowReport = await simulateTransactionFlow(flow, connection);

console.log(`Overall Flow Risk: ${flowReport.overallRisk}`);
console.log(`Emergent Patterns: ${flowReport.emergentPatterns.length}`);
```

### Implementation Comparison

A/B test different implementations:

```typescript
import { compareImplementations } from 'solana-privacy-devtools/simulator';

const implementations = [
  { name: 'Shared fee payer', txs: [tx1, tx2, tx3] },
  { name: 'Unique fee payers', txs: [tx4, tx5, tx6] }
];

const comparison = await compareImplementations(implementations, connection);

console.log(`Best option: ${comparison.bestOption}`);
console.log(`Reasoning: ${comparison.reasoning}`);
```

## Test Matchers

Add privacy-specific assertions to your test suite.

### Setup

```typescript
import { expect } from 'vitest';
import 'solana-privacy-devtools/matchers';
```

### Available Matchers

```typescript
describe('Token Transfer', () => {
  it('should maintain user privacy', async () => {
    const tx = await createTransfer(user, recipient, amount);
    const report = await simulateTransactionPrivacy(tx, connection);

    // Assert specific risk level
    expect(report).toHavePrivacyRisk('LOW');

    // Assert no relationship linkage
    expect(report).toNotLeakUserRelationships();

    // Assert no HIGH severity signals
    expect(report).toHaveNoHighRiskSignals();

    // Assert maximum signal count
    expect(report).toHaveAtMostSignals(2);

    // Assert specific signal absence
    expect(report).toNotHaveSignal('fee-payer-reuse');

    // Assert fee payer uniqueness
    expect(report).toUseFeePayerOnlyOnce();

    // Assert no memo leaks
    expect(report).toNotLeakDataInMemos();

    // Assert no counterparty clustering
    expect(report).toNotClusterCounterparties();

    // Assert signal count by severity
    expect(report).toHaveAtMostSignalsOfSeverity('HIGH', 0);
  });
});
```

## CI/CD Integration

### GitHub Actions

Automated privacy checks on every pull request:

```yaml
name: Privacy Check

on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm ci

      - name: Run Privacy Analyzer
        run: npx solana-privacy-devtools scan 'src/**/*.ts'
```

The analyzer exits with code `1` if critical or high severity issues are found, automatically failing the CI check.

### NPM Scripts

```json
{
  "scripts": {
    "privacy:check": "solana-privacy-devtools scan 'src/**/*.ts'",
    "privacy:ci": "solana-privacy-devtools scan 'src/**/*.ts' --json --no-low",
    "prepush": "npm run privacy:check"
  }
}
```

### Pre-commit Hooks

Catch issues before they're committed:

```bash
# Setup via interactive wizard
npx privacy-scanner-init

# Or manually add to package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run privacy:check"
    }
  }
}
```

## Configuration

Create a `.privacyrc` file in your project root:

```json
{
  "maxRiskLevel": "MEDIUM",
  "thresholds": {
    "maxHighSeverity": 0,
    "maxMediumSeverity": 5
  },
  "excludePatterns": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "test/**",
    "scripts/**"
  ]
}
```

### Configuration Options

- `maxRiskLevel` - Maximum acceptable risk level (`"LOW"` | `"MEDIUM"` | `"HIGH"`)
- `thresholds.maxHighSeverity` - Maximum number of HIGH severity issues allowed
- `thresholds.maxMediumSeverity` - Maximum number of MEDIUM severity issues allowed
- `excludePatterns` - Glob patterns for files to exclude from scanning

### Built-in Presets

```typescript
import {
  STRICT_CONFIG,
  PERMISSIVE_CONFIG,
  loadConfig
} from 'solana-privacy-devtools/config';

// Use strict preset (no HIGH issues allowed)
const config = STRICT_CONFIG;

// Use permissive preset (allows some issues)
const config = PERMISSIVE_CONFIG;

// Load from .privacyrc
const config = await loadConfig();
```

## CLI Reference

### `scan` Command

```bash
solana-privacy-devtools scan [options] <paths...>

Options:
  --json        Output results as JSON
  --no-low      Exclude low severity issues
  --quiet       Only show summary, no detailed issues
  -h, --help    Display help information
  -V, --version Display version number
```

### `init` Command

```bash
npx privacy-scanner-init

# Interactive setup wizard for:
# - .privacyrc configuration
# - GitHub Actions
# - Pre-commit hooks
# - Test matcher setup
```

## Package Exports

```typescript
// Main exports (all features)
import { /* ... */ } from 'solana-privacy-devtools';

// Analyzer (static analysis)
import { analyze } from 'solana-privacy-devtools/analyzer';

// Simulator (transaction testing)
import {
  simulateTransactionPrivacy,
  simulateTransactionFlow,
  compareImplementations
} from 'solana-privacy-devtools/simulator';

// Matchers (test assertions)
import 'solana-privacy-devtools/matchers';

// Config (policy management)
import {
  loadConfig,
  STRICT_CONFIG,
  PERMISSIVE_CONFIG
} from 'solana-privacy-devtools/config';
```

## Development Workflow

Integrate privacy checks throughout your workflow:

1. **Pre-commit** - Scan code with hooks before commit
2. **Local Development** - Run analyzer on-demand during coding
3. **Testing** - Use matchers for privacy regression tests
4. **Simulation** - Test transactions before deployment
5. **CI/CD** - Automated checks on pull requests

### Privacy-First Development Example

```typescript
// 1. Write code with simulator feedback
async function developTransfer() {
  const tx = buildTransferTx();

  // Test privacy before deploying
  const report = await simulateTransactionPrivacy(tx, connection);

  if (report.overallRisk !== 'LOW') {
    console.warn('Privacy issues detected, refactoring...');
    // Refactor and try again
  }
}

// 2. Add tests with matchers
test('transfer maintains privacy', async () => {
  const report = await simulateTransactionPrivacy(tx, connection);
  expect(report).toHavePrivacyRisk('LOW');
});

// 3. Run analyzer in CI
// Automated scanning on every PR
```

## Performance

The static analyzer is designed for speed:

| Project Size | Files | Analysis Time |
|--------------|-------|---------------|
| Small | ~10 files | < 1s |
| Medium | ~50 files | 2-3s |
| Large | ~200 files | 5-8s |
| Very Large | ~500+ files | 10-15s |

## Limitations

### Current Detection Scope

- ✅ Fee payer reuse in loops
- ✅ PII in memos

### Planned Future Detections

- 🔄 Signer overlap patterns
- 🔄 Address reuse
- 🔄 Timing pattern anti-patterns
- 🔄 Insecure randomness

### Known Limitations

1. **Dynamic analysis** - Cannot detect runtime-only issues
2. **Imported patterns** - Limited detection across module boundaries
3. **Complex control flow** - May miss deeply nested patterns

For runtime analysis, use the Transaction Simulator.

## Links

- [npm Package](https://www.npmjs.com/package/solana-privacy-devtools)
- [GitHub Repository](https://github.com/taylorferran/solana-privacy-scanner)
- [Core Scanner](../library/usage)
- [CLI Tool](../cli/guide)
