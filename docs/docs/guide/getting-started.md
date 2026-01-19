# Getting Started

## Installation

```bash
npm install -g solana-privacy-scanner
```

Or use without installing:

```bash
npx solana-privacy-scanner scan-wallet <address>
```

**Requirements:** Node.js 20+

No RPC configuration needed - powered by [QuickNode](./quicknode).

## Basic Usage

### Scan Wallet

```bash
solana-privacy-scanner scan-wallet <ADDRESS>
```

With options:

```bash
solana-privacy-scanner scan-wallet <ADDRESS> \
  --max-signatures 100 \
  --include-tokens \
  --json \
  --output report.json
```

### Scan Transaction

```bash
solana-privacy-scanner scan-transaction <SIGNATURE>
```

### Scan Program

```bash
solana-privacy-scanner scan-program <PROGRAM_ID> --max-transactions 50
```

## Output Formats

**Terminal (default):** Color-coded report

```bash
solana-privacy-scanner scan-wallet <ADDRESS>
```

**JSON:** Machine-readable

```bash
solana-privacy-scanner scan-wallet <ADDRESS> --json
```

**File:** Save output

```bash
solana-privacy-scanner scan-wallet <ADDRESS> --output report.json
```

## Example

```bash
# Scan and save JSON report
solana-privacy-scanner scan-wallet \
  CG2j5yV6XokVsDBgGdgxUSi6jSAq6oq8J83LPivwJwwb \
  --json --output report.json

# View risk level
cat report.json | jq '.overallRisk'
```

## Next Steps

- **[CLI Commands](../cli/quickstart)** - Full command reference
- **[Understanding Reports](../reports/risk-levels)** - Interpret results  
- **[Library Usage](../library/usage)** - Use in code
