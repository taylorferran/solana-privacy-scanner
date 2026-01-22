# API Reference

Complete reference for `solana-privacy-scanner-core` library.

## Installation

```bash
npm install solana-privacy-scanner-core
```

## Core Imports

```typescript
import {
  // RPC Client
  RPCClient,

  // Data Collection
  collectWalletData,
  collectTransactionData,
  collectProgramData,

  // Normalization
  normalizeWalletData,
  normalizeTransactionData,
  normalizeProgramData,

  // Report Generation
  generateReport,
  evaluateHeuristics,

  // Label Provider
  createDefaultLabelProvider,
  StaticLabelProvider,

  // Heuristics
  detectFeePayerReuse,
  detectSignerOverlap,
  detectMemoExposure,
  detectAddressReuse,
  detectKnownEntityInteraction,
  detectCounterpartyReuse,
  detectInstructionFingerprinting,
  detectTokenAccountLifecycle,
  detectTimingPatterns,
  detectAmountReuse,
  detectBalanceTraceability,

  // Types
  type ScanContext,
  type PrivacyReport,
  type PrivacySignal,
  type RiskLevel,
  type RPCClientConfig,
} from 'solana-privacy-scanner-core';
```

---

## RPCClient

The RPC client handles all Solana blockchain data fetching with automatic retries, rate limiting, and error handling.

### Constructor

```typescript
new RPCClient(config?: RPCClientConfig | string)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config` | `RPCClientConfig \| string` | No | Configuration object or RPC URL string. Uses default QuickNode RPC if omitted. |

**RPCClientConfig Interface:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `rpcUrl` | `string` | QuickNode default | Custom RPC endpoint URL |
| `maxRetries` | `number` | `3` | Maximum retry attempts for failed requests |
| `retryDelay` | `number` | `1000` | Initial delay for exponential backoff (ms) |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |
| `maxConcurrency` | `number` | `10` | Maximum concurrent requests |
| `debug` | `boolean` | `false` | Enable debug logging |

**Examples:**

```typescript
// Use default RPC (no configuration required)
const rpc = new RPCClient();

// Use custom RPC URL (string)
const rpc = new RPCClient('https://api.mainnet-beta.solana.com');

// Use custom configuration
const rpc = new RPCClient({
  rpcUrl: process.env.QUICKNODE_RPC_URL,
  maxRetries: 5,
  timeout: 60000,
  debug: true
});
```

### Methods

#### `getSignaturesForAddress()`

```typescript
async getSignaturesForAddress(
  address: string,
  options?: {
    limit?: number;
    before?: string;
    until?: string;
  }
): Promise<ConfirmedSignatureInfo[]>
```

Fetches transaction signatures for an address.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | `string` | Yes | Solana wallet address |
| `options.limit` | `number` | No | Maximum number of signatures to fetch |
| `options.before` | `string` | No | Fetch signatures before this transaction |
| `options.until` | `string` | No | Fetch signatures until this transaction |

---

#### `getTransaction()`

```typescript
async getTransaction(
  signature: string,
  options?: { maxSupportedTransactionVersion?: number }
): Promise<ParsedTransactionWithMeta | null>
```

Fetches a single transaction by signature.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `signature` | `string` | Yes | Transaction signature |
| `options.maxSupportedTransactionVersion` | `number` | No | Max version (default: 0) |

---

#### `getTransactions()`

```typescript
async getTransactions(
  signatures: string[],
  options?: { maxSupportedTransactionVersion?: number }
): Promise<Array<ParsedTransactionWithMeta | null>>
```

Fetches multiple transactions in parallel.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `signatures` | `string[]` | Yes | Array of transaction signatures |
| `options.maxSupportedTransactionVersion` | `number` | No | Max version (default: 0) |

---

#### `getTokenAccountsByOwner()`

```typescript
async getTokenAccountsByOwner(
  ownerAddress: string,
  mintAddress?: string
): Promise<{ value: TokenAccountBalancePair[] }>
```

