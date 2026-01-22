# solana-privacy-scanner-ci-tools

CI/CD integration tools for Solana privacy scanning. Test privacy in your development workflow with transaction simulation, testing matchers, and automated checks.

[![npm](https://img.shields.io/npm/v/solana-privacy-scanner-ci-tools)](https://www.npmjs.com/package/solana-privacy-scanner-ci-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🧪 **Transaction Simulator** - Test privacy before sending to mainnet
- ✅ **Testing Matchers** - Privacy assertions in Vitest/Jest tests
- ⚙️ **Config System** - Project-level privacy policies
- 🔗 **GitHub Actions** - Automated PR privacy checks
- 🪝 **Pre-commit Hooks** - Catch issues before commit
- 🐳 **Docker Support** - Containerized scanning for CI/CD

## Quick Start

### Installation

```bash
npm install --save-dev solana-privacy-scanner-ci-tools
```

### Setup Wizard

Run the interactive setup:

```bash
npx privacy-scanner-init
```

This will:
- Create `.privacyrc` configuration
- Set up GitHub Actions (optional)
- Install pre-commit hooks (optional)
- Configure testing matchers (optional)

---

## Transaction Simulator

Analyze privacy **before** sending transactions to the network.

### Basic Usage

```typescript
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';
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
} else {
  // Safe to send
  await sendAndConfirmTransaction(connection, tx, [signer]);
}
```

### Flow Analysis

Analyze multiple transactions as a user flow:

```typescript
import { simulateTransactionFlow } from 'solana-privacy-scanner-ci-tools/simulator';

const flow = [
  createDepositTx(),
  createSwapTx(),
  createWithdrawTx()
];

const flowReport = await simulateTransactionFlow(flow, connection);

console.log(`Cumulative Risk: ${flowReport.cumulativeRisk}`);
console.log(`Emergent Patterns: ${flowReport.emergentPatterns.length}`);

// Check for patterns that only appear across multiple transactions
for (const pattern of flowReport.emergentPatterns) {
  console.log(`- ${pattern.type}: ${pattern.description}`);
}
```

### Implementation Comparison

Compare two implementations to choose the most private:

```typescript
import { compareImplementations } from 'solana-privacy-scanner-ci-tools/simulator';

const directTransfer = createDirectTransfer(user, recipient, amount);
const intermediaryTransfer = createIntermediaryTransfer(user, recipient, amount);

const comparison = await compareImplementations(
  directTransfer,
  intermediaryTransfer,
  connection
);

console.log(`Winner: Implementation ${comparison.winner}`);
console.log(`Privacy improvement: ${comparison.difference} points`);
console.log(`Recommendation: ${comparison.recommendation}`);
```

---

## Testing Matchers

Add privacy assertions to your tests.

### Setup

```typescript
// tests/setup.ts
import 'solana-privacy-scanner-ci-tools/matchers';
```

### Usage

```typescript
import { expect } from 'vitest';
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';

describe('Token Transfer', () => {
  it('should maintain user privacy', async () => {
    const tx = await createTransfer(user, recipient, amount);
    const report = await simulateTransactionPrivacy(tx, connection);

    // Privacy-specific assertions
    expect(report).toHavePrivacyRisk('LOW');
    expect(report).toNotLeakUserRelationships();
    expect(report).toHaveNoHighRiskSignals();
    expect(report).toHaveAtMostSignals(2);
  });

  it('should not interact with exchanges', async () => {
    const tx = await createSwap(tokenA, tokenB);
    const report = await simulateTransactionPrivacy(tx, connection);

    expect(report).toNotInteractWith('exchange');
    expect(report).toHaveNoKnownEntities();
  });

  it('should avoid specific signals', async () => {
    const tx = await createComplexOperation();
    const report = await simulateTransactionPrivacy(tx, connection);

    expect(report).toNotHaveSignal('counterparty-reuse');
    expect(report).toNotHaveSignal('timing-pattern');
  });
});
```

### Available Matchers

| Matcher | Description |
|---------|-------------|
| `toHavePrivacyRisk(level)` | Assert specific risk level |
| `toHaveNoHighRiskSignals()` | No HIGH severity signals |
| `toNotLeakUserRelationships()` | No relationship linkage |
| `toHaveSignal(type)` | Has specific signal |
| `toNotHaveSignal(type)` | Doesn't have specific signal |
| `toHavePrivacyScore(min)` | Minimum privacy score |
| `toHaveAtMostSignals(max)` | Maximum signal count |
| `toHaveNoKnownEntities()` | No labeled entities |
| `toNotInteractWith(type)` | Avoid entity type |

---

## Configuration

Create `.privacyrc` in your project root:

```json
{
  "maxRiskLevel": "MEDIUM",
  "enforceInCI": true,
  "testWallets": {
    "devnet": "YOUR_TEST_WALLET_ADDRESS"
  },
  "thresholds": {
    "maxHighSeverity": 0,
    "maxMediumSeverity": 3,
    "minPrivacyScore": 70
  },
  "excludePatterns": [
    "test/**",
    "scripts/**"
  ]
}
```

### Configuration Options

```typescript
interface PrivacyConfig {
  // Maximum acceptable risk level
  maxRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Enforce in CI/CD environments
  enforceInCI: boolean;
  
  // Block operations on violations
  blockOnFailure: boolean;
  
  // Test wallets per environment
  testWallets?: {
    devnet?: string;
    testnet?: string;
    mainnet?: string;
  };
  
  // Privacy thresholds
  thresholds?: {
    maxSignals?: number;
    maxHighSeverity?: number;
    maxMediumSeverity?: number;
    minPrivacyScore?: number; // 0-100
  };
  
  // Patterns to exclude from scanning
  excludePatterns?: string[];
}
```

### Presets

```typescript
import { STRICT_CONFIG, PERMISSIVE_CONFIG } from 'solana-privacy-scanner-ci-tools/config';

// Strict (for production)
{
  "maxRiskLevel": "LOW",
  "enforceInCI": true,
  "blockOnFailure": true,
  "thresholds": {
    "maxHighSeverity": 0,
    "maxMediumSeverity": 2,
    "minPrivacyScore": 80
  }
}

// Permissive (for development)
{
  "maxRiskLevel": "HIGH",
  "enforceInCI": false,
  "blockOnFailure": false
}
```

---

## GitHub Actions

### Basic Setup

Create `.github/workflows/privacy-check.yml`:

```yaml
name: Privacy Check

on: [pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Privacy Scanner
        uses: solana-privacy-scanner/action@v1
        with:
          wallet: ${{ secrets.TEST_WALLET }}
          fail-on: HIGH
          comment-pr: true
```

### With Custom Config

```yaml
- name: Run Privacy Scanner
  uses: solana-privacy-scanner/action@v1
  with:
    config: .privacyrc
    wallet: ${{ secrets.DEVNET_WALLET }}
    fail-on: MEDIUM
    output: privacy-report.json

- name: Upload Report
  uses: actions/upload-artifact@v3
  with:
    name: privacy-report
    path: privacy-report.json
```

---

## Pre-commit Hooks

### Using Husky

```bash
# Install husky
npm install --save-dev husky
npx husky install

# Create hook
npx husky add .husky/pre-commit "npx privacy-scanner-check"
```

The hook will:
1. Load `.privacyrc` configuration
2. Scan your test wallet
3. Block commit if policy violated
4. Show privacy report

---

## Docker

### Pull Image

```bash
docker pull solana-privacy-scanner/scanner:latest
```

### Usage

```bash
# Basic scan
docker run solana-privacy-scanner/scanner scan-wallet <ADDRESS>

# With volume mount (save report)
docker run -v $(pwd):/workspace solana-privacy-scanner/scanner \
  scan-wallet <ADDRESS> --output /workspace/report.json

# In CI
docker run solana-privacy-scanner/scanner \
  scan-wallet $TEST_WALLET --json --output report.json
```

### Docker Compose

```yaml
version: '3'
services:
  privacy-scan:
    image: solana-privacy-scanner/scanner:latest
    command: scan-wallet ${TEST_WALLET}
    volumes:
      - ./reports:/workspace
```

---

## Examples

### Example 1: Test-Driven Privacy

```typescript
// __tests__/privacy.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';

describe('Lending Protocol Privacy', () => {
  let connection: Connection;

  beforeAll(() => {
    connection = new Connection('https://api.devnet.solana.com');
  });

  it('deposit should not leak user identity', async () => {
    const depositTx = await program.methods
      .deposit(amount)
      .accounts({ user: user.publicKey, vault })
      .transaction();

    const report = await simulateTransactionPrivacy(depositTx, connection);

    expect(report).toHavePrivacyRisk('LOW');
    expect(report).toNotHaveSignal('fee-payer-reuse');
  });

  it('full borrow flow should maintain privacy', async () => {
    const flow = [
      await createCollateralDeposit(),
      await createBorrow(),
      await createRepayment()
    ];

    const flowReport = await simulateTransactionFlow(flow, connection);

    expect(flowReport.cumulativeRisk).toBe('LOW');
    expect(flowReport.emergentPatterns).toHaveLength(0);
  });
});
```

### Example 2: Choose Best Implementation

```typescript
async function chooseImplementation() {
  const directImpl = createDirectSwap(tokenA, tokenB, amount);
  const routedImpl = createRoutedSwap(tokenA, tokenB, amount);

  const comparison = await compareImplementations(
    directImpl,
    routedImpl,
    connection
  );

  return comparison.winner === 'A' ? directImpl : routedImpl;
}
```

### Example 3: Interactive Development

```typescript
// scripts/dev-helper.ts
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';
import prompts from 'prompts';

async function devHelper() {
  const tx = buildTransaction();
  const report = await simulateTransactionPrivacy(tx, connection);

  if (report.overallRisk === 'HIGH') {
    console.warn('⚠️  High Privacy Risk!');
    console.warn(report.signals.map(s => `- ${s.type}: ${s.description}`).join('\n'));

    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: 'Send anyway?',
      initial: false
    });

    if (!proceed) return;
  }

  await sendTransaction(tx);
}
```

---

## API Reference

### Simulator

```typescript
// Simulate single transaction
function simulateTransactionPrivacy(
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
  options?: SimulatorOptions
): Promise<PrivacyReport>

// Simulate transaction flow
function simulateTransactionFlow(
  transactions: Transaction[],
  connection: Connection,
  options?: SimulatorOptions
): Promise<PrivacyFlowReport>

// Compare implementations
function compareImplementations(
  implA: Transaction,
  implB: Transaction,
  connection: Connection,
  options?: SimulatorOptions
): Promise<PrivacyComparison>
```

### Config

```typescript
// Load configuration
function loadConfig(cwd?: string): PrivacyConfig

// Get environment-specific config
function getEnvironmentConfig(
  config: PrivacyConfig,
  environment: string
): PrivacyConfig

// Check if enforcement enabled
function shouldEnforce(config: PrivacyConfig): boolean
```

---

## Contributing

See [CONTRIBUTING.md](https://github.com/taylorferran/solana-privacy-scanner/blob/main/CONTRIBUTING.md)

## License

MIT © Taylor Ferran

## Links

- [Documentation](https://sps.guide)
- [Core Package](https://www.npmjs.com/package/solana-privacy-scanner-core)
- [CLI](https://www.npmjs.com/package/solana-privacy-scanner)
- [GitHub](https://github.com/taylorferran/solana-privacy-scanner)
