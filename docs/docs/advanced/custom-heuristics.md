---
sidebar_position: 5
---

# Custom Heuristics

Extend the scanner with your own privacy analysis rules.

## Why Custom Heuristics?

The default heuristics cover general Solana privacy patterns, but your protocol may have specific requirements:

- **Privacy protocols** - Detect misuse of your SDK
- **DeFi protocols** - Check for MEV exposure patterns
- **NFT marketplaces** - Identify sniping behavior
- **DAOs** - Detect voting pattern leakage
- **Compliance** - Enforce custom privacy policies

## How It Works

### ScanContext Structure

Custom heuristics receive a `ScanContext` with all analyzed data:

```typescript
interface ScanContext {
  // Basic info
  address: string;
  type: 'wallet' | 'transaction' | 'program';
  
  // Transaction data
  transactions: Transaction[];
  transfers: Transfer[];
  
  // Solana-specific
  feePayers: Set<string>;           // All fee payers used
  signers: Set<string>;             // All signers across txs
  pdaInteractions: PDAInteraction[]; // PDA usage patterns
  tokenAccountEvents: TokenAccountEvent[]; // Create/close events
  programs: ProgramInteraction[];   // Programs interacted with
  
  // Pattern analysis
  counterparties: Set<string>;      // All addresses interacted with
  amounts: Map<number, number>;     // Amount frequency
  timeGaps: number[];               // Time between transactions
  
  // Known entities
  knownEntities: KnownEntity[];     // CEXs, bridges, etc.
}
```

### Writing a Heuristic

Heuristics are functions that return `PrivacySignal[]`:

```typescript
import { ScanContext, PrivacySignal } from 'solana-privacy-scanner-core';

export function detectCustomPattern(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];
  
  // Your detection logic
  if (/* condition */) {
    signals.push({
      id: 'custom-pattern-name',
      name: 'Human Readable Name',
      severity: 'HIGH',        // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      confidence: 0.85,        // 0.0 to 1.0
      category: 'pattern',     // Optional grouping
      reason: 'What was detected and why it matters',
      evidence: [
        {
          type: 'transaction',
          data: { signature: 'xxx...' },
          description: 'Supporting evidence'
        }
      ],
      mitigation: 'How to fix or avoid this issue'
    });
  }
  
  return signals;
}
```

### Integrating Custom Heuristics

```typescript
import { 
  RPCClient,
  collectWalletData,
  normalizeWalletData,
  generateReport,
  createDefaultLabelProvider
} from 'solana-privacy-scanner-core';
import { detectCustomPattern } from './my-heuristics';

const rpc = new RPCClient();
const labels = createDefaultLabelProvider();

// Collect and normalize data
const raw = await collectWalletData(rpc, address);
const context = normalizeWalletData(raw, labels);

// Run default heuristics
const defaultReport = generateReport(context);

// Run custom heuristics
const customSignals = detectCustomPattern(context);

// Combine results
const fullReport = {
  ...defaultReport,
  signals: [
    ...defaultReport.signals,
    ...customSignals
  ]
};
```

## Example: Privacy Protocol

Detect when users exit your privacy pool to a known exchange:

```typescript
import { ScanContext, PrivacySignal } from 'solana-privacy-scanner-core';

export function detectPrivacyPoolMisuse(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];
  
  // Find your protocol's program ID
  const PRIVACY_POOL_PROGRAM = 'YourProgramID...';
  
  // Check transactions for pool interactions
  for (const tx of context.transactions || []) {
    const hasPoolInteraction = tx.programs?.includes(PRIVACY_POOL_PROGRAM);
    
    if (hasPoolInteraction) {
      // Check if any known entities are involved
      const involvedAddresses = new Set([
        ...(tx.counterparties || []),
        tx.feePayer
      ]);
      
      const exchangeInteraction = context.knownEntities.find(entity =>
        entity.type === 'exchange' && 
        involvedAddresses.has(entity.address)
      );
      
      if (exchangeInteraction) {
        signals.push({
          id: 'privacy-pool-to-exchange',
          name: 'Privacy Pool to Exchange',
          severity: 'CRITICAL',
          confidence: 0.95,
          category: 'protocol-misuse',
          reason: `Privacy pool exit directly to ${exchangeInteraction.name}. ` +
                  `This defeats the privacy guarantees of the pool.`,
          evidence: [{
            type: 'transaction',
            data: { 
              signature: tx.signature,
              exchange: exchangeInteraction.name
            },
            description: 'Direct pool exit to known exchange'
          }],
          mitigation: 'Exit privacy pool to a clean wallet first, ' +
                      'wait random time, then transfer to exchange.'
        });
      }
    }
  }
  
  return signals;
}
```

