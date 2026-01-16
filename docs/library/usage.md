# Library Usage

Learn how to integrate Solana Privacy Scanner into your own applications.

## Installation

```bash
npm install solana-privacy-scanner-core
```

Current version: `0.1.4`

## Quick Start

```typescript
import { 
  RPCClient, 
  collectWalletData, 
  normalizeWalletData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

async function analyzeWallet(address: string, rpcUrl: string) {
  // Initialize RPC client (accepts string URL or config object)
  const rpc = new RPCClient(rpcUrl);
  
  // Create label provider for known entity detection
  const labelProvider = createDefaultLabelProvider();

  // Collect raw on-chain data
  const rawData = await collectWalletData(rpc, address, {
    maxSignatures: 50,
    includeTokenAccounts: true,
  });

  // Normalize data into structured facts
  const context = normalizeWalletData(rawData, labelProvider);

  // Generate privacy report
  const report = generateReport(context);

  console.log('Risk Level:', report.overallRisk);
  console.log('Signals:', report.signals.length);
  console.log('Known Entities:', report.knownEntities.length);
  
  return report;
}
```

## Core Concepts

The library provides a modular architecture:

```
Data Collection → Normalization → Heuristic Analysis → Report Generation
```

You use individual components to build your analysis pipeline.

## Complete Examples

### Example 1: Basic Wallet Scan

```typescript
import { 
  RPCClient, 
  collectWalletData, 
  normalizeWalletData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

async function analyzeWallet(address: string, rpcUrl: string) {
  const rpc = new RPCClient(rpcUrl);
  const labelProvider = createDefaultLabelProvider();
  
  // Collect data
  const rawData = await collectWalletData(rpc, address, {
    maxSignatures: 100,
    includeTokenAccounts: true,
  });
  
  // Normalize and generate report
  const context = normalizeWalletData(rawData, labelProvider);
  const report = generateReport(context);

  // Check overall risk
  if (report.overallRisk === 'HIGH') {
    console.error('⚠️ High privacy risk detected!');
  }

  // Iterate through signals
  for (const signal of report.signals) {
    console.log(`${signal.type} [${signal.severity}]`);
    console.log(`  ${signal.description}`);
    if (signal.evidence.length > 0) {
      console.log(`  Evidence: ${signal.evidence[0]}`);
    }
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
import { 
  RPCClient, 
  collectTransactionData, 
  normalizeTransactionData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

async function analyzeTransaction(signature: string, rpcUrl: string) {
  const rpc = new RPCClient(rpcUrl);
  const labelProvider = createDefaultLabelProvider();

  // Collect transaction data
  const rawData = await collectTransactionData(rpc, signature);
  
  // Normalize and generate report
  const context = normalizeTransactionData(rawData, labelProvider);
  const report = generateReport(context);

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
      type: 'HIGH_VOLUME',
      severity: 'MEDIUM',
      description: `Wallet has ${context.transfers.length} transfers`,
      evidence: [`Total transfers: ${context.transfers.length}`],
      mitigation: 'Consider splitting activities across multiple wallets',
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

  // Combine signals by adding to context
  // (Note: generateReport will automatically run evaluateHeuristics)
  const report = generateReport(context);

  // Add custom signal to report if needed
  if (customSignal) {
    report.signals.push(customSignal);
  }

  return report;
}
```

## API Reference

### RPC Client

#### `new RPCClient(configOrUrl, options?)`

Creates an RPC client with rate limiting and retry logic.

```typescript
// Simple usage with URL string
const rpc = new RPCClient('https://your-rpc-url.com');

// Advanced usage with config object
const rpc = new RPCClient({
  rpcUrl: 'https://your-rpc-url.com',
  maxConcurrency: 10,   // Max concurrent requests (default: 10)
  maxRetries: 3,        // Max retry attempts (default: 3)
  retryDelay: 1000,     // Initial retry delay in ms (default: 1000)
  timeout: 30000,       // Request timeout in ms (default: 30000)
  debug: false,         // Enable debug logging (default: false)
});
```

**Note**: The RPC URL is automatically trimmed to handle whitespace.

---

### Data Collection

#### `collectWalletData(rpc, address, options?)`

Collects raw on-chain data for a wallet.

