# CLI Examples

Real-world scanning scenarios and use cases.

## Basic Wallet Scans

### Check Your Own Wallet

```bash
# Quick privacy check
solana-privacy-scanner scan-wallet YOUR_WALLET_ADDRESS --max-signatures 20
```

**What to look for:**
- Overall risk score
- Any CEX interactions (HIGH risk)
- Counterparty reuse patterns
- Timing correlation

---

### Deep Wallet Analysis

```bash
# Comprehensive scan (may take longer)
solana-privacy-scanner scan-wallet YOUR_WALLET_ADDRESS \
  --max-signatures 200 \
  --output detailed-report.txt
```

**Use case:** Before using a wallet for privacy-sensitive activities, do a deep scan to understand existing exposure.

---

## Transaction Analysis

### Investigate a Suspicious Transaction

```bash
solana-privacy-scanner scan-transaction <SIGNATURE>
```

**Use case:** Got a transaction from an unknown source? Scan it to see what risk patterns it contains.

---

## Program Analysis

### Check DEX Privacy

```bash
# Scan Jupiter aggregator
solana-privacy-scanner scan-program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 \
  --max-accounts 10 \
  --max-transactions 30
```

**Use case:** Understand what privacy risks are inherent to using a specific protocol.

---

## JSON Output for Automation

### Save Scan Results as JSON

```bash
solana-privacy-scanner scan-wallet YOUR_WALLET \
  --json \
  --output scan-$(date +%Y%m%d).json
```

**Use case:** Automated privacy monitoring in CI/CD or cron jobs.

---

### Process JSON with jq

```bash
# Extract only HIGH risk signals
solana-privacy-scanner scan-wallet YOUR_WALLET --json | \
  jq '.signals[] | select(.severity == "HIGH")'

# Count total signals
solana-privacy-scanner scan-wallet YOUR_WALLET --json | \
  jq '.summary.totalSignals'

# List known entities
solana-privacy-scanner scan-wallet YOUR_WALLET --json | \
  jq '.knownEntities[].name'
```

---

## Multi-Wallet Comparison

### Scan Multiple Wallets

```bash
#!/bin/bash
# scan-all.sh

WALLETS=(
  "wallet1..."
  "wallet2..."
  "wallet3..."
)

for wallet in "${WALLETS[@]}"; do
  echo "Scanning $wallet..."
  solana-privacy-scanner scan-wallet "$wallet" \
    --output "report-$wallet.txt"
done
```

**Use case:** Compare privacy profiles across your wallet portfolio.

---

## Privacy Audit Workflow

### Before Important Transaction

```bash
# 1. Scan your current wallet
solana-privacy-scanner scan-wallet YOUR_WALLET --max-signatures 50

# 2. Check if result is acceptable
# 3. If HIGH risk, consider using a different wallet or taking mitigation steps
```

### After Using New Protocol

```bash
# Scan to see what new risks were introduced
solana-privacy-scanner scan-wallet YOUR_WALLET --max-signatures 10
```

---

## Known Entity Detection

### Find CEX Interactions

```bash
# Scan and search output for "exchange"
solana-privacy-scanner scan-wallet YOUR_WALLET | grep -i exchange
```

**What to look for:**
```
KNOWN ENTITIES DETECTED
Exchanges:
  • Binance Hot Wallet
```

If you see this, your wallet has interacted with a CEX - HIGH privacy risk.

---

## Debugging and Troubleshooting

### Test with Limited Data

```bash
# Start with just 5 transactions to test connectivity
solana-privacy-scanner scan-wallet YOUR_WALLET --max-signatures 5
```

### Verbose RPC Errors

```bash
# If scan fails, check RPC connectivity
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  $SOLANA_RPC
```

---

## Integration Examples

### GitHub Actions

```yaml
name: Privacy Audit

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install -g solana-privacy-scanner
      - run: |
          solana-privacy-scanner scan-wallet ${{ secrets.WALLET_ADDRESS }} \
            --rpc ${{ secrets.SOLANA_RPC }} \
            --json \
            --output audit-report.json
      - uses: actions/upload-artifact@v2
        with:
          name: privacy-report
          path: audit-report.json
```

---

### Shell Function

Add to `.bashrc` or `.zshrc`:

```bash
# Quick privacy check
function solscan() {
  solana-privacy-scanner scan-wallet "$1" --max-signatures 30
}

# Usage: solscan YourWalletAddress
```

---

## Best Practices

### 1. Regular Audits

```bash
# Weekly privacy check
0 0 * * 0 solana-privacy-scanner scan-wallet YOUR_WALLET --output ~/privacy-reports/weekly-$(date +\%Y\%m\%d).txt
```

### 2. Before/After Comparisons

```bash
# Before using new protocol
solana-privacy-scanner scan-wallet YOUR_WALLET --output before.txt

# ... use protocol ...

# After
solana-privacy-scanner scan-wallet YOUR_WALLET --output after.txt
diff before.txt after.txt
```

### 3. Dedicated Privacy Wallets

```bash
# Scan your "anonymous" wallet to verify it's actually private
solana-privacy-scanner scan-wallet ANON_WALLET --max-signatures 100

# Should show LOW risk and no known entity interactions
```

---

## Next Steps

- **[User Guide](/cli/user-guide)** - Full command reference
- **[Understanding Reports](/reports/risk-levels)** - Interpret results
- **[Known Entities](/reports/known-entities)** - Database of tracked addresses
