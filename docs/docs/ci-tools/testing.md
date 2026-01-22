# Testing

## Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
  },
});
```

```typescript
// tests/setup.ts
import { setupPrivacyMatchers } from 'solana-privacy-scanner-ci-tools/matchers';
setupPrivacyMatchers();
```

## Matchers

```typescript
// Risk level
expect(report).toHavePrivacyRisk('LOW' | 'MEDIUM' | 'HIGH')

// No high-risk signals
expect(report).toHaveNoHighRiskSignals()

// Specific signal
expect(report).toNotHaveSignal('fee-payer-reuse')

// Relationships
expect(report).toNotLeakUserRelationships()

// Score
expect(report).toHavePrivacyScore(85)
```

## Example

```typescript
test('batch transfers use unique fee payers', async () => {
  const transactions = await createBatchTransfer(users, recipients);
  const reports = await Promise.all(
    transactions.map(tx => simulateTransactionPrivacy(tx, connection))
  );
  
  reports.forEach(report => {
    expect(report).toHaveNoHighRiskSignals();
  });
});
```
