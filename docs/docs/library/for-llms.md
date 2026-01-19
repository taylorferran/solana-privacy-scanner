# For LLMs - Library Integration

Copy the text below and paste it into your AI coding assistant (Claude, Cursor, ChatGPT, etc.) to get help integrating the Solana Privacy Scanner library into your project.

---

## Prompt for AI Assistants

```
I want to integrate the Solana Privacy Scanner library into my Solana project.

LIBRARY: solana-privacy-scanner-core
VERSION: 0.3.0
DOCUMENTATION: https://sps.guide/library/usage

WHAT IT DOES:
Analyzes Solana wallets, transactions, and programs for privacy risks using 9 Solana-specific heuristics. Returns deterministic privacy reports with risk levels (LOW/MEDIUM/HIGH), detected signals, and mitigation recommendations.

INSTALLATION:
npm install solana-privacy-scanner-core

CORE CONCEPTS:
1. RPCClient - Wrapper for Solana RPC with rate limiting and retry logic
   - No configuration needed - includes default QuickNode RPC endpoint
   
2. Data Collection - Fetch raw on-chain data
   - collectWalletData(client, address, options?) - Get wallet transaction history
   - collectTransactionData(client, signature) - Get single transaction
   - collectProgramData(client, programId, options?) - Get program interactions
   
3. Data Normalization - Transform raw data into analysis-ready format
   - normalizeWalletData(rawData, labelProvider) - Wallet context
   - normalizeTransactionData(rawData, labelProvider) - Transaction context
   - normalizeProgramData(rawData, labelProvider) - Program context
   
4. Label Provider - Identifies known entities (CEXs, bridges, protocols)
   - createDefaultLabelProvider() - Uses built-in known addresses database
   
5. Report Generation - Analyze and produce privacy report
   - generateReport(context) - Runs all heuristics and returns PrivacyReport

BASIC USAGE PATTERN:
```typescript
import { 
  RPCClient, 
  collectWalletData, 
  normalizeWalletData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

// 1. Create RPC client (no configuration needed)
const rpc = new RPCClient();

// 2. Create label provider
const labelProvider = createDefaultLabelProvider();

// 3. Collect raw data
const rawData = await collectWalletData(
  rpc, 
  'WALLET_ADDRESS_HERE',
  { 
    maxSignatures: 100,
    includeTokenAccounts: true 
  }
);

// 4. Normalize data
const context = normalizeWalletData(rawData, labelProvider);

// 5. Generate report
const report = generateReport(context);

// 6. Use the results
console.log('Risk Level:', report.overallRisk); // LOW | MEDIUM | HIGH
console.log('Signals:', report.signals.length);
console.log('Known Entities:', report.knownEntities.length);

// Handle high-risk wallets
if (report.overallRisk === 'HIGH') {
  console.warn('High privacy risks detected!');
  report.signals
    .filter(s => s.severity === 'HIGH')
    .forEach(signal => {
      console.log(`- ${signal.name}: ${signal.reason}`);
      console.log(`  Mitigation: ${signal.mitigation}`);
    });
}
```

TYPESCRIPT TYPES:
- PrivacyReport - The final report with overallRisk, signals, mitigations
- RiskSignal - Individual privacy risk detected
- ScanContext - Normalized data passed to heuristics
- RawWalletData, RawTransactionData, RawProgramData - Collected on-chain data
- LabelProvider - Interface for entity labeling

KEY HEURISTICS (9 total):
1. Fee Payer Reuse - Critical linkage vector on Solana
2. Signer Overlap - Multi-sig and control structure leaks
3. Known Entity Interaction - CEX/bridge interactions
4. Counterparty & PDA Reuse - Repeated interaction patterns
5. Instruction Fingerprinting - Program interaction patterns
6. Token Account Lifecycle - Rent refund tracing
7. Timing Patterns - Transaction burst detection
8. Amount Reuse - Repeated amounts (downgraded for Solana)
9. Balance Traceability - Flow analysis

OPTIONS:
- collectWalletData options: `{ maxSignatures?, includeTokenAccounts? }`
- collectProgramData options: `{ maxTransactions?, limit? }`

ERROR HANDLING:
- All collectors include try/catch blocks
- RPC failures degrade gracefully (empty arrays)
- Normalizers handle undefined/null data
- Always check report.signals.length before accessing

COMMON USE CASES:
1. Wallet Privacy Score - Scan a user's wallet before onboarding
2. Transaction Pre-flight Check - Analyze before sending to chain
3. Program Audit - Check if program creates privacy risks
4. Batch Analysis - Loop through multiple addresses
5. Privacy Dashboard - Display ongoing privacy metrics

INTEGRATION TIPS:
- Use RPCClient's built-in rate limiting for batch operations
- Cache label provider (createDefaultLabelProvider()) - don't recreate each time
- Limit maxSignatures for faster scans (100-200 is reasonable)
- Check report.overallRisk first, then drill into signals
- Display mitigations to users for actionable guidance

INFRASTRUCTURE:
- Powered by QuickNode for reliable Solana RPC access
- No API keys or configuration needed
- Default rate limits: 5 requests/second with exponential backoff

MY PROJECT CONTEXT:
[Describe your project here - what you're building, where you want to integrate privacy scanning, what your goals are, etc.]

WHAT I NEED HELP WITH:
[Describe specifically what you need - e.g., "Scan user wallets before allowing deposits", "Add privacy checks to my DeFi protocol", "Build a privacy dashboard", etc.]
```

---

## Example Prompts for Specific Use Cases

### For DeFi Protocols

```
Using solana-privacy-scanner-core, help me add privacy checks before allowing users to deposit funds into my lending protocol. I want to reject deposits from wallets that have HIGH risk privacy scores or direct CEX interactions in the last 10 transactions.
```

### For Wallet Applications

```
Using solana-privacy-scanner-core, help me build a "Privacy Score" feature in my Solana wallet that shows users their privacy rating and gives them actionable tips to improve it.
```

### For Batch Analysis

```
Using solana-privacy-scanner-core, help me scan 1000 wallet addresses efficiently, respecting rate limits, and export the results to a CSV with columns: address, risk_level, signals_count, known_entities.
```

### For Custom Heuristics

```
I'm using solana-privacy-scanner-core and want to add a custom heuristic that detects when wallets interact with specific program IDs that are known to be problematic. Show me how to access the ScanContext and implement this check.
```

---

## Quick Reference

### Install
```bash
npm install solana-privacy-scanner-core
```

### Minimal Example
```typescript
import { RPCClient, collectWalletData, normalizeWalletData, generateReport, createDefaultLabelProvider } from 'solana-privacy-scanner-core';

const rpc = new RPCClient();
const labels = createDefaultLabelProvider();
const raw = await collectWalletData(rpc, 'ADDRESS');
const context = normalizeWalletData(raw, labels);
const report = generateReport(context);

console.log(report.overallRisk);
```

### Links
- **Full Documentation:** https://sps.guide/library/usage
- **Examples:** https://sps.guide/library/examples
- **npm Package:** https://www.npmjs.com/package/solana-privacy-scanner-core
- **GitHub:** https://github.com/taylorferran/solana-privacy-scanner