## Example: DeFi Protocol

Check for MEV-vulnerable transaction patterns:

```typescript
export function detectMEVExposure(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];
  
  const YOUR_AMM_PROGRAM = 'YourAMMProgramID...';
  
  // Find transactions with your program
  const ammTxs = (context.transactions || []).filter(tx =>
    tx.programs?.includes(YOUR_AMM_PROGRAM)
  );
  
  for (let i = 0; i < ammTxs.length - 1; i++) {
    const current = ammTxs[i];
    const next = ammTxs[i + 1];
    
    // Check for predictable timing
    const timeDiff = (next.blockTime || 0) - (current.blockTime || 0);
    const isPredictable = timeDiff < 5; // Within 5 seconds
    
    // Check for predictable amounts
    const currentAmount = current.transfers?.[0]?.amount || 0;
    const nextAmount = next.transfers?.[0]?.amount || 0;
    const isRoundNumber = nextAmount % 1000000 === 0;
    
    if (isPredictable && isRoundNumber) {
      signals.push({
        id: 'mev-exposure-predictable-swap',
        name: 'MEV Exposure: Predictable Swap Pattern',
        severity: 'MEDIUM',
        confidence: 0.7,
        category: 'mev',
        reason: 'Swaps occur at predictable intervals with round amounts, ' +
                'making them vulnerable to frontrunning.',
        evidence: [{
          type: 'pattern',
          data: { 
            timeDiff,
            amount: nextAmount,
            txCount: 2
          },
          description: `Swaps ${timeDiff}s apart with round amounts`
        }],
        mitigation: 'Use random time delays and non-round amounts. ' +
                    'Consider using a MEV-protected RPC.'
      });
    }
  }
  
  return signals;
}
```

## Example: NFT Marketplace

Detect sniping patterns that reveal buyer behavior:

```typescript
export function detectNFTSnipingPattern(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];
  
  const MARKETPLACE_PROGRAM = 'YourMarketplaceProgramID...';
  
  // Find purchase transactions
  const purchases = (context.transactions || []).filter(tx =>
    tx.programs?.includes(MARKETPLACE_PROGRAM)
  );
  
  if (purchases.length < 2) return signals;
  
  // Analyze timing between purchases
  const timeDiffs = [];
  for (let i = 0; i < purchases.length - 1; i++) {
    const diff = (purchases[i + 1].blockTime || 0) - (purchases[i].blockTime || 0);
    timeDiffs.push(diff);
  }
  
  // Check for rapid succession (sniping behavior)
  const rapidPurchases = timeDiffs.filter(diff => diff < 60).length;
  const snipingRatio = rapidPurchases / timeDiffs.length;
  
  if (snipingRatio > 0.7) {
    signals.push({
      id: 'nft-sniping-pattern',
      name: 'NFT Sniping Pattern Detected',
      severity: 'MEDIUM',
      confidence: 0.8,
      category: 'behavioral',
      reason: `${rapidPurchases} purchases within 60 seconds reveals ` +
              `bot or sniping behavior, exposing trading strategy.`,
      evidence: [{
        type: 'timing',
        data: { 
          rapidPurchases,
          totalPurchases: purchases.length,
          avgTimeDiff: timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length
        },
        description: 'Rapid purchase pattern indicating sniping'
      }],
      mitigation: 'Use random delays between purchases. ' +
                  'Consider using multiple wallets to distribute activity.'
    });
  }
  
  return signals;
}
```

## Example: DAO Governance

Detect voting patterns that leak member identity:

```typescript
export function detectVotingPatternLeak(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];
  
  const DAO_PROGRAM = 'YourDAOProgramID...';
  
  // Find voting transactions
  const votes = (context.transactions || []).filter(tx =>
    tx.programs?.includes(DAO_PROGRAM)
  );
  
  if (votes.length < 3) return signals;
  
  // Check for consistent timing pattern
  const voteHours = votes.map(tx => {
    const date = new Date((tx.blockTime || 0) * 1000);
    return date.getUTCHours();
  });
  
  // Count most common voting hour
  const hourCounts = new Map<number, number>();
  voteHours.forEach(hour => {
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });
  
  const maxCount = Math.max(...Array.from(hourCounts.values()));
  const consistency = maxCount / votes.length;
  
  if (consistency > 0.6) {
    const mostCommonHour = Array.from(hourCounts.entries())
      .find(([_, count]) => count === maxCount)?.[0];
    
    signals.push({
      id: 'voting-timing-pattern',
      name: 'Consistent Voting Time Pattern',
      severity: 'LOW',
      confidence: 0.6,
      category: 'behavioral',
      reason: `${Math.round(consistency * 100)}% of votes occur around ` +
              `${mostCommonHour}:00 UTC, potentially revealing timezone/identity.`,
      evidence: [{
        type: 'timing',
        data: { 
          mostCommonHour,
          consistency,
          voteCount: votes.length
        },
        description: 'Predictable voting time pattern'
      }],
      mitigation: 'Vote at varied times. Use scheduled transactions ' +
                  'or delegate voting to avoid timing correlation.'
    });
  }
  
  return signals;
}
```

