# Library Usage

Integrate Solana Privacy Scanner into your applications.

## Installation

```bash
npm install solana-privacy-scanner-core
```

## Quick Start

```typescript
import { 
  RPCClient, 
  collectWalletData, 
  normalizeWalletData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

async function analyzeWallet(address: string) {
  const rpc = new RPCClient();
  const labelProvider = createDefaultLabelProvider();

  const rawData = await collectWalletData(rpc, address, {
    maxSignatures: 50,
    includeTokenAccounts: true,
  });

  const context = normalizeWalletData(rawData, labelProvider);
  const report = generateReport(context);

  return report;
}
```

## Core Functions

### Data Collection

```typescript
// Wallet
const rawData = await collectWalletData(rpc, address, {
  maxSignatures?: number,
  includeTokenAccounts?: boolean
});

// Transaction
const rawData = await collectTransactionData(rpc, signature);

// Program
const rawData = await collectProgramData(rpc, programId, {
  maxTransactions?: number,
  limit?: number
});
```

### Normalization

```typescript
const labelProvider = createDefaultLabelProvider();

// Wallet
const context = normalizeWalletData(rawData, labelProvider);

// Transaction  
const context = normalizeTransactionData(rawData, labelProvider);

// Program
const context = normalizeProgramData(rawData, labelProvider);
```

### Report Generation

```typescript
const report = generateReport(context);

console.log(report.overallRisk); // 'LOW' | 'MEDIUM' | 'HIGH'
console.log(report.signals);     // Array of detected risks
console.log(report.knownEntities); // CEXs, bridges, etc.
console.log(report.mitigations);  // Recommendations
```

## TypeScript Types

```typescript
import type {
  PrivacyReport,
  RiskSignal,
  ScanContext,
  RawWalletData,
  RawTransactionData,
  RawProgramData
} from 'solana-privacy-scanner-core';
```

## Examples

### Transaction Scan

```typescript
const rpc = new RPCClient();
const labels = createDefaultLabelProvider();

const raw = await collectTransactionData(rpc, signature);
const context = normalizeTransactionData(raw, labels);
const report = generateReport(context);

if (report.overallRisk === 'HIGH') {
  console.warn('High privacy risk detected!');
  report.signals.forEach(signal => {
    console.log(`- ${signal.name}: ${signal.reason}`);
  });
}
```

### Program Scan

```typescript
const rpc = new RPCClient();
const labels = createDefaultLabelProvider();

const raw = await collectProgramData(rpc, programId, {
  maxTransactions: 100
});

const context = normalizeProgramData(raw, labels);
const report = generateReport(context);
```

### Custom RPC (Production)

```typescript
const rpc = new RPCClient({
  rpcUrl: process.env.QUICKNODE_RPC_URL,
  maxRetries: 5,
  requestsPerSecond: 10
});
```

## Error Handling

All collectors include graceful error handling:

```typescript
try {
  const rawData = await collectWalletData(rpc, address);
  // rawData.transactions will be empty array if RPC fails
} catch (error) {
  console.error('Collection failed:', error);
}
```

## Next Steps

- **[Examples](./examples)** - More code examples
- **[For LLMs](./for-llms)** - AI assistant integration guide
