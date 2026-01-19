# CLI User Guide

Complete reference for all CLI commands and options.

## Installation

```bash
npm install -g solana-privacy-scanner
```

Or use directly with npx:
```bash
npx solana-privacy-scanner <command>
```

## Configuration

### RPC Endpoint

Required for all scans. Provide via:

**Environment Variable (Recommended):**
```bash
export SOLANA_RPC=https://your-rpc-url.com
```

**Or in `.env.local`:**
```
SOLANA_RPC=https://your-rpc-url.com
```

**Or via CLI flag:**
```bash
--rpc https://your-rpc-url.com
```

## Commands

### scan-wallet

Analyze a Solana wallet for privacy risks.

**Usage:**
```bash
solana-privacy-scanner scan-wallet <ADDRESS> [options]
```

**Aliases:** `wallet`, `scan-wallet`

**Options:**
- `--rpc <url>` - RPC endpoint URL
- `--json` - Output as JSON
- `--max-signatures <number>` - Max transactions to analyze (default: 100)
- `--output <file>` - Save output to file

**Examples:**
```bash
# Basic scan
solana-privacy-scanner scan-wallet YourWalletAddress

# Limit to 50 transactions
solana-privacy-scanner scan-wallet YourWalletAddress --max-signatures 50

# JSON output
solana-privacy-scanner scan-wallet YourWalletAddress --json

# Save to file
solana-privacy-scanner scan-wallet YourWalletAddress --output report.txt
```

---

### scan-transaction

Analyze a single transaction.

**Usage:**
```bash
solana-privacy-scanner scan-transaction <SIGNATURE> [options]
```

**Aliases:** `tx`, `scan-transaction`, `transaction`

**Options:**
- `--rpc <url>` - RPC endpoint URL
- `--json` - Output as JSON
- `--output <file>` - Save output to file

**Example:**
```bash
solana-privacy-scanner scan-transaction 5Jx...Signature...xyz
```

---

### scan-program

Analyze a Solana program's recent activity.

**Usage:**
```bash
solana-privacy-scanner scan-program <PROGRAM_ID> [options]
```

**Aliases:** `program`, `scan-program`

**Options:**
- `--rpc <url>` - RPC endpoint URL
- `--json` - Output as JSON
- `--max-accounts <number>` - Max accounts to fetch (default: 10)
- `--max-transactions <number>` - Max transactions to analyze (default: 20)
- `--output <file>` - Save output to file

**Example:**
```bash
solana-privacy-scanner scan-program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 \
  --max-accounts 5 \
  --max-transactions 10
```

## Global Options

These work with all commands:

- `--help` - Show command help
- `--version` - Show version

## Output Formats

### Human-Readable (Default)

Formatted, color-coded report:
```
═══════════════════════════════════════════════
  SOLANA PRIVACY SCANNER - REPORT
═══════════════════════════════════════════════

OVERALL PRIVACY RISK: MEDIUM

DETECTED PRIVACY RISKS
───────────────────────────────────────────────

1. Transaction Burst Pattern [HIGH]
   ...
```

### JSON

Machine-readable format:
```json
{
  "version": "1.0.0",
  "overallRisk": "MEDIUM",
  "signals": [...],
  "knownEntities": [...]
}
```

## File Output

When using `--output`:
- Text files get plain text (no ANSI colors)
- JSON files get formatted JSON
- File extension doesn't matter for format (use `--json` flag)

```bash
# Text report
solana-privacy-scanner scan-wallet ADDRESS --output report.txt

# JSON report  
solana-privacy-scanner scan-wallet ADDRESS --json --output report.json
```

## Best Practices

### 1. Start Small

```bash
# Test with limited transactions first
solana-privacy-scanner scan-wallet ADDRESS --max-signatures 10
```

### 2. Use Environment Variables

```bash
# Set once, use everywhere
export SOLANA_RPC=https://your-rpc.com
```

### 3. Save Important Scans

```bash
# Keep records
solana-privacy-scanner scan-wallet ADDRESS --output "scan-$(date +%Y%m%d).txt"
```

### 4. Respect Rate Limits

- Limit max-signatures for faster scans
- Free RPC tiers have rate limits
- Use `--max-signatures 20-50` for quick checks

## Troubleshooting

### Error: RPC URL is required

**Solution:** Set `SOLANA_RPC` env var or use `--rpc` flag

### Error: 429 Too Many Requests

**Solution:** Reduce `--max-signatures` or wait before retrying

### No risks detected

**Solution:** This might be accurate! Try:
- Increase `--max-signatures` to analyze more transactions
- Check the "KNOWN ENTITIES DETECTED" section
- Review transaction history on Solscan

### Command not found

**Solution:** If installed globally, try:
```bash
npm install -g solana-privacy-scanner
```

Or use npx:
```bash
npx solana-privacy-scanner <command>
```

## Exit Codes

- `0` - Success
- `1` - Error occurred

## Next Steps

- **[CLI Quickstart](/docs/cli/quickstart)** - Quick examples
- **[Examples](/docs/cli/examples)** - Real-world scenarios
- **[Understanding Reports](/docs/reports/risk-levels)** - Interpret results
