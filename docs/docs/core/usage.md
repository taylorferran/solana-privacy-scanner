# Core Library

Programmatic API for on-chain scanning, static analysis, transaction simulation, and testing.

## Install

```bash
npm install solana-privacy-scanner-core
```

## On-Chain Scanning

Scan wallets, transactions, and programs using on-chain data.

```typescript
import {
  RPCClient,
  collectWalletData,
  normalizeWalletData,
  generateReport,
  createDefaultLabelProvider
} from 'solana-privacy-scanner-core';

const rpc = new RPCClient();
const labels = createDefaultLabelProvider();

const rawData = await collectWalletData(rpc, address);
const context = normalizeWalletData(rawData, labels);
const report = generateReport(context);

console.log(report.overallRisk); // 'LOW' | 'MEDIUM' | 'HIGH'
```

**API:**

```typescript
// Data Collection
await collectWalletData(rpc, address, options?)
await collectTransactionData(rpc, signature)
await collectProgramData(rpc, programId, options?)

// Normalization
normalizeWalletData(rawData, labelProvider)
normalizeTransactionData(rawData, labelProvider)
normalizeProgramData(rawData, labelProvider)

// Report
generateReport(context) // Returns PrivacyReport
```

**Custom RPC:**

```typescript
const rpc = new RPCClient('https://your-endpoint.com');
```

## Static Code Analysis

Analyze TypeScript/JavaScript source code for privacy anti-patterns.

```typescript
import { analyze } from 'solana-privacy-scanner-core';

const result = await analyze(['src/**/*.ts'], {
  includeLow: false // exclude low severity issues
});

console.log(`Found ${result.summary.total} issues`);
console.log(`Critical: ${result.summary.critical}`);
```

**API:**

```typescript
await analyze(paths: string[], options?: {
  includeLow?: boolean
}) // Returns AnalyzerResult
```

**Detects:**
- Fee payer reuse in loops (CRITICAL)
- PII in transaction memos (HIGH)
- Hardcoded addresses (MEDIUM)
- Descriptive memo patterns (LOW)

## Transaction Simulation

Test privacy before sending transactions to the network.

```typescript
import { Connection } from '@solana/web3.js';
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-core';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const report = await simulateTransactionPrivacy(tx, connection);

console.log(`Risk: ${report.overallRisk}`);
```

**API:**

```typescript
// Single transaction
await simulateTransactionPrivacy(
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
  options?: SimulatorOptions
) // Returns PrivacyReport

// Transaction flow
await simulateTransactionFlow(
  transactions: Transaction[],
  connection: Connection,
  options?: SimulatorOptions
) // Returns PrivacyFlowReport

// Compare implementations
await compareImplementations(
  implA: Transaction,
  implB: Transaction,
  connection: Connection,
  options?: SimulatorOptions
) // Returns PrivacyComparison
```

## Test Matchers

Custom assertions for Vitest/Jest test suites.

```typescript
import { expect } from 'vitest';
import 'solana-privacy-scanner-core/matchers';

test('transaction maintains privacy', async () => {
  const report = await simulateTransactionPrivacy(tx, connection);

  expect(report).toHavePrivacyRisk('LOW');
  expect(report).toHaveNoHighRiskSignals();
  expect(report).toNotLeakUserRelationships();
  expect(report).toHaveAtMostSignals(2);
});
```

**Available matchers:**
- `toHavePrivacyRisk(level)` - Assert specific risk level
- `toHaveNoHighRiskSignals()` - No HIGH severity signals
- `toNotLeakUserRelationships()` - No relationship-linking signals
- `toHaveSignal(type)` - Contains specific signal type
- `toNotHaveSignal(type)` - Does not contain signal type
- `toHavePrivacyScore(minScore)` - Minimum privacy score
- `toHaveAtMostSignals(max)` - Maximum signal count
- `toHaveNoKnownEntities()` - No CEX/bridge interactions
- `toNotInteractWith(entityType)` - Avoid entity type

## Configuration Management

Load and validate privacy policy configuration.

```typescript
import { loadConfig, validateConfig } from 'solana-privacy-scanner-core';

const config = await loadConfig('.privacyrc');

if (config) {
  console.log(`Max risk level: ${config.maxRiskLevel}`);
  console.log(`Enforce in CI: ${config.enforceInCI}`);
}
```

**Config structure:**

```typescript
interface PrivacyConfig {
  maxRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  enforceInCI: boolean;
  blockOnFailure: boolean;
  thresholds?: {
    maxHighSeverity?: number;
    maxMediumSeverity?: number;
    minPrivacyScore?: number;
  };
  testWallets?: {
    devnet?: string;
    testnet?: string;
  };
}
```