## Testing Custom Heuristics

Always test your heuristics:

```typescript
import { describe, test, expect } from 'vitest';
import { detectCustomPattern } from './my-heuristics';
import type { ScanContext } from 'solana-privacy-scanner-core';

describe('Custom Heuristic', () => {
  test('detects the pattern', () => {
    const mockContext: ScanContext = {
      address: 'test',
      type: 'wallet',
      transactions: [/* mock data */],
      // ... other required fields
    };
    
    const signals = detectCustomPattern(mockContext);
    
    expect(signals).toHaveLength(1);
    expect(signals[0].id).toBe('expected-id');
    expect(signals[0].severity).toBe('HIGH');
  });
  
  test('returns empty for clean data', () => {
    const cleanContext: ScanContext = {
      address: 'test',
      type: 'wallet',
      transactions: [],
      // ... other fields
    };
    
    const signals = detectCustomPattern(cleanContext);
    
    expect(signals).toHaveLength(0);
  });
});
```

## Performance Considerations

### Optimize Loops

```typescript
// Bad: Nested loops = O(n²)
for (const tx1 of transactions) {
  for (const tx2 of transactions) {
    // compare
  }
}

// Good: Single pass with Set = O(n)
const seen = new Set();
for (const tx of transactions) {
  if (seen.has(tx.feePayer)) {
    // handle duplicate
  }
  seen.add(tx.feePayer);
}
```

### Early Return

```typescript
export function detectPattern(context: ScanContext): PrivacySignal[] {
  // Check prerequisites first
  if (!context.transactions || context.transactions.length < 2) {
    return []; // Early return if not enough data
  }
  
  // Expensive analysis only if needed
  // ...
}
```

### Cache Expensive Computations

```typescript
// Compute once, use multiple times
const feePayers = new Set(
  context.transactions.map(tx => tx.feePayer)
);

const uniqueCount = feePayers.size;
const reuseDetected = uniqueCount < context.transactions.length;
```

## Sharing Custom Heuristics

Consider publishing your heuristics:

1. **Open source** - Share on GitHub
2. **NPM package** - Publish for easy install
3. **Documentation** - Explain what it detects
4. **Tests** - Include test cases
5. **Examples** - Show real-world usage

```typescript
// Example package structure
my-protocol-privacy-heuristics/
├── src/
│   ├── index.ts
│   └── heuristics/
│       ├── pool-misuse.ts
│       ├── mev-exposure.ts
│       └── timing-leak.ts
├── tests/
│   └── heuristics.test.ts
├── package.json
└── README.md
```

## Best Practices

### 1. Clear Naming

```typescript
// Bad
export function check1(ctx: ScanContext): PrivacySignal[] { }

// Good
export function detectPrivacyPoolToExchangeLeak(
  context: ScanContext
): PrivacySignal[] { }
```

### 2. Descriptive Evidence

```typescript
evidence: [{
  type: 'transaction',
  data: {
    signature: tx.signature,
    amount: transfer.amount,
    recipient: transfer.to,
    recipientLabel: 'Binance Hot Wallet'
  },
  description: 'Direct transfer of 10 SOL to Binance immediately after pool exit'
}]
```

### 3. Actionable Mitigations

```typescript
// Bad
mitigation: 'Fix this issue'

// Good
mitigation: 'Exit privacy pool to intermediate wallet, ' +
            'wait 24-48 hours with random timing, ' +
            'then transfer to exchange in multiple smaller amounts'
```

### 4. Appropriate Severity

- **CRITICAL**: Breaks core privacy guarantees
- **HIGH**: Significant linkability risk
- **MEDIUM**: Moderate privacy concern
- **LOW**: Minor pattern or informational

### 5. Confidence Levels

```typescript
// High confidence: Direct evidence
confidence: 0.9

// Medium confidence: Strong correlation
confidence: 0.7

// Low confidence: Possible pattern
confidence: 0.5
```

## Next Steps

- **[Example Repository](../ci-tools/example)** - See custom heuristics in action
- **[Testing Guide](../ci-tools/testing)** - Write tests for your heuristics
- **[For LLMs](../ci-tools/for-llms)** - Get AI help writing heuristics
