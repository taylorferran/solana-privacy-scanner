# Library Usage

Learn how to integrate Solana Privacy Scanner into your own applications.

## Installation

```bash
npm install solana-privacy-scanner-core
```

## Quick Start

```typescript
import { scan, RPCClient } from 'solana-privacy-scanner-core';

// Initialize RPC client
const rpc = new RPCClient('https://your-rpc-url.com');

// Scan a wallet
const report = await scan({
  target: 'YourWalletAddress',
  targetType: 'wallet',
  rpcClient: rpc,
  maxSignatures: 50,
});

console.log('Risk Level:', report.overallRisk);
console.log('Signals:', report.signals.length);
```

## Core Concepts

The library provides a modular architecture:

```
Data Collection → Normalization → Heuristic Analysis → Report Generation
```

You can use the entire pipeline with `scan()` or use individual components.

## Complete Examples

### Example 1: Basic Wallet Scan

```typescript
import { scan, RPCClient } from 'solana-privacy-scanner-core';

async function analyzeWallet(address: string, rpcUrl: string) {
  const rpc = new RPCClient(rpcUrl);
  
  const report = await scan({
    target: address,
    targetType: 'wallet',
    rpcClient: rpc,
    maxSignatures: 100,
  });

  // Check overall risk
  if (report.overallRisk === 'HIGH') {
    console.error('⚠️ High privacy risk detected!');
  }

  // Iterate through signals
  for (const signal of report.signals) {
    console.log(`${signal.name} [${signal.severity}]`);
    console.log(`  Reason: ${signal.reason}`);
    console.log(`  Confidence: ${(signal.confidence * 100).toFixed(0)}%`);
  }

  // Check for CEX interactions
  const cexInteractions = report.knownEntities.filter(
    e => e.type === 'exchange'
  );
  
  if (cexInteractions.length > 0) {
    console.log('⚠️ CEX interactions detected:');
    cexInteractions.forEach(e => console.log(`  - ${e.name}`));
  }

  return report;
}
```

### Example 2: Using Individual Components

```typescript
import {
  RPCClient,
  collectWalletData,
  normalizeWalletData,
  evaluateHeuristics,
  generateReport,
  createDefaultLabelProvider,
} from 'solana-privacy-scanner-core';

async function customAnalysis(address: string, rpcUrl: string) {
  // Step 1: Initialize
  const rpc = new RPCClient(rpcUrl);
  const labelProvider = createDefaultLabelProvider();

  // Step 2: Collect raw data
  const rawData = await collectWalletData(rpc, address, {
    maxSignatures: 50,
    includeTokenAccounts: true,
  });

  console.log(`Collected ${rawData.transactions.length} transactions`);

  // Step 3: Normalize data
  const context = normalizeWalletData(rawData, labelProvider);

  console.log(`Found ${context.transfers.length} transfers`);
  console.log(`Identified ${context.labels.size} known entities`);

  // Step 4: Run heuristics
  const signals = evaluateHeuristics(context);

  console.log(`Detected ${signals.length} risk signals`);

  // Step 5: Generate report
  const report = generateReport(context);

  return { report, context, signals };
}
```

### Example 3: Transaction Analysis

```typescript
import { scan, RPCClient } from 'solana-privacy-scanner-core';

async function analyzeTransaction(signature: string, rpcUrl: string) {
  const rpc = new RPCClient(rpcUrl);

  const report = await scan({
    target: signature,
    targetType: 'transaction',
    rpcClient: rpc,
  });

  return report;
}
```

### Example 4: Custom Heuristics

Add your own risk detection logic:

```typescript
import type { ScanContext, RiskSignal } from 'solana-privacy-scanner-core';

function detectCustomPattern(context: ScanContext): RiskSignal | null {
  // Your custom logic
  const hasPattern = context.transfers.length > 100;

  if (hasPattern) {
    return {
      id: 'high-volume',
      name: 'High Transaction Volume',
      severity: 'MEDIUM',
      reason: `Wallet has ${context.transfers.length} transfers`,
      impact: 'High volume can indicate commercial activity',
      evidence: [{
        type: 'pattern',
        description: `${context.transfers.length} total transfers`,
        data: { count: context.transfers.length },
      }],
      mitigation: 'Consider splitting activities across multiple wallets',
      confidence: 0.75,
    };
  }

  return null;
}

// Use in analysis
import { evaluateHeuristics, generateReport } from 'solana-privacy-scanner-core';

async function analyzeWithCustomHeuristic(context: ScanContext) {
  // Run standard heuristics
  const standardSignals = evaluateHeuristics(context);

  // Run custom heuristic
  const customSignal = detectCustomPattern(context);

  // Combine signals
  const allSignals = customSignal 
    ? [...standardSignals, customSignal]
    : standardSignals;

  // Generate report with all signals
  return generateReport(context);
}
```

