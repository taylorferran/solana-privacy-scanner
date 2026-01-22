# CLI Guide

Complete guide for the Solana Privacy Scanner command-line interface.

## Installation & Quick Start

```bash
# Install globally
npm install -g solana-privacy-scanner

# Or use with npx
npx solana-privacy-scanner <command>
```

**Basic commands:**

```bash
# Scan a wallet
solana-privacy-scanner scan-wallet <ADDRESS>

# Scan a transaction
solana-privacy-scanner scan-transaction <SIGNATURE>

# Scan a program
solana-privacy-scanner scan-program <PROGRAM_ID>
```

**RPC Configuration (optional):**

The CLI includes a default QuickNode RPC endpoint. Override if needed:

```bash
export SOLANA_RPC=https://your-rpc-url.com
```

Or use `--rpc` flag:

```bash
solana-privacy-scanner scan-wallet ADDRESS --rpc https://your-rpc.com
```

## Commands

### `scan-wallet`

```bash
solana-privacy-scanner scan-wallet <ADDRESS> [options]
```

**Options:**
- `--max-signatures <number>` - Max transactions to analyze (default: 100)
- `--json` - Output as JSON
- `--output <file>` - Save to file
- `--rpc <url>` - Custom RPC endpoint

**Examples:**

```bash
# Basic scan
solana-privacy-scanner scan-wallet YourWalletAddress

# Quick check (20 transactions)
solana-privacy-scanner scan-wallet YourWallet --max-signatures 20

# Deep analysis with file output
solana-privacy-scanner scan-wallet YourWallet --max-signatures 200 --output report.txt

# JSON for automation
solana-privacy-scanner scan-wallet YourWallet --json > report.json
```

### `scan-transaction`

```bash
solana-privacy-scanner scan-transaction <SIGNATURE> [options]
```

**Options:** `--json`, `--output <file>`, `--rpc <url>`

**Example:**
```bash
solana-privacy-scanner scan-transaction 5Jx...Signature...xyz
```

### `scan-program`

```bash
solana-privacy-scanner scan-program <PROGRAM_ID> [options]
```

**Options:**
- `--max-accounts <number>` - Max accounts to fetch (default: 10)
- `--max-transactions <number>` - Max transactions to analyze (default: 20)
- `--json`, `--output <file>`, `--rpc <url>`

**Example:**
```bash
solana-privacy-scanner scan-program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4
```

## Common Patterns

**Quick privacy check:**
```bash
solana-privacy-scanner scan-wallet YOUR_WALLET --max-signatures 30
```

**Automated monitoring:**
```bash
# Daily scan
solana-privacy-scanner scan-wallet YOUR_WALLET --json --output "scan-$(date +%Y%m%d).json"
```

**Process with jq:**
```bash
# Extract HIGH risk signals
solana-privacy-scanner scan-wallet YOUR_WALLET --json | \
  jq '.signals[] | select(.severity == "HIGH")'

# Count signals
solana-privacy-scanner scan-wallet YOUR_WALLET --json | jq '.summary.totalSignals'
```

**Scan multiple wallets:**
```bash
for wallet in wallet1 wallet2 wallet3; do
  solana-privacy-scanner scan-wallet "$wallet" --output "report-$wallet.txt"
done
```

**GitHub Actions:**
```yaml
- run: npm install -g solana-privacy-scanner
- run: |
    solana-privacy-scanner scan-wallet ${{ secrets.WALLET }} \
      --json --output audit.json
```

**Shell alias:**
```bash
# Add to .bashrc/.zshrc
alias solscan='solana-privacy-scanner scan-wallet'
```

## Troubleshooting

**Command not found:**
```bash
npm install -g solana-privacy-scanner
# or use npx
```

**429 Too Many Requests:**
Reduce `--max-signatures` or wait. Free RPC tiers have limits.

**No risks detected:**
May be accurate! Try increasing `--max-signatures` for more history.

**Test connectivity:**
```bash
solana-privacy-scanner scan-wallet YOUR_WALLET --max-signatures 5
```

---

## Next Steps

- **[Understanding Reports](../reports/risk-levels)** - Learn about risk levels and heuristics
- **[Library API](../library/api-reference)** - Integrate into your code
- **[Known Entities](../reports/known-entities)** - See tracked addresses
