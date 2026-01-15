# Solana Privacy Scanner

[![npm - core](https://img.shields.io/npm/v/solana-privacy-scanner-core?label=core&color=blue)](https://www.npmjs.com/package/solana-privacy-scanner-core)
[![npm - cli](https://img.shields.io/npm/v/solana-privacy-scanner?label=cli&color=blue)](https://www.npmjs.com/package/solana-privacy-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A developer tool that analyzes Solana wallets, transactions, or programs using public on-chain data and produces deterministic privacy risk reports.

## 📦 Packages

### CLI Tool
```bash
# Install globally
npm install -g solana-privacy-scanner

# Scan a wallet
solana-privacy-scanner scan-wallet <ADDRESS> --rpc <RPC_URL>
```

**npm**: [solana-privacy-scanner](https://www.npmjs.com/package/solana-privacy-scanner)

### Core Library
```bash
# Install as dependency
npm install solana-privacy-scanner-core
```

```typescript
import { scan, RPCClient } from 'solana-privacy-scanner-core';

const rpc = new RPCClient('https://api.mainnet-beta.solana.com');
const report = await scan('wallet', 'WALLET_ADDRESS', rpc);
```

**npm**: [solana-privacy-scanner-core](https://www.npmjs.com/package/solana-privacy-scanner-core)

## 📚 Documentation

**[View Full Documentation →](https://taylorferran.github.io/solana-privacy-scanner)**

The documentation includes:
- **Interactive Web Scanner** - Try it in your browser
- **Getting Started Guide** - Learn the basics
- **CLI Reference** - All commands and options
- **Library API** - Integration examples
- **Understanding Reports** - Heuristics and risk levels
- **Contributing Guide** - Add known addresses

## 🔍 Features

- **Scan wallets, transactions, and programs** for privacy risks
- **Clear risk assessments** (LOW/MEDIUM/HIGH) based on transparent heuristics
- **Known entity detection** - Identifies CEXs, bridges, and protocols
- **Actionable guidance** - Specific mitigation recommendations
- **Open and transparent** - All methods documented, no black boxes
- **Multiple interfaces** - CLI, library, and web UI

## 🏗️ Project Structure

This is a monorepo containing:

```
solana-privacy-scanner/
├── docs/                   # VitePress documentation site
├── packages/
│   ├── core/              # solana-privacy-scanner-core - Scanning engine
│   └── cli/               # solana-privacy-scanner - CLI tool
└── package.json           # Monorepo workspace
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/taylorferran/solana-privacy-scanner
cd solana-privacy-scanner

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Run documentation site locally
npm run docs:dev
```

## 🤝 Contributing

We welcome contributions!

- **Add known addresses** - [Contributing Guide](https://taylorferran.github.io/solana-privacy-scanner/contributing/addresses)
- **Report bugs** - Open an issue
- **Submit PRs** - See [Development Guide](https://taylorferran.github.io/solana-privacy-scanner/contributing/development)

## ⚖️ What This Is

- ✅ A scanner and diagnostic tool
- ✅ A measurement of privacy exposure
- ✅ Educational software for privacy awareness
- ✅ Open and transparent

## ⚠️ What This Is NOT

- ❌ Not a wallet or protocol
- ❌ Not surveillance software
- ❌ Not compliance tooling
- ❌ Not a guarantee of deanonymization

**This tool does not deanonymize users.** It surfaces privacy risk signals that already exist due to public blockchain data.

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details

## 🙏 Acknowledgments

Built for privacy awareness, not surveillance. Use responsibly.

---

**[Documentation](https://taylorferran.github.io/solana-privacy-scanner)** • **[GitHub](https://github.com/taylorferran/solana-privacy-scanner)** • **[npm - core](https://www.npmjs.com/package/solana-privacy-scanner-core)** • **[npm - cli](https://www.npmjs.com/package/solana-privacy-scanner)**
