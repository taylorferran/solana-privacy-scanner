# Library Usage

## Install

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

const rpc = new RPCClient();
const labels = createDefaultLabelProvider();

const rawData = await collectWalletData(rpc, address);
const context = normalizeWalletData(rawData, labels);
const report = generateReport(context);

console.log(report.overallRisk); // 'LOW' | 'MEDIUM' | 'HIGH'
```

## API

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

## Custom RPC

```typescript
const rpc = new RPCClient('https://your-endpoint.com');
```