## API Reference

### Main Functions

#### `scan(options)`

High-level function that runs the complete analysis pipeline.

```typescript
async function scan(options: ScanOptions): Promise<PrivacyReport>
```

**Parameters:**
```typescript
interface ScanOptions {
  target: string;                    // Address, signature, or program ID
  targetType: 'wallet' | 'transaction' | 'program';
  rpcClient: RPCClient;
  maxSignatures?: number;            // For wallet/program scans (default: 100)
  includeTokenAccounts?: boolean;    // For wallet scans (default: true)
  maxAccounts?: number;              // For program scans (default: 10)
  maxTransactions?: number;          // For program scans (default: 20)
}
```

**Returns:**
```typescript
interface PrivacyReport {
  version: string;
  timestamp: number;
  targetType: 'wallet' | 'transaction' | 'program';
  target: string;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  signals: RiskSignal[];
  summary: {
    totalSignals: number;
    highRiskSignals: number;
    mediumRiskSignals: number;
    lowRiskSignals: number;
    transactionsAnalyzed: number;
  };
  mitigations: string[];
  knownEntities: Label[];
}
```

---

### Data Collection

#### `collectWalletData(rpc, address, options)`

Collects raw on-chain data for a wallet.

```typescript
async function collectWalletData(
  rpc: RPCClient,
  address: string,
  options?: CollectionOptions
): Promise<RawWalletData>
```

#### `collectTransactionData(rpc, signature)`

Collects data for a single transaction.

```typescript
async function collectTransactionData(
  rpc: RPCClient,
  signature: string
): Promise<RawTransactionData>
```

#### `collectProgramData(rpc, programId, options)`

Collects data for a program's activity.

```typescript
async function collectProgramData(
  rpc: RPCClient,
  programId: string,
  options?: ProgramCollectionOptions
): Promise<RawProgramData>
```

---

### Data Normalization

#### `normalizeWalletData(rawData, labelProvider?)`

Transforms raw wallet data into structured context.

```typescript
function normalizeWalletData(
  rawData: RawWalletData,
  labelProvider?: LabelProvider
): ScanContext
```

**Returns:**
```typescript
interface ScanContext {
  target: string;
  targetType: 'wallet' | 'transaction' | 'program';
  transfers: Transfer[];
  instructions: NormalizedInstruction[];
  counterparties: Set<string>;
  labels: Map<string, Label>;
  tokenAccounts: Array<{ mint: string; address: string; balance: number }>;
  timeRange: { earliest: number | null; latest: number | null };
  transactionCount: number;
}
```

---

### Heuristic Evaluation

#### `evaluateHeuristics(context)`

Runs all built-in heuristics on the scan context.

```typescript
function evaluateHeuristics(context: ScanContext): RiskSignal[]
```

Individual heuristics:

```typescript
function detectCounterpartyReuse(context: ScanContext): RiskSignal | null;
function detectAmountReuse(context: ScanContext): RiskSignal | null;
function detectTimingPatterns(context: ScanContext): RiskSignal | null;
function detectKnownEntityInteraction(context: ScanContext): RiskSignal | null;
function detectBalanceTraceability(context: ScanContext): RiskSignal | null;
```

---

### Report Generation

#### `generateReport(context)`

Creates a complete privacy report from a scan context.

```typescript
function generateReport(context: ScanContext): PrivacyReport
```

---

### RPC Client

#### `new RPCClient(rpcUrl, options?)`

Creates an RPC client with rate limiting and retry logic.

```typescript
class RPCClient {
  constructor(rpcUrl: string, options?: {
    maxConcurrency?: number;  // Default: 3
    maxRetries?: number;      // Default: 3
    retryDelay?: number;      // Default: 1000ms
  });

  // Methods
  async getSignaturesForAddress(address: PublicKey, options?): Promise<ConfirmedSignatureInfo[]>;
  async getTransaction(signature: string): Promise<ParsedTransactionWithMeta | null>;
  async getTokenAccountsByOwner(owner: PublicKey): Promise<any[]>;
  async getProgramAccounts(programId: PublicKey, config?): Promise<any[]>;
  async healthCheck(): Promise<boolean>;
}
```

---

### Label Provider

#### `createDefaultLabelProvider()`

Creates a label provider with the built-in known entities database.

```typescript
function createDefaultLabelProvider(): StaticLabelProvider
```

#### `StaticLabelProvider`

