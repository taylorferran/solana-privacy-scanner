# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Solana Privacy Scanner is a monorepo that analyzes Solana wallets, transactions, and programs using on-chain data to produce deterministic privacy risk reports. The scanner uses 11 Solana-native heuristics to detect privacy leaks such as fee payer reuse, signer overlap, memo exposure, and behavioral patterns.

**Current Version:** 0.3.1

## Common Commands

### Building and Testing
```bash
# Build all packages
npm run build

# Run tests in watch mode
npm test

# Run tests in CI mode
npm test -- --run

# Run tests with coverage
npm test -- --coverage

# Type check without building
npm run type-check
```

### Working with Individual Packages
```bash
# Build specific package
cd packages/core && npm run build
cd packages/cli && npm run build
cd packages/ci-tools && npm run build

# Watch mode for development
cd packages/core && npm run dev
```

### Documentation
```bash
# Run documentation site locally
npm run docs:dev

# Build documentation
npm run docs:build

# Preview documentation build
npm run docs:preview
```

### Running Examples
```bash
cd examples
npm install
npm run wallet        # Test wallet scan
npm run transaction   # Test transaction scan
npm run program       # Test program scan
```

### CLI Testing
```bash
# Test CLI locally (from packages/cli)
node dist/index.js scan-wallet <ADDRESS>
node dist/index.js scan-transaction <SIGNATURE>
node dist/index.js scan-program <PROGRAM_ID>
```

## Architecture