Fetches SPL token accounts owned by an address.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ownerAddress` | `string` | Yes | Wallet address |
| `mintAddress` | `string` | No | Filter by specific token mint |

---

#### `getProgramAccounts()`

```typescript
async getProgramAccounts(
  programId: string,
  config?: any
): Promise<Array<{ pubkey: PublicKey; account: AccountInfo<Buffer> }>>
```

Fetches all accounts owned by a program.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `programId` | `string` | Yes | Program ID |
| `config` | `any` | No | RPC configuration (encoding, filters, etc.) |

---

#### `getAccountInfo()`

```typescript
async getAccountInfo(address: string): Promise<AccountInfo<Buffer> | null>
```

Fetches account information.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | `string` | Yes | Account address |

---

#### `getMultipleAccountsInfo()`

```typescript
async getMultipleAccountsInfo(
  addresses: string[]
): Promise<Array<AccountInfo<Buffer> | null>>
```

Fetches multiple account infos in one request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `addresses` | `string[]` | Yes | Array of account addresses |

---

#### `getConnection()`

```typescript
getConnection(): Connection
```

Returns the underlying Solana `Connection` object. Use sparingly - prefer wrapped methods.

---

#### `getStats()`

```typescript
getStats(): { activeRequests: number; queueLength: number }
```

Returns current rate limiter statistics.

---

#### `healthCheck()`

```typescript
async healthCheck(): Promise<boolean>
```

Checks if the RPC connection is healthy.

---

## Data Collection Functions

These functions fetch raw blockchain data from Solana RPC.

### `collectWalletData()`

```typescript
async function collectWalletData(
  client: RPCClient,
  address: string,
  options?: WalletCollectionOptions
): Promise<RawWalletData>
```

Collects all transaction and token account data for a wallet.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client` | `RPCClient` | Yes | RPC client instance |
| `address` | `string` | Yes | Wallet address to scan |
| `options` | `WalletCollectionOptions` | No | Collection options |

**WalletCollectionOptions:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxSignatures` | `number` | `100` | Maximum signatures to fetch |
| `includeTokenAccounts` | `boolean` | `true` | Include SPL token accounts |

**Returns:** `Promise<RawWalletData>`

**Example:**

```typescript
const rpc = new RPCClient();
const rawData = await collectWalletData(rpc, 'WALLET_ADDRESS', {
  maxSignatures: 200,
  includeTokenAccounts: true
});
```

---

### `collectTransactionData()`

```typescript
async function collectTransactionData(
  client: RPCClient,
  signature: string
): Promise<RawTransactionData>
```

Collects data for a single transaction.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client` | `RPCClient` | Yes | RPC client instance |
| `signature` | `string` | Yes | Transaction signature |

**Returns:** `Promise<RawTransactionData>`

**Example:**

```typescript
const rawData = await collectTransactionData(rpc, 'TRANSACTION_SIGNATURE');
```

---

### `collectProgramData()`

```typescript
async function collectProgramData(
  client: RPCClient,
  programId: string,
  options?: ProgramCollectionOptions
): Promise<RawProgramData>
```

Collects data for a program (accounts and related transactions).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client` | `RPCClient` | Yes | RPC client instance |
| `programId` | `string` | Yes | Program ID to analyze |
| `options` | `ProgramCollectionOptions` | No | Collection options |

**ProgramCollectionOptions:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxAccounts` | `number` | `100` | Maximum accounts to fetch |
| `maxTransactions` | `number` | `50` | Maximum related transactions to fetch |

**Returns:** `Promise<RawProgramData>`

**Example:**

```typescript
const rawData = await collectProgramData(rpc, 'PROGRAM_ID', {
  maxAccounts: 50,
  maxTransactions: 100
});
```

---

## Normalization Functions

These functions convert raw blockchain data into standardized `ScanContext` objects for analysis.

### `normalizeWalletData()`

```typescript
function normalizeWalletData(
  rawData: RawWalletData,
  labelProvider?: LabelProvider
): ScanContext
```

Normalizes wallet data into a scan context.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rawData` | `RawWalletData` | Yes | Raw wallet data from collector |
| `labelProvider` | `LabelProvider` | No | Label provider for known entity detection |

**Returns:** `ScanContext`

**Example:**

```typescript
const labels = createDefaultLabelProvider();
const context = normalizeWalletData(rawData, labels);
```

---

### `normalizeTransactionData()`

```typescript
function normalizeTransactionData(
  rawData: RawTransactionData,
  labelProvider?: LabelProvider
): ScanContext
```

Normalizes transaction data into a scan context.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rawData` | `RawTransactionData` | Yes | Raw transaction data from collector |
| `labelProvider` | `LabelProvider` | No | Label provider for known entity detection |

**Returns:** `ScanContext`

**Example:**

```typescript
const context = normalizeTransactionData(rawData, labels);
```

