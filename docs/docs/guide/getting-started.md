# Getting Started

Get up and running with Solana Privacy Scanner in just a few minutes.

## Installation

### Install Globally (Recommended)

```bash
npm install -g solana-privacy-scanner
```

### Use with npx (No Installation)

```bash
npx solana-privacy-scanner scan-wallet <address> --rpc <your-rpc-url>
```

## Prerequisites

You'll need:

1. **Node.js** (version 20 or higher)
2. **A Solana RPC endpoint** - Get a free one from:
   - [Helius](https://helius.dev)
   - [QuickNode](https://quicknode.com)
   - [Alchemy](https://alchemy.com)

## Quick Start

### Scan a Wallet

```bash
solana-privacy-scanner scan-wallet <WALLET_ADDRESS> \
  --rpc https://your-rpc-endpoint.com \
  --max-signatures 50
```

### Scan a Transaction

```bash
solana-privacy-scanner scan-transaction <TX_SIGNATURE> \
  --rpc https://your-rpc-endpoint.com
```

### Scan a Program

```bash
solana-privacy-scanner scan-program <PROGRAM_ID> \
  --rpc https://your-rpc-endpoint.com \
  --max-accounts 10 \
  --max-transactions 20
```

## Using Environment Variables

Instead of passing `--rpc` every time, set an environment variable:

```bash
export SOLANA_RPC=https://your-rpc-endpoint.com

# Now you can omit --rpc
solana-privacy-scanner scan-wallet <ADDRESS>
```

## Output Formats

### Human-Readable (Default)

```bash
solana-privacy-scanner scan-wallet <ADDRESS>
```

Outputs a formatted report to your terminal.

### JSON Output

```bash
solana-privacy-scanner scan-wallet <ADDRESS> --json
```

Machine-readable JSON for programmatic use.

### Save to File

```bash
solana-privacy-scanner scan-wallet <ADDRESS> --output report.txt
```

## Next Steps

- **[CLI Quickstart](/docs/cli/quickstart)** - More CLI examples
- **[Understanding Reports](/docs/reports/risk-levels)** - Learn to interpret results
- **[CLI User Guide](/docs/cli/user-guide)** - Complete command reference
