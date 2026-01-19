# Library Examples

Practical code examples for integrating the privacy scanner into your applications.

## Web Applications

### Basic React Component

```tsx
import { useState } from 'react';
import { scan, RPCClient, type PrivacyReport } from 'solana-privacy-scanner-core';

export function PrivacyScanner() {
  const [address, setAddress] = useState('');
  const [report, setReport] = useState<PrivacyReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const rpc = new RPCClient(process.env.NEXT_PUBLIC_SOLANA_RPC!);
      const result = await scan({
        target: address,
        targetType: 'wallet',
        rpcClient: rpc,
        maxSignatures: 50,
      });
      setReport(result);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter wallet address"
      />
      <button onClick={handleScan} disabled={loading}>
        {loading ? 'Scanning...' : 'Scan'}
      </button>

      {report && (
        <div>
          <h2>Risk Level: {report.overallRisk}</h2>
          <p>{report.signals.length} risks detected</p>
          
          {report.signals.map((signal, i) => (
            <div key={i}>
              <h3>{signal.name} [{signal.severity}]</h3>
              <p>{signal.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Risk Badge Component

```tsx
import type { PrivacyReport } from 'solana-privacy-scanner-core';

interface RiskBadgeProps {
  report: PrivacyReport;
}

export function RiskBadge({ report }: RiskBadgeProps) {
  const colors = {
    LOW: 'green',
    MEDIUM: 'yellow',
    HIGH: 'red',
  };

  const color = colors[report.overallRisk];

  return (
    <div style={{ 
      backgroundColor: color, 
      padding: '8px 16px',
      borderRadius: '4px',
      color: 'white',
      fontWeight: 'bold'
    }}>
      {report.overallRisk} RISK
    </div>
  );
}
```

## Backend Services

### Scheduled Monitoring

```typescript
import { scan, RPCClient } from 'solana-privacy-scanner-core';
import cron from 'node-cron';

const WALLETS_TO_MONITOR = [
  'wallet1...',
  'wallet2...',
  'wallet3...',
];

const rpc = new RPCClient(process.env.SOLANA_RPC!);

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Starting daily privacy audit...');

  for (const wallet of WALLETS_TO_MONITOR) {
    try {
      const report = await scan({
        target: wallet,
        targetType: 'wallet',
        rpcClient: rpc,
        maxSignatures: 100,
      });

      if (report.overallRisk === 'HIGH') {
        await sendAlert({
          wallet,
          risk: report.overallRisk,
          signals: report.signals.length,
        });
      }

      await saveReport(wallet, report);
    } catch (error) {
      console.error(`Failed to scan ${wallet}:`, error);
    }
  }
});

async function sendAlert(data: any) {
  // Send email/SMS/Slack notification
  console.log('🚨 ALERT:', data);
}

async function saveReport(wallet: string, report: any) {
  // Save to database
  console.log(`Saved report for ${wallet}`);
}
```

### REST API with Caching

```typescript
import express from 'express';
import { scan, RPCClient, type PrivacyReport } from 'solana-privacy-scanner-core';
import NodeCache from 'node-cache';

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
const rpc = new RPCClient(process.env.SOLANA_RPC!);

app.get('/api/scan/:address', async (req, res) => {
  const { address } = req.params;

  // Check cache first
  const cached = cache.get<PrivacyReport>(address);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  try {
    const report = await scan({
      target: address,
      targetType: 'wallet',
      rpcClient: rpc,
      maxSignatures: 50,
    });

    // Cache the result
    cache.set(address, report);

    res.json({ ...report, cached: false });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Scan failed'
    });
  }
});

app.listen(3000, () => {
  console.log('Privacy Scanner API running on port 3000');
});
```

### Queue-Based Processing

```typescript
import { scan, RPCClient } from 'solana-privacy-scanner-core';
import Bull from 'bull';

const scanQueue = new Bull('privacy-scans', {
  redis: { host: 'localhost', port: 6379 }
});

