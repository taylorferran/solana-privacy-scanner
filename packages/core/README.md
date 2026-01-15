# solana-privacy-scanner-core

Core scanning engine for Solana privacy analysis. Analyze on-chain privacy exposure using heuristic-based risk detection.

## Features

- 🔍 **Privacy Risk Detection** - Identifies balance traceability, amount reuse, counterparty patterns, and timing correlations
- 🏷️ **Known Entity Detection** - Flags interactions with exchanges, bridges, and KYC services
- 📊 **Structured Reports** - Generates detailed JSON reports with risk scores, evidence, and mitigations
- ⚡ **Fast & Efficient** - Built with esbuild, supports both ESM and CJS
- 🔒 **Privacy-First** - All analysis happens locally, no data sent to external servers

## Installation

```bash
npm install solana-privacy-scanner-core
```

## Quick Start

```typescript
import { scan, RPCClient } from 'solana-privacy-scanner-core';

// Create an RPC client
const rpc = new RPCClient('https://api.mainnet-beta.solana.com');

// Scan a wallet
const report = await scan({
  target: 'YourWalletAddressHere',
  targetType: 'wallet',
  rpcClient: rpc,
  maxSignatures: 100,
});

console.log('Risk Level:', report.overallRisk);
console.log('Signals:', report.signals.length);
```

## Documentation

Full documentation available at: https://taylorferran.github.io/solana-privacy-scanner

- [Getting Started](https://taylorferran.github.io/solana-privacy-scanner/guide/getting-started)
- [Library Usage](https://taylorferran.github.io/solana-privacy-scanner/library/usage)
- [API Reference](https://taylorferran.github.io/solana-privacy-scanner/library/examples)

## License

MIT
