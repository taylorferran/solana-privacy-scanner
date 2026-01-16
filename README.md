# Solana Privacy Scanner

[![npm - core](https://img.shields.io/npm/v/solana-privacy-scanner-core?label=core&color=blue)](https://www.npmjs.com/package/solana-privacy-scanner-core)
[![npm - cli](https://img.shields.io/npm/v/solana-privacy-scanner?label=cli&color=blue)](https://www.npmjs.com/package/solana-privacy-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A developer tool that analyzes Solana wallets, transactions, or programs using public on-chain data and produces deterministic privacy risk reports.

**Current Version:** `0.1.4` - [Changelog](./docs/changelog.md)

---

## ✨ Features

- 🔍 **Comprehensive scanning** - Analyze wallets, transactions, and programs
- 📊 **Clear risk assessments** - LOW/MEDIUM/HIGH ratings with transparent scoring
- 🏷️ **Known entity detection** - Identifies CEXs, bridges, protocols, and major programs
- 💡 **Actionable guidance** - Specific mitigation recommendations for each risk
- 🧪 **Robust & tested** - 36 tests covering edge cases and error handling
- 🔓 **Open and transparent** - All heuristics documented, no black boxes
- 🌐 **Multiple interfaces** - CLI, library, and interactive web UI

---

## 🚀 Quick Start

### Try the Web UI

**[Launch Interactive Scanner →](https://taylorferran.github.io/solana-privacy-scanner)**

Paste any Solana wallet address and scan instantly in your browser.

### Install CLI

```bash
npm install -g solana-privacy-scanner
solana-privacy-scanner scan-wallet <ADDRESS> --rpc <RPC_URL>
```

### Use as Library

```bash
npm install solana-privacy-scanner-core
```

```typescript
import { 
  RPCClient, 
  collectWalletData, 
  normalizeWalletData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

const rpc = new RPCClient('https://api.mainnet-beta.solana.com');
const labelProvider = createDefaultLabelProvider();
const rawData = await collectWalletData(rpc, 'WALLET_ADDRESS');
const context = normalizeWalletData(rawData, labelProvider);
const report = generateReport(context);

console.log('Overall Risk:', report.overallRisk);
console.log('Signals Found:', report.signals.length);
```

---

## 📦 Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`solana-privacy-scanner-core`](https://www.npmjs.com/package/solana-privacy-scanner-core) | ![npm](https://img.shields.io/npm/v/solana-privacy-scanner-core) | Core scanning engine |
| [`solana-privacy-scanner`](https://www.npmjs.com/package/solana-privacy-scanner) | ![npm](https://img.shields.io/npm/v/solana-privacy-scanner) | CLI tool |

---

## 📚 Documentation

**[View Full Documentation →](https://taylorferran.github.io/solana-privacy-scanner)**

- **[Getting Started](https://taylorferran.github.io/solana-privacy-scanner/guide/getting-started)** - Installation and first scan
- **[Library API Reference](https://taylorferran.github.io/solana-privacy-scanner/library/usage)** - Integration guide
- **[CLI Commands](https://taylorferran.github.io/solana-privacy-scanner/cli/quickstart)** - Command-line reference
- **[Understanding Reports](https://taylorferran.github.io/solana-privacy-scanner/reports/risk-levels)** - How heuristics work
- **[Contributing](https://taylorferran.github.io/solana-privacy-scanner/contributing/development)** - Development guide
- **[Changelog](./docs/changelog.md)** - Version history

---

## 🏗️ Project Structure

This is a monorepo containing multiple packages:

```
solana-privacy-scanner/
├── docs/                   # VitePress documentation + web UI
├── packages/
│   ├── core/              # solana-privacy-scanner-core (npm package)
│   └── cli/               # solana-privacy-scanner (npm package)
├── examples/              # Code examples for library usage
└── tests/                 # Comprehensive test suite (36 tests)
```

---

## 🧪 Testing & Quality

This project has comprehensive test coverage:

- ✅ **36 tests** across 4 test suites
- ✅ **Edge case handling** - undefined, null, empty data
- ✅ **RPC failure resilience** - Graceful degradation
- ✅ **All examples verified** - Wallet, transaction, program scans

Run tests:

```bash
npm test              # Watch mode
npm test -- --run     # CI mode
npm test -- --coverage # With coverage
```

---

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

# Run examples
cd examples
npm install
npm run wallet        # Test wallet scan
npm run transaction   # Test transaction scan
npm run program       # Test program scan
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Add Known Addresses

Help expand our database of known entities (CEXs, bridges, protocols):

1. Read the [Adding Addresses Guide](https://taylorferran.github.io/solana-privacy-scanner/contributing/addresses)
2. Add your addresses to `packages/core/src/labels/known-addresses.json`
3. Submit a PR with evidence/documentation

### Report Bugs

Found a bug? [Open an issue](https://github.com/taylorferran/solana-privacy-scanner/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node version, OS, etc.)

### Submit Code

1. Read the [Development Guide](https://taylorferran.github.io/solana-privacy-scanner/contributing/development)
2. Write tests for new features
3. Ensure all tests pass (`npm test -- --run`)
4. Submit a PR with clear description

---

## 🎯 What This Tool Does

### ✅ What It Is

- A **diagnostic tool** for measuring on-chain privacy exposure
- An **educational resource** for understanding blockchain privacy
- A **transparent scanner** with documented heuristics
- **Open source** software anyone can audit

### ❌ What It Is NOT

- Not a wallet or protocol
- Not surveillance software
- Not compliance tooling  
- Not a guarantee of deanonymization

**Important:** This tool does not deanonymize users. It analyzes privacy risk signals that already exist due to public blockchain data.

---

## 🔒 Privacy Heuristics

The scanner uses five transparent heuristics:

1. **Counterparty Reuse** - Repeated interactions with same addresses
2. **Amount Reuse** - Round numbers and repeated amounts
3. **Timing Patterns** - Transaction bursts and regular intervals
4. **Known Entity Interaction** - Connections to CEXs, bridges, protocols
5. **Balance Traceability** - Matching send/receive patterns

All heuristics are [fully documented](https://taylorferran.github.io/solana-privacy-scanner/reports/heuristics).

---

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

Built for privacy awareness, not surveillance. Use responsibly.

Special thanks to:
- The Solana community for feedback
- Contributors who help expand the known addresses database
- Everyone testing and reporting issues

---

## 📞 Links

- **[Documentation](https://taylorferran.github.io/solana-privacy-scanner)** - Full guides and API reference
- **[GitHub Repository](https://github.com/taylorferran/solana-privacy-scanner)** - Source code
- **[npm - Core Package](https://www.npmjs.com/package/solana-privacy-scanner-core)** - Scanning engine
- **[npm - CLI Package](https://www.npmjs.com/package/solana-privacy-scanner)** - Command-line tool
- **[Changelog](./docs/changelog.md)** - Version history and updates

---

**Made with care for the Solana ecosystem 🌟**
