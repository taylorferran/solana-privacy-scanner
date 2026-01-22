# Developer Tools Overview

Comprehensive privacy toolkit for Solana development. Includes static code analysis, transaction simulation, test matchers, and CI/CD integration to catch privacy leaks throughout your development workflow.

## Install

```bash
npm install --save-dev solana-privacy-devtools
npx privacy-scanner-init
```

## Features

- **Static code analyzer** - Detect privacy anti-patterns in source code
- **Transaction simulator** - Test privacy before deployment
- **Vitest/Jest matchers** - Assert privacy in tests
- **GitHub Actions** - Automated PR checks
- **Pre-commit hooks** - Catch leaks early

## Quick Example

### Static Analysis
```bash
# Scan your code for privacy anti-patterns
npx solana-privacy-devtools analyze src/
```

### Runtime Testing
```typescript
import { simulateTransactionPrivacy } from 'solana-privacy-devtools/simulator';
import 'solana-privacy-devtools/matchers';

test('transfer maintains privacy', async () => {
  const tx = await createTransfer(user, recipient, amount);
  const report = await simulateTransactionPrivacy(tx, connection);

  expect(report).toHavePrivacyRisk('LOW');
  expect(report).toNotLeakUserRelationships();
});
```

[See full example →](./example)
