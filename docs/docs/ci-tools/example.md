---
sidebar_position: 4
---

# Example Repository

A complete, working example of privacy leak detection in CI/CD.

## Repository

**[github.com/taylorferran/solana-privacy-scanner-example](https://github.com/taylorferran/solana-privacy-scanner-example)**

Clone and run:
```bash
git clone https://github.com/taylorferran/solana-privacy-scanner-example
cd solana-privacy-scanner-example
npm install
npm test
```

## The Demo

### PR #1: Privacy Leak Introduced

**[View PR](https://github.com/taylorferran/solana-privacy-scanner-example/pull/1)**

**Branch:** `feat/batch-transfers`

**What it does:**
- Adds batch transfer functionality
- Uses shared fee payer for "cost optimization"
- Introduces critical privacy vulnerability

**The leak:**
```typescript
const SHARED_FEE_PAYER = Keypair.generate();

export async function executeBatchTransfers(transfers) {
  for (const transfer of transfers) {
    await executePrivateTransfer({
      feePayer: SHARED_FEE_PAYER, // ❌ Same for all transfers
      ...transfer
    });
  }
}
```

**CI Result:** ❌ **FAILS**

```
✓ tests/privacy.test.ts > batch transfers use shared fee payer efficiently
✓ tests/privacy.test.ts > shared fee payer is consistent
✗ tests/privacy.test.ts > detects fee payer reuse in batch transfers

AssertionError: expected 1 to be greater than 1

Expected: uniqueFeePayers.size > 1
Received: 1
```

**Why it matters:**
All transactions are linkable through the shared fee payer, defeating privacy guarantees.

---

### PR #2: Privacy Leak Fixed

**[View PR](https://github.com/taylorferran/solana-privacy-scanner-example/pull/2)**

**Branch:** `fix/privacy-leak`

**What it does:**
- Removes shared fee payer
- Generates unique fee payer per transfer
- Restores privacy guarantees

**The fix:**
```typescript
export async function executeBatchTransfers(transfers) {
  for (const transfer of transfers) {
    await executePrivateTransfer({
      feePayer: generateFeePayer(), // ✅ Unique each time
      ...transfer
    });
  }
}
```

**CI Result:** ✅ **PASSES**

```
✓ tests/privacy.test.ts > batch transfers use unique fee payers
✓ tests/privacy.test.ts > detects unique fee payers in batch transfers
✓ tests/privacy.test.ts > each generateFeePayer call returns unique keypair
✓ tests/privacy.test.ts > transfer config is valid

Test Files  1 passed (1)
     Tests  4 passed (4)
```

**Impact:**
Each transaction is isolated with its own fee payer, maintaining privacy.

---

### PR #3: Static Analysis Detection (Coming Soon)

**Branch:** `feat/memo-pii` (planned)

**What it will show:**
- Code that hardcodes PII in transaction memos
- Static analyzer catches it before runtime
- Demonstrates AST-level detection

**The violation:**
```typescript
const memo = `Transfer for user ${email}@${domain}`; // ❌ Email in memo
await sendTransaction({ memo });
```

**CI Result:** ❌ **FAILS** (static analysis)

---

### PR #4: Static Analysis Fix (Coming Soon)

**Branch:** `fix/memo-pii` (planned)

**What it will show:**
- Removing PII from memos
- Static analyzer passes
- Safe memo patterns

**The fix:**
```typescript
const memo = `Transfer-${generateId()}`; // ✅ No PII
await sendTransaction({ memo });
```

**CI Result:** ✅ **PASSES**

---

## Key Files

### GitHub Actions Workflow

`.github/workflows/privacy-check.yml`:

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
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
```

Simple, effective, catches leaks automatically.

### Privacy Tests

`tests/privacy.test.ts`:

```typescript
test('detects fee payer reuse in batch transfers', () => {
  const feePayer1 = generateFeePayer();
  const feePayer2 = generateFeePayer();
  const feePayer3 = generateFeePayer();
  
  const uniqueFeePayers = new Set([
    feePayer1.publicKey.toBase58(),
    feePayer2.publicKey.toBase58(),
    feePayer3.publicKey.toBase58()
  ]);
  
  // Expect unique fee payers for privacy
  expect(uniqueFeePayers.size).toBeGreaterThan(1);
});
```

Fails on PR #1 (shared fee payer), passes on PR #2 (unique fee payers).

### Configuration

`.privacyrc`:

```json
{
  "maxRiskLevel": "MEDIUM",
  "enforceInCI": true,
  "blockOnFailure": true,
  "thresholds": {
    "maxHighSeverity": 0,
    "maxMediumSeverity": 3
  }
}
```

Defines project privacy standards.

---

## The Privacy Vulnerability

### Fee Payer Reuse

**Severity:** CRITICAL

**Description:**
Using the same fee payer across multiple transactions creates a linkability graph. An observer can identify all transactions paid for by the same address, revealing user behavior patterns.

**On Solana:**
- Fee payers are visible in transaction metadata
- Can be queried via `getSignaturesForAddress`
- Links otherwise unrelated transactions

**Detection:**
The privacy scanner detects when the same fee payer is used across multiple transactions, flagging it as a critical violation.

### Real-World Impact

**Without privacy scanner:**
1. Developer adds "optimization"
2. Code gets merged
3. Privacy leak goes unnoticed
4. User transactions become linkable
5. Privacy protocol is compromised

**With privacy scanner:**
1. Developer adds "optimization"
2. Opens PR
3. CI runs privacy tests
4. Tests fail, CI blocks merge
5. Developer sees exact issue
6. Fix implemented before merge
7. Privacy preserved

---

## How to Use This Example

### 1. Study the Code

Clone the repo and explore:
- `src/transfer.ts` - Implementation
- `tests/privacy.test.ts` - Privacy tests
- `.github/workflows/` - CI configuration

### 2. Compare PRs

Look at both pull requests:
- Read commit messages
- See test failures/successes
- Understand the trade-offs

### 3. Adapt to Your Project

Use as a template:
- Copy workflow configuration
- Adapt tests to your use case
- Customize privacy policies

### 4. Run Locally

```bash
git clone https://github.com/taylorferran/solana-privacy-scanner-example
cd solana-privacy-scanner-example
npm install

# Run tests
npm test

# Try the bad implementation
git checkout feat/batch-transfers
npm test  # Fails

# Try the good implementation
git checkout fix/privacy-leak
npm test  # Passes
```

---

## Lessons Learned

### 1. Cost vs Privacy Trade-off

**Cheaper:** Shared fee payer (1 funded account)  
**More Private:** Unique fee payers (N funded accounts)

The example shows this trade-off explicitly - the "cost optimization" breaks privacy.

### 2. Automated Detection Works

Tests catch the issue immediately, before code review, before merge. No manual inspection needed.

### 3. Clear Feedback

When tests fail, developers know:
- What leaked
- Why it's a problem
- How to fix it

### 4. Integration is Simple

Three files: workflow, tests, config. Copy, adapt, done.

---

## Extending the Example

### Add More Heuristics

Test for other privacy leaks:
- Timing patterns
- Amount reuse
- Known entity interactions

### Add Policy Enforcement

Fail CI on specific violations:
```typescript
test('no high severity violations', async () => {
  const report = await scanWallet(address);
  const highSeverity = report.signals.filter(s => s.severity === 'HIGH');
  expect(highSeverity).toHaveLength(0);
});
```

### Add Custom Checks

Protocol-specific privacy rules:
```typescript
test('privacy pool exits are not to exchanges', async () => {
  const exit = await buildPoolExit(amount);
  expect(exit.destination).not.toBeKnownExchange();
});
```

---

## Questions?

- **How do I adapt this?** Clone, modify tests for your patterns, update workflow
- **What about false positives?** Adjust `.privacyrc` thresholds for your needs
- **Can I test devnet transactions?** Yes, use real signatures in tests
- **Does this work with Anchor?** Yes, test your program instructions

---

## Next Steps

- **[Testing Guide](./testing)** - Write more privacy tests
- **[GitHub Actions](./github-actions)** - Advanced CI configuration
- **[Overview](./overview)** - All CI/CD features