```typescript
async function collectWalletData(
  rpc: RPCClient,
  address: string,
  options?: {
    maxSignatures?: number;         // Default: 100
    includeTokenAccounts?: boolean; // Default: true
  }
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

#### `collectProgramData(rpc, programId, options?)`

Collects data for a program's activity.

```typescript
async function collectProgramData(
  rpc: RPCClient,
  programId: string,
  options?: {
    maxAccounts?: number;      // Default: 10
    maxTransactions?: number;  // Default: 20
  }
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

#### `normalizeTransactionData(rawData, labelProvider?)`

Transforms raw transaction data into structured context.

```typescript
function normalizeTransactionData(
  rawData: RawTransactionData,
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
}
```

## TypeScript Types

### Core Types

```typescript
// Risk signal
interface RiskSignal {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  evidence: string[];
  mitigation: string;
}

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
  type: 'exchange' | 'bridge' | 'protocol' | 'program' | 'defi' | 'nft' | 'other';
  description?: string;
}
```

## Error Handling

```typescript
import { 
  RPCClient, 
  collectWalletData, 
  normalizeWalletData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

async function safeAnalysis(address: string, rpcUrl: string) {
  try {
    const rpc = new RPCClient(rpcUrl);
    const labelProvider = createDefaultLabelProvider();
    
    const rawData = await collectWalletData(rpc, address, {
      maxSignatures: 50,
    });
    
    const context = normalizeWalletData(rawData, labelProvider);
    const report = generateReport(context);

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
import { 
  RPCClient, 
  collectWalletData, 
  normalizeWalletData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

const app = express();
const rpc = new RPCClient(process.env.SOLANA_RPC!);
const labelProvider = createDefaultLabelProvider();

app.get('/api/scan/:address', async (req, res) => {
  try {
    const rawData = await collectWalletData(rpc, req.params.address, {
      maxSignatures: 50,
    });
    
    const context = normalizeWalletData(rawData, labelProvider);
    const report = generateReport(context);

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
import { 
  RPCClient, 
  collectWalletData, 
  normalizeWalletData, 
  generateReport,
  createDefaultLabelProvider,
  type PrivacyReport 
} from 'solana-privacy-scanner-core';

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
        const labelProvider = createDefaultLabelProvider();
        
        const rawData = await collectWalletData(rpc, address, {
          maxSignatures: 50,
        });
        
        const context = normalizeWalletData(rawData, labelProvider);
        const result = generateReport(context);

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
import { 
  RPCClient, 
  collectWalletData, 
  normalizeWalletData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

const rpc = new RPCClient(process.env.SOLANA_RPC!);
const labelProvider = createDefaultLabelProvider();

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
    const rawData = await collectWalletData(rpc, address, {
      maxSignatures: 50,
    });
    
    const context = normalizeWalletData(rawData, labelProvider);
    const report = generateReport(context);

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Scan failed'
    });
  }
}
```

## Performance Tips

### 1. Reuse RPC Client and Label Provider

```typescript
// ✅ Good: Reuse client and label provider
const rpc = new RPCClient(rpcUrl);
const labelProvider = createDefaultLabelProvider();

const rawData1 = await collectWalletData(rpc, address1, { maxSignatures: 50 });
const context1 = normalizeWalletData(rawData1, labelProvider);
const report1 = generateReport(context1);

const rawData2 = await collectWalletData(rpc, address2, { maxSignatures: 50 });
const context2 = normalizeWalletData(rawData2, labelProvider);
const report2 = generateReport(context2);

// ❌ Bad: Create new instances each time
const report1 = generateReport(normalizeWalletData(
  await collectWalletData(new RPCClient(rpcUrl), address1),
  createDefaultLabelProvider()
));
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
  const labelProvider = createDefaultLabelProvider();
  
  const reports = await Promise.all(
    addresses.map(async address => {
      const rawData = await collectWalletData(rpc, address, {
        maxSignatures: 30,
      });
      const context = normalizeWalletData(rawData, labelProvider);
      return generateReport(context);
    })
  );

  return reports;
}
```

## Next Steps

- **[CLI Usage](/cli/quickstart)** - Use the command-line tool
- **[Understanding Reports](/reports/risk-levels)** - Interpret scan results
- **[Contributing](/contributing/development)** - Extend the library
