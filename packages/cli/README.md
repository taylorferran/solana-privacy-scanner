# solana-privacy-scanner

Command-line tool for analyzing Solana wallet privacy and on-chain exposure. Scan wallets, transactions, and programs for privacy risks.

## Installation

```bash
# Global installation
npm install -g solana-privacy-scanner

# Or use with npx (no installation required)
npx solana-privacy-scanner scan-wallet <address>
```

## Quick Start

```bash
# Set your RPC endpoint
export SOLANA_RPC=https://api.mainnet-beta.solana.com

# Scan a wallet
solana-privacy-scanner scan-wallet YourWalletAddressHere

# Scan with custom RPC
solana-privacy-scanner scan-wallet YourAddress --rpc https://your-rpc.com

# Output to JSON file
solana-privacy-scanner scan-wallet YourAddress --json --output report.json
```

## Commands

- `scan-wallet <address>` - Analyze a wallet's privacy
- `scan-tx <signature>` - Analyze a specific transaction
- `scan-program <programId>` - Analyze a program's usage patterns

## Options

- `--rpc <url>` - Custom RPC endpoint
- `--json` - Output as JSON
- `--output <file>` - Save to file
- `--max-signatures <n>` - Limit transactions to analyze

## Documentation

Full documentation: https://taylorferran.github.io/solana-privacy-scanner

- [CLI Guide](https://taylorferran.github.io/solana-privacy-scanner/cli/user-guide)
- [Quick Start](https://taylorferran.github.io/solana-privacy-scanner/cli/quickstart)

## License

MIT