const rpc = new RPCClient(process.env.SOLANA_RPC!);

// Process scans from queue
scanQueue.process(async (job) => {
  const { address, maxSignatures } = job.data;

  const report = await scan({
    target: address,
    targetType: 'wallet',
    rpcClient: rpc,
    maxSignatures: maxSignatures || 50,
  });

  return report;
});

// Add scan to queue
export async function queueScan(address: string) {
  const job = await scanQueue.add({
    address,
    maxSignatures: 50,
  });

  return job.id;
}

// Get scan result
export async function getScanResult(jobId: string) {
  const job = await scanQueue.getJob(jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }

  return {
    status: await job.getState(),
    result: job.returnvalue,
  };
}
```

## Database Integration

### Prisma Example

```typescript
// schema.prisma
model PrivacyScan {
  id            String   @id @default(cuid())
  address       String
  overallRisk   String
  signalCount   Int
  report        Json
  createdAt     DateTime @default(now())
  
  @@index([address])
}
```

```typescript
// scan-service.ts
import { PrismaClient } from '@prisma/client';
import { scan, RPCClient } from 'solana-privacy-scanner-core';

const prisma = new PrismaClient();
const rpc = new RPCClient(process.env.SOLANA_RPC!);

export async function scanAndSave(address: string) {
  const report = await scan({
    target: address,
    targetType: 'wallet',
    rpcClient: rpc,
    maxSignatures: 50,
  });

  const saved = await prisma.privacyScan.create({
    data: {
      address,
      overallRisk: report.overallRisk,
      signalCount: report.signals.length,
      report: report as any,
    },
  });

  return saved;
}