```typescript
class StaticLabelProvider implements LabelProvider {
  lookup(address: string): Label | null;
  lookupMany(addresses: string[]): Map<string, Label>;
  getAllLabels(): Label[];
  getCount(): number;
}
```

## TypeScript Types

### Core Types

```typescript
// Risk signal
interface RiskSignal {
  id: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  impact: string;
  evidence: Evidence[];
  mitigation: string;
  confidence: number;  // 0-1
}

// Evidence
interface Evidence {
  type: EvidenceType;
  description: string;
  data?: Record<string, unknown>;
  reference?: string;
}

type EvidenceType = 'transaction' | 'pattern' | 'label' | 'timing' | 'amount';

// Transfer
interface Transfer {
  from: string;
  to: string;
  amount: number;
  token?: string;  // undefined for SOL, mint address for SPL
  signature: string;
  blockTime: number | null;
}

// Known entity label
interface Label {
  address: string;
  name: string;
  type: LabelType;
  description?: string;
  relatedAddresses?: string[];
}

type LabelType = 'exchange' | 'bridge' | 'protocol' | 'program' | 'mixer' | 'other';
```

## Error Handling

```typescript
import { scan, RPCClient } from 'solana-privacy-scanner-core';

async function safeAnalysis(address: string, rpcUrl: string) {
  try {
    const rpc = new RPCClient(rpcUrl);
    
    const report = await scan({
      target: address,
      targetType: 'wallet',
      rpcClient: rpc,
      maxSignatures: 50,
    });

    return { success: true, report };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Analysis failed:', error.message);
      return { success: false, error: error.message };
    }
    throw error;
  }
}
```

Common errors:
- **RPC failures**: Network issues, rate limits, invalid endpoints
- **Invalid addresses**: Malformed addresses or signatures
- **Missing data**: Transaction not found, account doesn't exist

## Integration Examples

### Express.js API

```typescript
import express from 'express';
import { scan, RPCClient } from 'solana-privacy-scanner-core';

const app = express();
const rpc = new RPCClient(process.env.SOLANA_RPC!);

app.get('/api/scan/:address', async (req, res) => {
  try {
    const report = await scan({
      target: req.params.address,
      targetType: 'wallet',
      rpcClient: rpc,
      maxSignatures: 50,
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Scan failed' });
  }
});

app.listen(3000);
```

### React Hook

```typescript
import { useState, useEffect } from 'react';
import { scan, RPCClient, type PrivacyReport } from 'solana-privacy-scanner-core';

export function usePrivacyScan(address: string | null, rpcUrl: string) {
  const [report, setReport] = useState<PrivacyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    async function runScan() {
      setLoading(true);
      setError(null);

      try {
        const rpc = new RPCClient(rpcUrl);
        const result = await scan({
          target: address,
          targetType: 'wallet',
          rpcClient: rpc,
          maxSignatures: 50,
        });

        if (!cancelled) {
          setReport(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Scan failed');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    runScan();

    return () => {
      cancelled = true;
    };
  }, [address, rpcUrl]);

  return { report, loading, error };
}
```

### Next.js API Route

```typescript
// pages/api/scan.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { scan, RPCClient } from 'solana-privacy-scanner-core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address required' });
  }

  try {
    const rpc = new RPCClient(process.env.SOLANA_RPC!);
    
    const report = await scan({
      target: address,
      targetType: 'wallet',
      rpcClient: rpc,
      maxSignatures: 50,
    });

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Scan failed'
    });
  }
}
```

## Performance Tips

### 1. Reuse RPC Client

```typescript
// ✅ Good: Reuse client
const rpc = new RPCClient(rpcUrl);
await scan({ target: address1, rpcClient: rpc });
await scan({ target: address2, rpcClient: rpc });

// ❌ Bad: Create new client each time
await scan({ target: address1, rpcClient: new RPCClient(rpcUrl) });
await scan({ target: address2, rpcClient: new RPCClient(rpcUrl) });
```

### 2. Limit Signatures

```typescript
// For quick checks
maxSignatures: 20

// For comprehensive analysis
maxSignatures: 200
```

### 3. Batch Analysis

```typescript
async function batchAnalyze(addresses: string[], rpcUrl: string) {
  const rpc = new RPCClient(rpcUrl);
  
  const reports = await Promise.all(
    addresses.map(address =>
      scan({
        target: address,
        targetType: 'wallet',
        rpcClient: rpc,
        maxSignatures: 30,
      })
    )
  );

  return reports;
}
```

## Next Steps

- **[CLI Usage](/cli/quickstart)** - Use the command-line tool
- **[Understanding Reports](/reports/risk-levels)** - Interpret scan results
- **[Contributing](/contributing/development)** - Extend the library
