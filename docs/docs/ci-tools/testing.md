# Privacy Testing

Write tests that verify privacy requirements.

## Setup

```bash
npm install --save-dev solana-privacy-scanner-ci-tools
```

Create `tests/setup.ts`:

```typescript
import 'solana-privacy-scanner-ci-tools/matchers';
```

Add to `vitest.config.ts`:

```typescript
export default {
  setupFilesAfterEnv: ['./tests/setup.ts'],
};
```

## Matchers

| Matcher | Description |
|---------|-------------|
| `toHavePrivacyRisk(level)` | Assert risk level |
| `toNotLeakUserRelationships()` | No linkage |
| `toHaveNoHighRiskSignals()` | No HIGH signals |
| `toNotHaveSignal(type)` | Signal not present |
| `toHavePrivacyScore(min)` | Min score (0-100) |

## Examples

### Basic Test

```typescript
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';

test('transfer maintains privacy', async () => {
  const tx = await buildTransaction();
  const report = await simulateTransactionPrivacy(tx, connection);
  
  expect(report).toHavePrivacyRisk('LOW');
  expect(report).toNotLeakUserRelationships();
});
```

### DeFi Protocol

```typescript
test('deposit maintains privacy', async () => {
  const tx = await program.methods.deposit(amount).transaction();
  const report = await simulateTransactionPrivacy(tx, connection);
  
  expect(report).toHavePrivacyRisk('LOW');
  expect(report).toNotHaveSignal('fee-payer-reuse');
});
```

### Flow Analysis

```typescript
test('user journey maintains privacy', async () => {
  const flow = [loginTx, actionTx, logoutTx];
  const flowReport = await simulateTransactionFlow(flow, connection);
  
  expect(flowReport.cumulativeRisk).not.toBe('HIGH');
});
```

### NFT Marketplace

```typescript
test('purchase is private', async () => {
  const tx = await marketplace.buy(nftMint);
  const report = await simulateTransactionPrivacy(tx, connection);
  
  expect(report).toHavePrivacyScore(70);
  expect(report).toNotInteractWith('exchange');
});
```

## Config-Based Testing

```typescript
import { loadConfig } from 'solana-privacy-scanner-ci-tools/config';

const config = loadConfig();

test('meets privacy standards', async () => {
  const report = await simulateTransactionPrivacy(tx, connection);
  const highSignals = report.signals.filter(s => s.severity === 'HIGH').length;
  
  expect(highSignals).toBeLessThanOrEqual(config.thresholds.maxHighSeverity);
});
```

## Simulator Functions

```typescript
// Single transaction
const report = await simulateTransactionPrivacy(tx, connection);

// Transaction flow
const flowReport = await simulateTransactionFlow(txArray, connection);

// Compare implementations
const comparison = await compareImplementations(txA, txB, connection);
```

## Next Steps

- **[GitHub Actions](./github-actions)** - Automate in CI
- **[Overview](./overview)** - All features
- **[For LLMs](./for-llms)** - Get AI help