export async function getHistory(address: string) {
  return prisma.privacyScan.findMany({
    where: { address },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}
```

## CLI Tools

### Custom CLI Tool

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { scan, RPCClient } from 'solana-privacy-scanner-core';
import chalk from 'chalk';

const program = new Command();

program
  .name('my-privacy-tool')
  .description('Custom privacy scanning tool')
  .version('1.0.0');

program
  .command('check <address>')
  .description('Quick privacy check')
  .action(async (address) => {
    console.log('Checking', address);

    const rpc = new RPCClient(process.env.SOLANA_RPC!);
    const report = await scan({
      target: address,
      targetType: 'wallet',
      rpcClient: rpc,
      maxSignatures: 20,
    });

    const color = report.overallRisk === 'HIGH' ? chalk.red
      : report.overallRisk === 'MEDIUM' ? chalk.yellow
      : chalk.green;

    console.log(color(`Risk: ${report.overallRisk}`));
    console.log(`Signals: ${report.signals.length}`);
  });

program.parse();
```

## Testing

### Jest Test Example

```typescript
import { scan, RPCClient } from 'solana-privacy-scanner-core';

describe('Privacy Scanner', () => {
  let rpc: RPCClient;

  beforeAll(() => {
    rpc = new RPCClient(process.env.SOLANA_RPC!);
  });

  it('should scan a wallet', async () => {
    const report = await scan({
      target: 'TestWalletAddress',
      targetType: 'wallet',
      rpcClient: rpc,
      maxSignatures: 10,
    });

    expect(report).toBeDefined();
    expect(report.overallRisk).toMatch(/LOW|MEDIUM|HIGH/);
    expect(Array.isArray(report.signals)).toBe(true);
  });

  it('should detect high risk for CEX wallets', async () => {
    const report = await scan({
      target: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9', // Binance
      targetType: 'wallet',
      rpcClient: rpc,
      maxSignatures: 10,
    });

    // Binance hot wallet should have some activity
    expect(report.transactionCount).toBeGreaterThan(0);
  });
});
```

### Vitest Test Example

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { evaluateHeuristics, type ScanContext } from 'solana-privacy-scanner-core';

describe('Custom Heuristics', () => {
  it('should detect counterparty reuse', () => {
    const mockContext: ScanContext = {
      target: 'test',
      targetType: 'wallet',
      transfers: [
        { from: 'A', to: 'B', amount: 1, signature: 'sig1', blockTime: 1000 },
        { from: 'A', to: 'B', amount: 2, signature: 'sig2', blockTime: 2000 },
        { from: 'A', to: 'B', amount: 3, signature: 'sig3', blockTime: 3000 },
      ],
      instructions: [],
      counterparties: new Set(['B']),
      labels: new Map(),
      tokenAccounts: [],
      timeRange: { earliest: 1000, latest: 3000 },
      transactionCount: 3,
    };

    const signals = evaluateHeuristics(mockContext);
    const counterpartySignal = signals.find(s => s.id === 'counterparty-reuse');

    expect(counterpartySignal).toBeDefined();
    expect(counterpartySignal?.severity).toBe('HIGH');
  });
});
```

## Advanced Use Cases

### Comparative Analysis

```typescript
import { scan, RPCClient } from 'solana-privacy-scanner-core';

async function compareWallets(addresses: string[], rpcUrl: string) {
  const rpc = new RPCClient(rpcUrl);

  const reports = await Promise.all(
    addresses.map(address =>
      scan({
        target: address,
        targetType: 'wallet',
        rpcClient: rpc,
        maxSignatures: 50,
      })
    )
  );

  // Find best wallet (lowest risk)
  const sorted = reports.sort((a, b) => {
    const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
    return riskOrder[a.overallRisk] - riskOrder[b.overallRisk];
  });

  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
    all: sorted,
  };
}
```

### Historical Tracking

```typescript
interface ScanHistory {
  timestamp: number;
  risk: string;
  signalCount: number;
}

const history: Map<string, ScanHistory[]> = new Map();

async function trackWallet(address: string, rpcUrl: string) {
  const rpc = new RPCClient(rpcUrl);
  
  const report = await scan({
    target: address,
    targetType: 'wallet',
    rpcClient: rpc,
    maxSignatures: 50,
  });

  const record = {
    timestamp: Date.now(),
    risk: report.overallRisk,
    signalCount: report.signals.length,
  };

  const existing = history.get(address) || [];
  history.set(address, [...existing, record]);

  // Detect risk increase
  if (existing.length > 0) {
    const previous = existing[existing.length - 1];
    if (record.signalCount > previous.signalCount) {
      console.log(`⚠️ Risk increased for ${address}`);
    }
  }

  return record;
}
```

## Error Handling Patterns

### Retry Logic

```typescript
async function scanWithRetry(
  address: string,
  rpcUrl: string,
  maxRetries = 3
) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const rpc = new RPCClient(rpcUrl);
      return await scan({
        target: address,
        targetType: 'wallet',
        rpcClient: rpc,
        maxSignatures: 50,
      });
    } catch (error) {
      lastError = error;
      console.log(`Retry ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError;
}
```

### Graceful Degradation

```typescript
async function scanOrDefault(address: string, rpcUrl: string) {
  try {
    const rpc = new RPCClient(rpcUrl);
    return await scan({
      target: address,
      targetType: 'wallet',
      rpcClient: rpc,
      maxSignatures: 50,
    });
  } catch (error) {
    console.error('Scan failed, returning default report');
    
    // Return minimal report
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      targetType: 'wallet' as const,
      target: address,
      overallRisk: 'LOW' as const,
      signals: [],
      summary: {
        totalSignals: 0,
        highRiskSignals: 0,
        mediumRiskSignals: 0,
        lowRiskSignals: 0,
        transactionsAnalyzed: 0,
      },
      mitigations: ['Unable to analyze - try again later'],
      knownEntities: [],
    };
  }
}
```

## Next Steps

- **[API Reference](/docs/library/usage#api-reference)** - Complete API documentation
- **[CLI Usage](/docs/cli/quickstart)** - Command-line tool
- **[Understanding Reports](/docs/reports/risk-levels)** - Interpret results