---

### `normalizeProgramData()`

```typescript
function normalizeProgramData(
  rawData: RawProgramData,
  labelProvider?: LabelProvider
): ScanContext
```

Normalizes program data into a scan context.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rawData` | `RawProgramData` | Yes | Raw program data from collector |
| `labelProvider` | `LabelProvider` | No | Label provider for known entity detection |

**Returns:** `ScanContext`

**Example:**

```typescript
const context = normalizeProgramData(rawData, labels);
```

---

## Report Generation

### `generateReport()`

```typescript
function generateReport(context: ScanContext): PrivacyReport
```

Generates a complete privacy report from a scan context. This is the main function that orchestrates all heuristics and produces the final report.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `context` | `ScanContext` | Yes | Normalized scan context |

**Returns:** `PrivacyReport`

**PrivacyReport Structure:**

| Property | Type | Description |
|----------|------|-------------|
| `version` | `string` | Report schema version |
| `timestamp` | `number` | Report generation timestamp (ms) |
| `targetType` | `'wallet' \| 'transaction' \| 'program'` | Type of scan performed |
| `target` | `string` | Address/signature/program ID scanned |
| `overallRisk` | `'LOW' \| 'MEDIUM' \| 'HIGH'` | Aggregated risk level |
| `signals` | `PrivacySignal[]` | Array of detected privacy risks |
| `summary` | `object` | Summary statistics |
| `summary.totalSignals` | `number` | Total number of signals |
| `summary.highRiskSignals` | `number` | Count of HIGH severity signals |
| `summary.mediumRiskSignals` | `number` | Count of MEDIUM severity signals |
| `summary.lowRiskSignals` | `number` | Count of LOW severity signals |
| `summary.transactionsAnalyzed` | `number` | Number of transactions analyzed |
| `mitigations` | `string[]` | Recommended privacy improvements |
| `knownEntities` | `Label[]` | Detected known entities (CEXs, bridges, etc.) |

**Example:**

```typescript
const report = generateReport(context);

console.log(`Overall Risk: ${report.overallRisk}`);
console.log(`Total Signals: ${report.summary.totalSignals}`);
console.log(`Transactions Analyzed: ${report.summary.transactionsAnalyzed}`);

// Check for specific signal types
const hasFeePayerReuse = report.signals.some(s => s.id === 'fee-payer-never-self');
```

---

### `evaluateHeuristics()`

```typescript
function evaluateHeuristics(context: ScanContext): PrivacySignal[]
```

Evaluates all heuristics against a scan context and returns detected signals. This is used internally by `generateReport()` but can be called directly for custom workflows.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `context` | `ScanContext` | Yes | Normalized scan context |

**Returns:** `PrivacySignal[]` - Array of privacy signals sorted by severity

**PrivacySignal Structure:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique signal identifier |
| `name` | `string` | Human-readable signal name |
| `severity` | `'LOW' \| 'MEDIUM' \| 'HIGH'` | Risk severity level |
| `confidence` | `number` | Confidence score (0-1) |
| `reason` | `string` | Explanation of the privacy risk |
| `evidence` | `Evidence[]` | Supporting evidence data |
| `mitigation` | `string` (optional) | Specific remediation advice |

**Example:**

```typescript
const signals = evaluateHeuristics(context);

// Filter HIGH severity signals
const criticalSignals = signals.filter(s => s.severity === 'HIGH');

// Get all fee payer related issues
const feePayerSignals = signals.filter(s => s.id.includes('fee-payer'));
```

---

## Label Provider

The label provider identifies known entities (exchanges, bridges, etc.) in scan results.

### `createDefaultLabelProvider()`

```typescript
function createDefaultLabelProvider(): StaticLabelProvider
```

Creates a label provider with the built-in known addresses database.

**Returns:** `StaticLabelProvider`

**Example:**

```typescript
const labels = createDefaultLabelProvider();
const context = normalizeWalletData(rawData, labels);
```

---

### `StaticLabelProvider`

Class for loading and querying known address labels.

#### Constructor

```typescript
new StaticLabelProvider(labelsPath?: string)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `labelsPath` | `string` | No | Custom path to labels JSON file. Uses built-in database if omitted. |

---

#### Methods

##### `lookup()`

```typescript
lookup(address: string): Label | null
```

Looks up a single address.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | `string` | Yes | Solana address to look up |

**Returns:** `Label | null`

