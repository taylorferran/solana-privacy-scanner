# Solana Privacy Scanner Devtools Example

Complete demonstration of `solana-privacy-devtools` for static code analysis, runtime testing, and CI/CD integration.

## What This Shows

This example repository demonstrates:

1. **Static Code Analysis** - Detecting privacy anti-patterns in source code before runtime
2. **Runtime Testing** - Using test matchers to assert privacy properties
3. **Transaction Simulation** - Testing transactions before sending to chain
4. **CI/CD Integration** - Automated privacy checks in GitHub Actions

## The Demos

### PR #1: Privacy Issues Detected ❌

**Branch:** `feat/bad-privacy`

Demonstrates code with multiple privacy violations:
- Fee payer reuse in loops (CRITICAL)
- PII in transaction memos (HIGH)
- Descriptive memos that leak information (MEDIUM)

Both **static analyzer** and **runtime tests** catch the issues.

### PR #2: Privacy Fixed ✅

**Branch:** `fix/privacy`

Shows privacy-preserving patterns:
- Unique fee payer per transaction
- No PII in memos
- Opaque reference IDs instead of descriptive text

Both **static analyzer** and **runtime tests** pass.

## Project Structure

```
solana-privacy-scanner-devtools-example/
├── src/
│   ├── transfer.ts              # Main transfer implementation
│   └── utils.ts                 # Helper functions
├── tests/
│   ├── setup.ts                 # Test setup (imports matchers)
│   ├── privacy.test.ts          # Privacy tests with matchers
│   └── analyzer.test.ts         # Static analyzer integration tests
├── .github/
│   └── workflows/
│       └── privacy-check.yml    # CI/CD workflow
├── .privacyrc                   # Privacy policy configuration
├── package.json
└── README.md
```

## Getting Started

### Install

```bash
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

### Run Static Analyzer

```bash
# Analyze all source files
npm run analyze

# Fail on any issues (for CI)
npm run analyze:fail
```

## Key Files

### Static Analysis

The analyzer detects privacy anti-patterns by parsing your code:

```bash
npm run analyze
```

Output:
```
Scanning 2 files...

❌ src/transfer.ts:15:12
   Fee Payer Reuse in Loop (CRITICAL)
   Using the same fee payer across multiple transactions in a loop

⚠️  src/transfer.ts:28:8
   PII in Memo Field (HIGH)
   Detected potential email address in memo field

Found 2 issues (1 critical, 1 high)
```

### Privacy Tests

Tests use custom matchers from `solana-privacy-devtools`:

```typescript
import { simulateTransactionPrivacy } from 'solana-privacy-devtools/simulator';
import 'solana-privacy-devtools/matchers';

test('transfer maintains privacy', async () => {
  const tx = await buildTransfer();
  const report = await simulateTransactionPrivacy(tx, connection);

  expect(report).toHavePrivacyRisk('LOW');
  expect(report).toNotLeakUserRelationships();
  expect(report).toNotHaveSignal('fee-payer-reuse');
});
```

### CI/CD Workflow

`.github/workflows/privacy-check.yml` runs on every PR:

```yaml
name: Privacy Check

on:
  pull_request:
    branches: [main]

jobs:
  privacy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - name: Static Analysis
        run: npm run analyze:fail
      - name: Privacy Tests
        run: npm test
```

## Privacy Policy

`.privacyrc` defines project standards:

```json
{
  "maxRiskLevel": "MEDIUM",
  "enforceInCI": true,
  "blockOnFailure": true,
  "thresholds": {
    "maxHighSeverity": 0,
    "maxMediumSeverity": 2,
    "minPrivacyScore": 70
  }
}
```

## The Privacy Vulnerabilities

### 1. Fee Payer Reuse (CRITICAL)

**Bad:**
```typescript
const feePayer = Keypair.generate();
for (let i = 0; i < recipients.length; i++) {
  await sendTransaction({ feePayer }); // Same fee payer!
}
```

**Good:**
```typescript
for (const recipient of recipients) {
  const feePayer = Keypair.generate(); // Unique fee payer
  await sendTransaction({ feePayer });
}
```

### 2. PII in Memos (HIGH)

**Bad:**
```typescript
const memo = `Payment to ${email}`; // Email leaked on-chain!
```

**Good:**
```typescript
const memo = `ref:${crypto.randomUUID()}`; // Opaque reference
```

### 3. Descriptive Memos (MEDIUM)

**Bad:**
```typescript
const memo = 'Rent payment for apartment 5B'; // Too descriptive
```

**Good:**
```typescript
const memo = 'Payment'; // Generic
```

## Running the Demo

### Try the Bad Code

```bash
git checkout feat/bad-privacy
npm install
npm test              # Tests fail
npm run analyze       # Analyzer finds issues
```

### Try the Fixed Code

```bash
git checkout fix/privacy
npm install
npm test              # Tests pass
npm run analyze       # No issues found
```

## Learn More

- **Documentation:** https://sps.guide
- **Devtools Guide:** https://sps.guide/ci-tools/overview
- **Testing Guide:** https://sps.guide/ci-tools/testing
- **GitHub Actions:** https://sps.guide/ci-tools/github-actions
- **Main Package:** https://github.com/taylorferran/solana-privacy-scanner

## Questions?

- **How do I adapt this?** Fork, modify for your patterns, customize tests
- **What if I get false positives?** Adjust `.privacyrc` thresholds
- **Can I add custom checks?** Yes, write additional test assertions
- **Does this work with Anchor?** Yes, test your program instructions

## License

MIT
