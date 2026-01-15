# Solana Privacy Scanner - CLI User Guide

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

The CLI requires a Solana RPC endpoint. You can provide it in two ways:

### Option 1: Environment Variable (Recommended)

Create a `.env.local` file in the project root:

```bash
SOLANA_RPC=https://your-helius-rpc-url.com
```

### Option 2: Command Line Flag

Pass the RPC URL with `--rpc` flag:

```bash
node packages/cli/dist/index.js wallet <address> --rpc https://your-rpc-url.com
```

## Commands

### 1. Scan a Wallet

Analyze a Solana wallet address for privacy risks:

```bash
node packages/cli/dist/index.js wallet <ADDRESS>
```

**Aliases:** `scan-wallet`, `wallet`

**Options:**
- `--rpc <url>` - RPC endpoint URL (overrides env var)
- `--json` - Output as JSON instead of formatted text
- `--max-signatures <number>` - Maximum transactions to analyze (default: 100)
- `--output <file>` - Write output to file

**Examples:**

```bash
# Basic wallet scan
node packages/cli/dist/index.js wallet zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE

# Scan with custom signature limit
node packages/cli/dist/index.js wallet zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE --max-signatures 50

# Output as JSON
node packages/cli/dist/index.js wallet zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE --json

# Save to file
node packages/cli/dist/index.js wallet zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE --output report.txt

# JSON output to file
node packages/cli/dist/index.js wallet zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE --json --output report.json
```

### 2. Scan a Transaction

Analyze a single transaction for privacy risks:

```bash
node packages/cli/dist/index.js tx <SIGNATURE>
```

**Aliases:** `scan-transaction`, `tx`

**Options:**
- `--rpc <url>` - RPC endpoint URL
- `--json` - Output as JSON
- `--output <file>` - Write output to file

**Example:**

```bash
node packages/cli/dist/index.js tx 3Jxo3MpgA5wzrsuBbUEpBt6TtFN6g3ewevQ1EUr9mxNvr3CpZEZoePB2PqSFRGF6LaRWtPVN4vxCqzTZXYnE9Sxa
```

### 3. Scan a Program

Analyze a Solana program's recent activity:

```bash
node packages/cli/dist/index.js program <PROGRAM_ID>
```

**Aliases:** `scan-program`, `program`

**Options:**
- `--rpc <url>` - RPC endpoint URL
- `--json` - Output as JSON
- `--max-accounts <number>` - Maximum accounts to fetch (default: 100)
- `--max-transactions <number>` - Maximum transactions to analyze (default: 50)
- `--output <file>` - Write output to file

**Example:**

```bash
node packages/cli/dist/index.js program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 --max-transactions 20
```

## Understanding the Report

### Overall Risk Levels

- **LOW** - No significant privacy risks detected
- **MEDIUM** - Some privacy exposure; consider mitigations
- **HIGH** - Significant privacy risks detected; immediate action recommended

### Risk Signals

The scanner detects five categories of privacy risks:

1. **Counterparty Reuse** - Repeated interactions with same addresses
   - Enables clustering and linking of addresses
   - Severity: Based on concentration and frequency

2. **Deterministic Amount Patterns** - Round numbers or repeated amounts
   - Creates fingerprints for transaction linking
   - Severity: Based on pattern frequency

3. **Transaction Burst Pattern** - Concentrated activity in short time
   - Creates temporal fingerprints
   - Severity: Based on transaction rate

4. **Known Entity Interaction** - Transactions with CEXs, bridges, etc.
   - Can link on-chain activity to real identity
   - Severity: HIGH for exchanges, MEDIUM for others

5. **Balance Traceability** - Patterns enabling balance tracking
   - Allows following funds through the blockchain
   - Severity: Based on pattern detectability

### Report Sections

1. **Header** - Target info, scan time, version
2. **Overall Risk** - Single risk level assessment
3. **Summary** - Statistics (transactions analyzed, signal counts)
4. **Detected Privacy Risks** - Detailed findings with:
   - Severity level
   - Reason detected
   - Why it matters (impact)
   - Evidence (specific examples)
   - Mitigation advice
   - Confidence level
5. **Recommendations** - General privacy best practices

## Output Formats

### Human-Readable (Default)

Clean, formatted text output with color coding:
- RED badges for HIGH severity
- YELLOW badges for MEDIUM severity
- GREEN badges for LOW severity

### JSON Format (`--json`)

Structured JSON for programmatic use:

```json
{
  "version": "1.0.0",
  "timestamp": 1736887264000,
  "targetType": "wallet",
  "target": "zPauE...",
  "overallRisk": "MEDIUM",
  "signals": [...],
  "summary": {
    "totalSignals": 3,
    "highRiskSignals": 1,
    "mediumRiskSignals": 1,
    "lowRiskSignals": 1,
    "transactionsAnalyzed": 10
  },
  "mitigations": [...]
}
```

## Common Use Cases

### Quick Wallet Check

```bash
node packages/cli/dist/index.js wallet <ADDRESS>
```

### Detailed Analysis with More History

```bash
node packages/cli/dist/index.js wallet <ADDRESS> --max-signatures 200
```

### CI/CD Integration

```bash
# JSON output for parsing
node packages/cli/dist/index.js wallet <ADDRESS> --json > report.json

# Check exit code (0 = success, 1 = error)
if [ $? -eq 0 ]; then
  echo "Scan completed successfully"
fi
```

### Save Report for Review

```bash
node packages/cli/dist/index.js wallet <ADDRESS> --output wallet-report-$(date +%Y%m%d).txt
```

## Troubleshooting

### "RPC URL is required" Error

Make sure you have:
1. Created `.env.local` with `SOLANA_RPC=...`, OR
2. Passed `--rpc` flag with valid URL

### "429 Too Many Requests" Errors

Your RPC is rate-limited. Try:
- Reducing `--max-signatures` value
- Using a paid RPC tier
- Adding delays between scans

### "Transaction not found" Error

The transaction signature may be:
- Invalid or typo'd
- Too old (pruned by RPC)
- Not yet confirmed

### No Privacy Risks Detected

This is good! It means:
- Clean transaction history
- Good privacy practices
- Low exposure patterns

## Tips for Better Privacy

1. **Use Multiple Wallets** - Compartmentalize activities
2. **Vary Amounts** - Avoid round numbers
3. **Spread Transactions** - Don't burst activity
4. **Avoid Direct CEX Links** - Use intermediate wallets
5. **Introduce Delays** - Reduce timing correlation

## Rate Limits

The CLI respects your RPC rate limits:
- Default: 5 concurrent requests
- Automatic retries with exponential backoff
- Progress shown on stderr (doesn't interfere with output)

## Need Help?

```bash
# Show all commands
node packages/cli/dist/index.js --help

# Show command-specific help
node packages/cli/dist/index.js wallet --help
node packages/cli/dist/index.js tx --help
node packages/cli/dist/index.js program --help
```

## Disclaimer

This tool analyzes publicly available blockchain data. Privacy risk assessments are based on heuristics and observable patterns. These assessments are probabilistic indicators, not definitive proof of identity linkage or deanonymization.