### Monorepo Structure
This is a TypeScript monorepo with npm workspaces:
- **packages/core** - Core scanning engine (npm: `solana-privacy-scanner-core`)
- **packages/cli** - Command-line interface (npm: `solana-privacy-scanner`)
- **packages/ci-tools** - CI/CD integration tools (npm: `solana-privacy-scanner-ci-tools`)
- **docs/** - Docusaurus documentation site + web UI
- **examples/** - Usage examples for library integration

### Core Package Architecture

The core package follows a **pipeline architecture** for deterministic scanning:

**1. Data Collection** (`packages/core/src/collectors/`)
- `collectWalletData()` - Fetches on-chain data for wallet scans
- `collectTransactionData()` - Fetches data for single transaction scans
- `collectProgramData()` - Fetches data for program scans
- Returns raw blockchain data via RPC client

**2. Normalization** (`packages/core/src/normalizer/`)
- `normalizeWalletData()` - Converts raw data to ScanContext
- Extracts transfers, instructions, fee payers, signers, counterparties
- Applies known entity labels from LabelProvider
- Outputs standardized `ScanContext` object

**3. Heuristic Evaluation** (`packages/core/src/heuristics/`)
- 11 heuristic functions that analyze `ScanContext`
- Each heuristic returns `PrivacySignal[]` (array of detected privacy risks)
- Heuristics are **pure functions** - same input always produces same output
- Ordered by severity: Solana-specific critical heuristics first, then traditional

**4. Report Generation** (`packages/core/src/scanner/`)
- `generateReport()` orchestrates the pipeline
- `evaluateHeuristics()` runs all heuristics and collects signals
- `calculateOverallRisk()` aggregates signals into LOW/MEDIUM/HIGH
- `generateMitigations()` produces actionable recommendations
- Returns complete `PrivacyReport` object

### Key Types (`packages/core/src/types/`)

**ScanContext** - The normalized input to all heuristics:
```typescript
interface ScanContext {
  target: string;
  targetType: 'wallet' | 'transaction' | 'program';
  transfers: Transfer[];
  instructions: NormalizedInstruction[];
  counterparties: Set<string>;
  labels: Map<string, Label>;
  tokenAccounts: Array<{...}>;
  timeRange: { earliest, latest };
  transactionCount: number;

  // Solana-specific:
  transactions: TransactionMetadata[];  // fee payers, signers, memos
  tokenAccountEvents: TokenAccountEvent[];
  pdaInteractions: PDAInteraction[];
  feePayers: Set<string>;
  signers: Set<string>;
  programs: Set<string>;
}
```

**PrivacySignal** - Output from heuristics (previously RiskSignal):
```typescript
interface PrivacySignal {
  id: string;              // Unique identifier (e.g., 'fee-payer-never-self')
  name: string;            // Human-readable name
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;      // 0-1 score
  reason: string;          // Explanation
  evidence: Evidence[];    // Supporting data
  mitigation?: string;     // Specific remediation advice
}
```

**PrivacyReport** - Final output:
```typescript
interface PrivacyReport {
  version: string;
  timestamp: number;
  targetType: 'wallet' | 'transaction' | 'program';
  target: string;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  signals: PrivacySignal[];
  summary: { totalSignals, highRiskSignals, ... };
  mitigations: string[];
  knownEntities: Label[];
}
```

### The 11 Heuristics

**Solana-Specific (Critical):**
1. **Fee Payer Reuse** - Detects when one wallet pays fees for multiple accounts (CRITICAL)
2. **Signer Overlap** - Identifies repeated signer combinations (HIGH)
3. **Memo Exposure** - Scans memos for PII (HIGH/MEDIUM/LOW)
4. **Address Reuse** - Detects lack of address rotation (MEDIUM/LOW)

**Behavioral Analysis:**
5. **Known Entity Interaction** - Flags CEX/bridge/KYC interactions (VARIES)
6. **Counterparty Reuse** - Tracks repeated counterparty patterns (VARIES)
7. **Instruction Fingerprinting** - Detects unique program usage patterns (MEDIUM)
8. **Token Account Lifecycle** - Traces rent refunds linking accounts (MEDIUM)
9. **Timing Patterns** - Identifies transaction bursts and regularity (MEDIUM)

**Traditional (Adapted):**
10. **Amount Reuse** - Flags repeated amounts (LOW on Solana)
11. **Balance Traceability** - Analyzes balance flow patterns (MEDIUM)

All heuristics must return `PrivacySignal[]` for consistency. Three older heuristics (timing-patterns, balance-traceability, known-entity) were refactored to return arrays.

### RPC Client (`packages/core/src/rpc/`)

The scanner includes a **default public RPC endpoint** powered by QuickNode:
- No configuration required - works out of the box
- Users can override via constructor: `new RPCClient('https://custom-rpc.com')`
- CLI accepts `--rpc` flag
- Environment variable: `SOLANA_RPC`

### Label Provider (`packages/core/src/labels/`)

Known entity detection via `LabelProvider`:
- `known-addresses.json` - **Database at repository root** (78+ addresses)
  - Community-maintained, updated via PRs without package releases
  - Copied to `dist/` during build for published packages
- `createDefaultLabelProvider()` - Factory for default provider
- Extensible: users can provide custom label databases via constructor

## Development Patterns

### Adding a New Heuristic

1. Create `packages/core/src/heuristics/your-heuristic.ts`:
```typescript
import type { ScanContext, PrivacySignal } from '../types/index.js';

export function detectYourPattern(context: ScanContext): PrivacySignal[] {
  const signals: PrivacySignal[] = [];

  // Analysis logic
  if (someCondition) {
    signals.push({
      id: 'your-pattern-id',
      name: 'Your Pattern Name',
      severity: 'HIGH',
      confidence: 0.9,
      reason: 'Explanation of why this is a privacy risk',
      evidence: [
        { type: 'transaction', value: context.transactions[0].signature }
      ],
      mitigation: 'How to fix this issue'
    });
  }

  return signals;
}
```

2. Export from `packages/core/src/heuristics/index.ts`

3. Add to `HEURISTICS` array in `packages/core/src/scanner/index.ts` (maintain priority order)

4. Update `generateMitigations()` to include signal-specific recommendations

5. Add tests in `packages/core/src/heuristics/index.test.ts`

### Testing Philosophy

- **36 tests** covering core functionality
- **Edge case focus** - null, undefined, empty data
- **RPC failure resilience** - graceful degradation when data unavailable
- **Deterministic** - same input must always produce same output
- Run tests before committing: `npm test -- --run`

### CLI Package Structure

The CLI is a thin wrapper around core:
1. Parses arguments via `commander`
2. Creates `RPCClient` with optional custom endpoint
3. Calls appropriate collector (`collectWalletData`, etc.)
4. Normalizes with `normalizeWalletData` + `createDefaultLabelProvider()`
5. Generates report with `generateReport()`
6. Formats output using `chalk` for terminal or JSON for `--json` flag

### CI Tools Package

Provides testing utilities for CI/CD:
- **Simulator** - `simulateTransactionPrivacy()` for analyzing pre-built transactions
- **Matchers** - Vitest/Jest custom matchers (e.g., `toHavePrivacyRisk()`, `toNotLeakUserRelationships()`)
- **Config** - `.privacyrc` policy definitions
- **Init CLI** - `npx privacy-scanner-init` for setup
- **GitHub Action** - Pre-built action for PR checks

## Important Notes

### Solana-First Philosophy
- This scanner is **Solana-native** - heuristics are tailored to Solana's unique architecture
- Fee payer reuse is the most powerful deanonymization vector on Solana
- Account model (not UTXO) means different privacy considerations
- Memos and PDAs are Solana-specific privacy concerns

### Heuristic Return Type
All heuristics must return `PrivacySignal[]` (arrays), not single values. The scanner handles both for backwards compatibility, but new heuristics should always return arrays to support detecting multiple patterns in one pass.

### Evidence Types
Evidence should include:
- `transaction` - transaction signatures
- `address` - wallet addresses
- `pattern` - behavioral patterns
- `amount` - specific values
- `timestamp` - timing data
- `memo` - memo field content
- `program` - program IDs

### Custom Heuristics
The scanner is designed to be extended. Users can:
1. Import `ScanContext` and `PrivacySignal` types
2. Write custom heuristic functions
3. Combine custom signals with standard report
4. See documentation: `/docs/docs/advanced/custom-heuristics.md`

### Known Issues to Avoid
- Never use RPC methods that require `--url` flags with rate limiting concerns
- Balance traceability implementation is simplified - be cautious with complex flows
- Token account event tracking requires careful handling of undefined values
- Timing patterns should account for `null` blockTime values

### Version Management
Version is managed via `packages/core/src/constants.ts` and exported as `VERSION`. CLI and docs reference this single source of truth.

## Documentation Site

Located in `/docs` - powered by Docusaurus:
- **Guide** - Getting started, concepts, QuickNode integration
- **Library** - API reference, usage examples
- **CLI** - Command reference, options
- **Reports** - Understanding heuristics, risk levels
- **Advanced** - Custom heuristics, extensibility
- **Contributing** - Development guide, adding addresses

The web UI for interactive scanning is also hosted here.

## CI/CD Example Repository

`solana-privacy-scanner-example` (separate repo) demonstrates CI integration:
- PR #1 shows privacy leak detection (CI fails)
- PR #2 shows fix (CI passes)
- Uses `solana-privacy-scanner-ci-tools` package
- Example of automated privacy regression testing

## Related Files

- `IMPLEMENTATION_PLAN.md` - Tracks completed features and future roadmap
- `HEURISTIC_ANALYSIS.md` - Deep dive on heuristic design decisions
- `CLAUDE_CODE_PLUGIN_PLAN.md` - Plan for Claude Code plugin integration
- `docs/changelog.md` - Version history
