# CI/CD Tools

Test privacy in your development workflow.

## Live Example

See it in action: **[solana-privacy-scanner-example](https://github.com/taylorferran/solana-privacy-scanner-example)**

This repository demonstrates:
- **[PR #1](https://github.com/taylorferran/solana-privacy-scanner-example/pull/1)** - Privacy leak detected (CI fails ❌)
- **[PR #2](https://github.com/taylorferran/solana-privacy-scanner-example/pull/2)** - Privacy leak fixed (CI passes ✅)

See the exact workflow, tests, and how privacy violations are caught automatically.

## Installation

```bash
npm install --save-dev solana-privacy-scanner-ci-tools
```

## Quick Setup

```bash
npx privacy-scanner-init
```

Interactive wizard creates:
- `.privacyrc` configuration
- GitHub Actions workflow (optional)
- Pre-commit hooks (optional)
- Test setup (optional)

## Features

### Transaction Simulator

Test privacy before sending to chain:

```typescript
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';

const tx = await buildTransaction();
const report = await simulateTransactionPrivacy(tx, connection);

if (report.overallRisk === 'HIGH') {
  throw new Error('Privacy policy violated');
}
```

### Testing Matchers

Privacy assertions in tests:

```typescript
import 'solana-privacy-scanner-ci-tools/matchers';

test('transfer maintains privacy', async () => {
  const report = await simulateTransactionPrivacy(tx, connection);
  
  expect(report).toHavePrivacyRisk('LOW');
  expect(report).toNotLeakUserRelationships();
});
```

### Configuration

`.privacyrc` for project policies:

```json
{
  "maxRiskLevel": "MEDIUM",
  "enforceInCI": true,
  "thresholds": {
    "maxHighSeverity": 0
  }
}
```

### GitHub Actions

Auto-generated workflow:

```yaml
name: Privacy Check
on: [pull_request]
jobs:
  privacy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
```

## Examples

### DeFi Protocol

```typescript
test('lending maintains privacy', async () => {
  const borrowTx = await protocol.borrow(amount);
  const report = await simulateTransactionPrivacy(borrowTx, connection);
  
  expect(report).toHaveNoHighRiskSignals();
  expect(report).toNotInteractWith('exchange');
});
```

### Flow Analysis

```typescript
const flow = [depositTx, swapTx, withdrawTx];
const flowReport = await simulateTransactionFlow(flow, connection);

expect(flowReport.cumulativeRisk).not.toBe('HIGH');
```

### Implementation Comparison

```typescript
const comparison = await compareImplementations(
  directTransfer,
  routedTransfer,
  connection
);

console.log(`Winner: ${comparison.winner}`);
```

## Next Steps

- **[Testing Guide](./testing)** - Write privacy tests
- **[GitHub Actions](./github-actions)** - CI/CD setup
- **[For LLMs](./for-llms)** - AI assistant guide
