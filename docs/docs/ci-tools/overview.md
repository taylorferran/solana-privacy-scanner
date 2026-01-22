# CI/CD Overview

## Install

```bash
npm install --save-dev solana-privacy-scanner-ci-tools
npx privacy-scanner-init
```

## Features

- **Transaction simulator** - Test privacy before deployment
- **Vitest/Jest matchers** - Assert privacy in tests
- **GitHub Actions** - Automated PR checks
- **Pre-commit hooks** - Catch leaks early

## Quick Example

```typescript
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';
import 'solana-privacy-scanner-ci-tools/matchers';

test('transfer maintains privacy', async () => {
  const tx = await createTransfer(user, recipient, amount);
  const report = await simulateTransactionPrivacy(tx, connection);
  
  expect(report).toHavePrivacyRisk('LOW');
  expect(report).toNotLeakUserRelationships();
});
```

[See full example →](./example)