---

##### `lookupMany()`

```typescript
lookupMany(addresses: string[]): Map<string, Label>
```

Looks up multiple addresses at once.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `addresses` | `string[]` | Yes | Array of addresses to look up |

**Returns:** `Map<string, Label>`

---

##### `getAllLabels()`

```typescript
getAllLabels(): Label[]
```

Returns all loaded labels.

**Returns:** `Label[]`

---

##### `getCount()`

```typescript
getCount(): number
```

Returns the number of loaded labels.

**Returns:** `number`

---

**Label Structure:**

| Property | Type | Description |
|----------|------|-------------|
| `address` | `string` | Solana address |
| `name` | `string` | Entity name (e.g., "Binance Hot Wallet") |
| `type` | `'exchange' \| 'bridge' \| 'protocol' \| 'service' \| 'other'` | Entity type |
| `description` | `string` (optional) | Additional information |
| `relatedAddresses` | `string[]` (optional) | Related addresses |

**Example:**

```typescript
// Use custom labels
const customLabels = new StaticLabelProvider('./my-labels.json');

// Query labels
const label = customLabels.lookup('ADDRESS');
if (label) {
  console.log(`${label.name} (${label.type})`);
}

// Get all exchange addresses
const allLabels = customLabels.getAllLabels();
const exchanges = allLabels.filter(l => l.type === 'exchange');
```

---

## Heuristic Functions

All heuristics are pure functions that take a `ScanContext` and return `PrivacySignal[]`. These can be called individually for custom analysis workflows.

### Solana-Specific Heuristics

#### `detectFeePayerReuse()`

```typescript
function detectFeePayerReuse(context: ScanContext): PrivacySignal[]
```

Detects when external addresses pay transaction fees, creating strong linkage between accounts.

**Signal IDs:**
- `fee-payer-never-self` - Target never pays own fees (HIGH)
- `fee-payer-external` - External fee payers detected (HIGH/MEDIUM)

---

#### `detectSignerOverlap()`

```typescript
function detectSignerOverlap(context: ScanContext): PrivacySignal[]
```

Identifies repeated signer combinations across transactions.

**Signal IDs:**
- `signer-repeated` - Same signers appear together multiple times (HIGH/MEDIUM)
- `signer-set-reuse` - Identical signer sets detected (HIGH)

---

#### `detectMemoExposure()`

```typescript
function detectMemoExposure(context: ScanContext): PrivacySignal[]
```

Scans transaction memos for personally identifiable information.

**Signal IDs:**
- `memo-pii-exposure` - PII detected in memos (HIGH)
- `memo-descriptive-content` - Descriptive memo content (MEDIUM)
- `memo-usage` - Memos used (LOW)

---

#### `detectAddressReuse()`

```typescript
function detectAddressReuse(context: ScanContext): PrivacySignal[]
```

Analyzes address usage patterns and diversity.

**Signal IDs:**
- `address-high-diversity` - Many unique counterparties (LOW)
- `address-moderate-diversity` - Moderate diversity (MEDIUM)
- `address-long-term-usage` - Long-term address usage (LOW)

---

#### `detectInstructionFingerprinting()`

```typescript
function detectInstructionFingerprinting(context: ScanContext): PrivacySignal[]
```

Detects unique behavioral patterns from instruction sequences.

**Signal IDs:**
- `instruction-sequence-pattern` - Repeated instruction patterns (MEDIUM)
- `program-usage-profile` - Unique program usage profile (MEDIUM)

---

#### `detectTokenAccountLifecycle()`

```typescript
function detectTokenAccountLifecycle(context: ScanContext): PrivacySignal[]
```

Tracks token account creation/closure patterns and rent refunds.

**Signal IDs:**
- `token-account-churn` - High token account turnover (MEDIUM)
- `rent-refund-clustering` - Rent refunds link accounts (MEDIUM)

---

### Behavioral Heuristics

#### `detectKnownEntityInteraction()`

```typescript
function detectKnownEntityInteraction(context: ScanContext): PrivacySignal[]
```

Identifies interactions with known entities (exchanges, bridges, etc.).

**Signal IDs:**
- `known-entity-exchange` - CEX interaction (HIGH)
- `known-entity-bridge` - Bridge interaction (MEDIUM)
- `known-entity-other` - Other known entity (varies)

---

#### `detectCounterpartyReuse()`

