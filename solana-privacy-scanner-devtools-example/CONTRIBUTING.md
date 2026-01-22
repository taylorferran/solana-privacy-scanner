# Contributing Guide

## Setting Up the Repository

### Quick Start

```bash
# Make setup script executable
chmod +x setup-repo.sh

# Run setup
./setup-repo.sh

# Install dependencies
npm install
```

This creates two branches:
- `main` - Privacy-preserving code (all checks pass ✓)
- `feat/bad-privacy` - Privacy violations (checks fail ✗)

### Manual Setup

If you prefer to set up manually:

```bash
# Initialize repo
git init
git add .
git commit -m "Initial commit: Privacy-preserving implementation"
git branch -M main

# Create bad privacy branch
git checkout -b feat/bad-privacy

# Edit src/transfer.ts to add privacy violations
# (See setup-repo.sh for example bad code)

git add src/transfer.ts
git commit -m "feat: Add batch transfer with shared fee payer"

git checkout main
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Static Analyzer

```bash
# Analyze and report issues
npm run analyze

# Analyze and fail on any issues (for CI)
npm run analyze:fail
```

### Test Both Branches

```bash
# Test good code (should pass)
git checkout main
npm test
npm run analyze

# Test bad code (should fail)
git checkout feat/bad-privacy
npm test              # Tests should fail
npm run analyze       # Analyzer should find issues
```

## Creating Pull Requests

### Push to GitHub

```bash
# Add your GitHub repo as remote
git remote add origin https://github.com/YOUR-USERNAME/solana-privacy-scanner-devtools-example.git

# Push both branches
git push -u origin main
git push origin feat/bad-privacy
```

### Create PRs

**PR #1: Privacy Violations** (Should fail CI ✗)
- Base: `main`
- Compare: `feat/bad-privacy`
- Title: "Add batch transfer with shared fee payer"
- The CI workflow will fail, demonstrating detection

**PR #2: Privacy Fixed** (Should pass CI ✓)
- Base: `feat/bad-privacy`
- Compare: `main`
- Title: "Fix privacy issues in batch transfers"
- The CI workflow will pass, showing the fix

## Understanding the Privacy Issues

### What the Bad Branch Contains

1. **Fee Payer Reuse (CRITICAL)**
   ```typescript
   const SHARED_FEE_PAYER = Keypair.generate(); // Used for all transactions
   ```

2. **PII in Memos (HIGH)**
   ```typescript
   const userEmail = `user${i}@example.com`;
   transaction.add(memo(`Payment to ${userEmail}`));
   ```

3. **Descriptive Memos (MEDIUM)**
   ```typescript
   const memo = `Transfer of ${amount} SOL for services in January 2024`;
   ```

### What the Main Branch Contains

1. **Unique Fee Payers**
   ```typescript
   const feePayer = Keypair.generate(); // New for each transaction
   ```

2. **Safe Memos**
   ```typescript
   const memo = generateSafeReference(); // Opaque UUID
   ```

3. **Privacy Utilities**
   ```typescript
   isMemoSafe(memo); // Validates no PII
   ```

## CI/CD Workflow

The GitHub Actions workflow (`.github/workflows/privacy-check.yml`) runs on every PR:

1. **Static Analysis**: `npm run analyze:fail`
   - Parses source code for privacy anti-patterns
   - Fails if any issues found

2. **Privacy Tests**: `npm test`
   - Runs Vitest tests with custom matchers
   - Tests transaction privacy properties

## Adding New Tests

### Add a Privacy Test

```typescript
// tests/privacy.test.ts

it('should maintain privacy in my feature', async () => {
  const tx = buildMyFeatureTransaction();
  const report = await simulateTransactionPrivacy(tx, connection);

  expect(report).toHavePrivacyRisk('LOW');
  expect(report).toNotHaveSignal('fee-payer-reuse');
});
```

### Add a Static Analysis Test

```typescript
// tests/analyzer.test.ts

it('should detect issues in specific file', async () => {
  const result = await analyzeCode(['src/my-feature.ts']);
  expect(result.issues.length).toBe(0);
});
```

## Questions?

- **How do I adapt this for my project?** Fork and modify the transaction types
- **Can I add more heuristics?** Yes, the analyzer is extensible
- **What if I get false positives?** Adjust `.privacyrc` thresholds
- **Does this work with Anchor?** Yes, test your program instructions

## Resources

- [Solana Privacy Scanner Docs](https://sps.guide)
- [Devtools Guide](https://sps.guide/ci-tools/overview)
- [Testing Guide](https://sps.guide/ci-tools/testing)
- [GitHub Actions Guide](https://sps.guide/ci-tools/github-actions)
