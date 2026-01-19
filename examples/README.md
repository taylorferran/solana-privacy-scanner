# Examples

This directory contains working examples demonstrating how to use the Solana Privacy Scanner (v0.2.0+).

::: tip What's New in v0.2.0
- **Solana-native privacy model** - No longer Ethereum-biased!
- **4 new Solana-specific heuristics**: Fee Payer Reuse, Signer Overlap, Instruction Fingerprinting, Token Account Lifecycle
- **Enhanced existing heuristics**: Better program/PDA detection, contextualized for Solana
- **9 total heuristics** ranked by real-world Solana deanonymization power
- **No RPC configuration needed** - Works out of the box!
- Robust error handling and backwards compatibility
:::

## Setup

Install dependencies:

```bash
npm install
```

**No RPC configuration needed!** The scanner includes a reliable default endpoint.

## Examples

### 1. Wallet Scan

Scans a wallet address for privacy risks.

```bash
npm run wallet
```

**What it does:**
- Fetches the last 50 transactions from the wallet
- Analyzes privacy risks using multiple heuristics
- Identifies known entities (exchanges, bridges, protocols)
- Outputs a formatted report to the console
- Saves a full JSON report to `wallet-report.json`

**Configuration:**
- **Wallet:** `CG2j5yV6XokVsDBgGdgxUSi6jSAq6oq8J83LPivwJwwb`
- **Max Signatures:** 50

### 2. Transaction Scan

Analyzes a single transaction for privacy patterns.

```bash
npm run transaction
```

**What it does:**
- Fetches a specific transaction by signature
- Analyzes the transaction's transfers and instructions
- Identifies counterparties and known entities involved
- Outputs a formatted report to the console
- Saves a full JSON report to `transaction-report.json`

**Configuration:**
- **Transaction:** `3Jxo3MpgA5wzrsuBbUEpBt6TtFN6g3ewevQ1EUr9mxNvr3CpZEZoePB2PqSFRGF6LaRWtPVN4vxCqzTZXYnE9Sxa`

### 3. Program Scan

Scans a program's recent activity for privacy patterns.

```bash
npm run program
```

**What it does:**
- Fetches recent accounts and transactions for a program
- Analyzes activity patterns across the program
- Identifies known entities interacting with the program
- Outputs a formatted report to the console
- Saves a full JSON report to `program-report.json`

**Configuration:**
- **Program:** `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4` (Jupiter Aggregator)
- **Max Accounts:** 5
- **Max Transactions:** 10

## Customization

You can modify the examples to scan different addresses or use different RPC endpoints:

1. Open the example file you want to customize
2. Update the constants at the top:
   - `RPC_URL` - Your Solana RPC endpoint
   - `WALLET_ADDRESS` / `TRANSACTION_SIGNATURE` / `PROGRAM_ID` - What you want to scan
   - Collection options (maxSignatures, maxAccounts, etc.)

## Example Output

```
🔍 Solana Privacy Scanner - Wallet Scan Example

Scanning wallet: CG2j5yV6XokVsDBgGdgxUSi6jSAq6oq8J83LPivwJwwb
Using RPC: https://late-hardworking-waterfall.solana-mainnet.quiknode.pro/***

⏳ Fetching transaction data...
   Fetched 50 transactions
⏳ Normalizing transaction data...
⏳ Analyzing privacy patterns...

✅ Scan complete!

═══════════════════════════════════════════════════════
  PRIVACY RISK SCORE: MEDIUM
═══════════════════════════════════════════════════════

🏷️  KNOWN ENTITIES DETECTED:
  • Jupiter Aggregator (DEX)
    Popular DEX aggregator for token swaps

📊 PRIVACY SIGNALS (3 detected):

1. 🟡 COUNTERPARTY_REUSE [MEDIUM]
   Multiple interactions with the same addresses create linkable patterns
   Evidence:
   • Interacted with 5 unique counterparties
   • Top counterparty: 3 interactions
   💡 Mitigation: Use different addresses for different purposes

...
```

## Output Files

The examples save detailed JSON reports:
- `wallet-report.json` - Complete wallet analysis
- `transaction-report.json` - Single transaction analysis
- `program-report.json` - Program activity analysis

These JSON files contain the full structured data including:
- Risk score and severity breakdown
- All detected privacy signals with evidence
- Known entities identified
- Mitigation recommendations
- Detailed metadata

## Learn More

- **CLI Documentation:** [docs/cli/user-guide.md](../docs/cli/user-guide.md)
- **Library Documentation:** [docs/library/usage.md](../docs/library/usage.md)
- **Full Documentation:** https://taylorferran.github.io/solana-privacy-scanner

## Adding Your Own Examples

To create a custom example:

1. Create a new `.ts` file in this directory
2. Import from `solana-privacy-scanner-core`
3. Follow the pattern from existing examples
4. Add a script to `package.json`
5. Document it in this README

Example template:

```typescript
import { 
  RPCClient, 
  collectWalletData, 
  normalizeWalletData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

async function main() {
  const rpc = new RPCClient('your-rpc-url');
  const labelProvider = createDefaultLabelProvider();
  
  // Your custom logic here
  const rawData = await collectWalletData(rpc, 'address', {
    maxSignatures: 50,
  });
  
  const context = normalizeWalletData(rawData, labelProvider);
  const report = generateReport(context);
  
  console.log(report);
}

main();
```