```typescript
function detectCounterpartyReuse(context: ScanContext): PrivacySignal[]
```

Tracks repeated interactions with the same counterparties.

**Signal IDs:**
- `counterparty-reuse` - Repeated counterparty patterns (varies)
- `pda-reuse` - Repeated PDA interactions (varies)

---

#### `detectTimingPatterns()`

```typescript
function detectTimingPatterns(context: ScanContext): PrivacySignal[]
```

Analyzes transaction timing for correlation patterns.

**Signal IDs:**
- `timing-burst` - Transaction bursts detected (MEDIUM)
- `timing-regular-interval` - Regular timing patterns (MEDIUM)
- `timing-timezone-pattern` - Timezone patterns (LOW)

---

### Traditional Heuristics

#### `detectAmountReuse()`

```typescript
function detectAmountReuse(context: ScanContext): PrivacySignal[]
```

Detects repeated transaction amounts (less critical on Solana).

**Signal IDs:**
- `amount-reuse` - Repeated amounts detected (LOW)

---

#### `detectBalanceTraceability()`

```typescript
function detectBalanceTraceability(context: ScanContext): PrivacySignal[]
```

Analyzes balance flow patterns for traceability.

**Signal IDs:**
- `balance-matching-pairs` - Matching transfer pairs (MEDIUM)
- `balance-sequential-similar` - Sequential similar amounts (MEDIUM)
- `balance-full-movement` - Full balance movements (MEDIUM)

---

## Types

### `ScanContext`

The normalized input to all heuristics and report generation.

```typescript
interface ScanContext {
  target: string;                      // Address/signature/program being scanned
  targetType: 'wallet' | 'transaction' | 'program';
  transfers: Transfer[];               // SOL and SPL token transfers
  instructions: NormalizedInstruction[]; // Program instructions
  counterparties: Set<string>;         // Unique addresses interacted with
  labels: Map<string, Label>;          // Known entity labels
  tokenAccounts: Array<{
    mint: string;
    address: string;
    balance: number;
  }>;
  timeRange: {
    earliest: number | null;           // Unix timestamp
    latest: number | null;
  };
  transactionCount: number;

  // Solana-specific fields
  transactions: TransactionMetadata[]; // Fee payers, signers, memos
  tokenAccountEvents: TokenAccountEvent[]; // Create/close events
  pdaInteractions: PDAInteraction[];   // Program-derived address usage
  feePayers: Set<string>;              // Unique fee payers
  signers: Set<string>;                // Unique signers
  programs: Set<string>;               // Programs interacted with
}
```

---

### `RiskLevel`

```typescript
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
```

---

## Complete Workflow Example

```typescript
import {
  RPCClient,
  collectWalletData,
  normalizeWalletData,
  generateReport,
  createDefaultLabelProvider,
  type PrivacyReport
} from 'solana-privacy-scanner-core';

async function analyzeWallet(address: string): Promise<PrivacyReport> {
  // 1. Initialize RPC client
  const rpc = new RPCClient({
    rpcUrl: process.env.SOLANA_RPC_URL,
    maxRetries: 5,
    debug: false
  });

  // 2. Initialize label provider
  const labels = createDefaultLabelProvider();

  // 3. Collect raw blockchain data
  const rawData = await collectWalletData(rpc, address, {
    maxSignatures: 200,
    includeTokenAccounts: true
  });

  // 4. Normalize data into scan context
  const context = normalizeWalletData(rawData, labels);

  // 5. Generate privacy report
  const report = generateReport(context);

  return report;
}

// Usage
const report = await analyzeWallet('YOUR_WALLET_ADDRESS');

console.log(`Risk: ${report.overallRisk}`);
console.log(`Signals: ${report.summary.totalSignals}`);
console.log(`HIGH: ${report.summary.highRiskSignals}`);
console.log(`MEDIUM: ${report.summary.mediumRiskSignals}`);
console.log(`LOW: ${report.summary.lowRiskSignals}`);

// Access specific data
report.signals.forEach(signal => {
  console.log(`[${signal.severity}] ${signal.name}: ${signal.reason}`);
});

report.mitigations.forEach(mitigation => {
  console.log(`- ${mitigation}`);
});
```

---

## Next Steps

- **[Examples](./examples)** - Practical usage examples
- **[Custom Heuristics](../advanced/custom-heuristics)** - Extend the scanner
- **[CLI Usage](../cli/quickstart)** - Command-line interface
