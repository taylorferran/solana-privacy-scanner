# CLI Quickstart

Get scanning in under 2 minutes.

## Installation

```bash
npm install -g solana-privacy-scanner
```

## Set Your RPC

```bash
export SOLANA_RPC=https://your-helius-rpc-url.com
```

Or create `.env.local`:
```
SOLANA_RPC=https://your-helius-rpc-url.com
```

## Three Quick Commands

### 1. Scan a Wallet

```bash
solana-privacy-scanner scan-wallet <WALLET_ADDRESS>
```

### 2. Scan a Transaction

```bash
solana-privacy-scanner scan-transaction <TX_SIGNATURE>
```

### 3. Scan a Program

```bash
solana-privacy-scanner scan-program <PROGRAM_ID>
```

## Common Options

```bash
# Limit transactions analyzed
--max-signatures 50

# Get JSON output
--json

# Save to file
--output report.txt

# Use custom RPC
--rpc https://your-rpc.com
```

## Full Example

```bash
# Analyze a wallet's last 30 transactions and save the report
solana-privacy-scanner scan-wallet \
  zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE \
  --max-signatures 30 \
  --output privacy-report.txt
```

## What You'll See

The scanner will output:
1. **Overall Risk Score** - LOW, MEDIUM, or HIGH
2. **Detected Risks** - Each with evidence and severity
3. **Known Entities** - Any labeled addresses found
4. **Recommendations** - Specific mitigation advice

## Next Steps

- **[Full CLI Guide](/docs/cli/user-guide)** - Complete command reference
- **[Examples](/docs/cli/examples)** - Real-world scanning scenarios
- **[Understanding Reports](/docs/reports/risk-levels)** - Interpret your results
