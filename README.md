# Solana Privacy Scanner

[![npm - core](https://img.shields.io/npm/v/solana-privacy-scanner-core?label=core&color=blue)](https://www.npmjs.com/package/solana-privacy-scanner-core)
[![npm - cli](https://img.shields.io/npm/v/solana-privacy-scanner?label=cli&color=blue)](https://www.npmjs.com/package/solana-privacy-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Powered by QuickNode](https://img.shields.io/badge/Powered%20by-QuickNode-0d9488?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yIDEwTDEyIDE1TDIyIDEwVjE0TDEyIDE5TDIgMTRWMTBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=)](https://www.quicknode.com/)

> **Powered by [QuickNode](https://www.quicknode.com/)** - Enterprise-grade Solana RPC infrastructure provided as a public good. Zero configuration required.

A developer tool that analyzes Solana wallets, transactions, or programs using public on-chain data and produces deterministic privacy risk reports.

**Current Version:** `0.3.1` - [Changelog](./docs/changelog.md)

---

## ✨ Features

- 🔍 **Comprehensive scanning** - Analyze wallets, transactions, and programs
- 🎯 **Solana-native heuristics** - 11 privacy signals tailored to Solana's unique architecture
- 📊 **Clear risk assessments** - LOW/MEDIUM/HIGH ratings with transparent scoring
- ⚠️ **Critical leak detection** - Fee payer reuse, signer overlap, and more
- 🏷️ **Known entity detection** - Identifies CEXs, bridges, protocols, and major programs
- 💡 **Actionable guidance** - Specific mitigation recommendations for each risk
- 🧪 **Robust & tested** - 36 tests covering edge cases and error handling
- 🔓 **Open and transparent** - All heuristics documented, no black boxes
- 🌐 **Multiple interfaces** - CLI, library, and interactive web UI

---

## 🚀 Quick Start

### Try the Web UI

**[Launch Interactive Scanner →](https://sps.guide)**

Paste any Solana wallet address and scan instantly in your browser.

### Install CLI

```bash
npm install -g solana-privacy-scanner
solana-privacy-scanner scan-wallet <ADDRESS>
```

No setup required - includes a reliable RPC endpoint!

**Why It Just Works:** QuickNode provides enterprise-grade Solana RPC infrastructure with 99.9% uptime, <100ms response times, and global edge routing. This enables:
- **Zero configuration** - No API keys or setup needed
- **Reliable scans** - Consistent, fast results every time
- **Public good** - Free access for personal projects and learning

[Learn more about QuickNode's infrastructure →](https://sps.guide/guide/quicknode)

### CI/CD Integration

**See it in action:** [Example Repository](https://github.com/taylorferran/solana-privacy-scanner-example) with working PRs showing leak detection

```bash
npm install --save-dev solana-privacy-scanner-ci-tools
npx privacy-scanner-init
```

Test privacy in your development workflow:

```typescript
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';
import 'solana-privacy-scanner-ci-tools/matchers';

test('transfer maintains privacy', async () => {
  const tx = await createTransfer(user, recipient, amount);
  const report = await simulateTransactionPrivacy(tx, connection);
  
  expect(report).toHavePrivacyRisk('LOW');
  expect(report).toNotLeakUserRelationships();
});
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

// No RPC configuration needed!
const rpc = new RPCClient();
const labelProvider = createDefaultLabelProvider();
const rawData = await collectWalletData(rpc, 'WALLET_ADDRESS');
const context = normalizeWalletData(rawData, labelProvider);
const report = generateReport(context);

console.log('Overall Risk:', report.overallRisk);
console.log('Signals Found:', report.signals.length);
```

---

## 🛠️ Developer Tools

### Code Analyzer - Catch Privacy Leaks Before Deployment

Static code analysis tool that detects privacy vulnerabilities in your Solana TypeScript/JavaScript code during development.

```bash
npm install --save-dev solana-privacy-analyzer
npx solana-privacy-analyzer scan src/
```

**What it detects:**
- 🔴 **Fee payer reuse** in loops (CRITICAL) - Prevents transaction linkage
- 🔴 **PII in memos** (CRITICAL/HIGH/MEDIUM) - Stops personal data leaks
- ⚡ **Fast** - Scans projects in <5 seconds using AST parsing
- 🎯 **100% Deterministic** - No false negatives for known patterns

**CI/CD Ready:**
```yaml
# .github/workflows/privacy-check.yml
- name: Privacy Scan
  run: |
    npx solana-privacy-analyzer scan src/ --json > report.json
    CRITICAL=$(jq '.summary.critical' report.json)
    [ "$CRITICAL" -eq 0 ] || exit 1
```

[📖 Code Analyzer Documentation →](https://sps.guide/code-analyzer/overview)

### Claude Code Plugin

Interactive plugin for Claude Code that combines static analysis with AI-powered fixing.

```bash
# In Claude Code
/solana-privacy-scan src/
```

Claude will:
1. Run the static analyzer
2. Explain each privacy issue found
3. Propose context-aware fixes
4. Apply changes with your approval

[📖 Claude Plugin Documentation →](https://sps.guide/claude-plugin/overview)

---

## 📦 Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`solana-privacy-scanner-core`](https://www.npmjs.com/package/solana-privacy-scanner-core) | ![npm](https://img.shields.io/npm/v/solana-privacy-scanner-core) | Core scanning engine |
| [`solana-privacy-scanner`](https://www.npmjs.com/package/solana-privacy-scanner) | ![npm](https://img.shields.io/npm/v/solana-privacy-scanner) | CLI tool |
| [`solana-privacy-scanner-ci-tools`](https://www.npmjs.com/package/solana-privacy-scanner-ci-tools) | ![npm](https://img.shields.io/npm/v/solana-privacy-scanner-ci-tools) | CI/CD testing tools |
| [`solana-privacy-analyzer`](https://www.npmjs.com/package/solana-privacy-analyzer) | ![npm](https://img.shields.io/npm/v/solana-privacy-analyzer) | Code static analyzer |

---

## 📚 Documentation

**[View Full Documentation →](https://sps.guide)**

### On-Chain Analysis
- **[Getting Started](https://sps.guide/guide/getting-started)** - Installation and first scan
- **[Library API Reference](https://sps.guide/library/usage)** - Integration guide
- **[CLI Commands](https://sps.guide/cli/quickstart)** - Command-line reference
- **[Understanding Reports](https://sps.guide/reports/risk-levels)** - How heuristics work

### Developer Tools
- **[Code Analyzer](https://sps.guide/code-analyzer/overview)** - Static analysis for Solana code
- **[Claude Plugin](https://sps.guide/claude-plugin/overview)** - AI-powered privacy fixes
- **[CI/CD Integration](https://sps.guide/code-analyzer/ci-cd)** - Automate privacy checks

### Contributing
- **[Contributing](https://sps.guide/contributing/development)** - Development guide
- **[Changelog](./docs/changelog.md)** - Version history

---

## 🏗️ Project Structure

This is a monorepo containing multiple packages:

```
solana-privacy-scanner/
├── docs/                   # Docusaurus documentation + web UI
├── packages/
│   ├── core/              # solana-privacy-scanner-core (npm package)
│   ├── cli/               # solana-privacy-scanner (npm package)
│   ├── devtools/          # solana-privacy-devtools (npm package)
│   └── claude-plugin/     # Claude Code plugin (GitHub distribution)
└── tests/                 # Comprehensive test suite (95 tests)
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
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Add Known Addresses

Help expand our database of known entities (CEXs, bridges, protocols):

1. Read the [Adding Addresses Guide](https://sps.guide/contributing/addresses)
2. Add your addresses to `known-addresses.json` (repository root)
3. Submit a PR with evidence/documentation

PRs update the database immediately - no need to wait for package releases!

### Report Bugs

Found a bug? [Open an issue](https://github.com/taylorferran/solana-privacy-scanner/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node version, OS, etc.)

### Submit Code

1. Read the [Development Guide](https://sps.guide/contributing/development)
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

The scanner uses **nine Solana-specific heuristics**, ranked by deanonymization power:

### Critical Solana-Specific Heuristics

1. **Fee Payer Reuse** ⚠️ CRITICAL  
   Detects when one wallet pays fees for multiple accounts, creating hard linkage. Most powerful deanonymization vector on Solana.

2. **Signer Overlap** 🔴 HIGH  
   Identifies when the same signers appear across transactions, revealing control structures and multi-sig patterns.

3. **Known Entity Interaction** 🔴 HIGH  
   Flags direct interactions with CEXs, bridges, and KYC services.

### Behavioral Fingerprinting

4. **Counterparty & PDA Reuse** 🟡 MEDIUM  
   Tracks repeated interactions with the same addresses, PDAs, and program accounts.

5. **Instruction Fingerprinting** 🟡 MEDIUM  
   Detects unique program interaction patterns and instruction sequences.

6. **Token Account Lifecycle** 🟡 MEDIUM  
   Traces rent refunds from closed token accounts, linking burner accounts to owners.

### Traditional Heuristics (Solana-Adapted)

7. **Timing Patterns** 🟢 LOW-MEDIUM  
   Identifies transaction bursts, periodic patterns, and automation signatures.

8. **Amount Reuse** 🟢 LOW  
   Flags repeated amounts (downgraded for Solana - round numbers are common and benign).

9. **Balance Traceability** 🟢 LOW  
   Analyzes balance changes and flow patterns across transactions.

All heuristics are [fully documented](https://sps.guide/reports/heuristics) with severity thresholds and mitigation guidance.

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

- **[Documentation](https://sps.guide)** - Full guides and API reference
- **[GitHub Repository](https://github.com/taylorferran/solana-privacy-scanner)** - Source code
- **[npm - Core Package](https://www.npmjs.com/package/solana-privacy-scanner-core)** - Scanning engine
- **[npm - CLI Package](https://www.npmjs.com/package/solana-privacy-scanner)** - Command-line tool
- **[npm - CI Tools](https://www.npmjs.com/package/solana-privacy-scanner-ci-tools)** - Testing & CI/CD integration
- **[npm - Code Analyzer](https://www.npmjs.com/package/solana-privacy-analyzer)** - Static code analysis
- **[Changelog](./docs/changelog.md)** - Version history and updates

---

## 🌐 Infrastructure

This project is powered by **[QuickNode](https://www.quicknode.com/)** as a public good for the Solana ecosystem.

### Why QuickNode?

**Reliability & Performance:**
- 99.9% uptime SLA
- <100ms average response time
- Global edge network for low latency
- Auto-scaling infrastructure

**Developer Experience:**
- Zero configuration required
- No API keys or sign-up needed
- Works immediately after installation
- Same reliability for everyone

**Public Good Commitment:**
- Free access for personal projects
- Open source enablement
- Educational use supported
- Community-first approach

QuickNode's infrastructure makes privacy scanning **just work** - no setup friction, no configuration complexity, no reliability concerns.

[Read more about QuickNode's partnership →](https://sps.guide/guide/quicknode)

### For Production Use

Building a high-volume service? Get your own [QuickNode endpoint](https://www.quicknode.com/) for:
- Higher rate limits (10-100+ req/s)
- Custom SLAs
- Premium support
- Analytics dashboard

---

## 🙏 Acknowledgments

**Special thanks to [QuickNode](https://www.quicknode.com/)** for providing the RPC infrastructure that powers this tool as a public good. Without QuickNode:
- Users would need to configure their own RPC endpoints
- Reliability would be inconsistent
- Setup friction would limit adoption
- Privacy analysis wouldn't be accessible to everyone

QuickNode's commitment to supporting open source tools demonstrates their dedication to building a better Solana ecosystem.

**Also thanks to:**
- The Solana community for feedback
- Contributors who help expand the known addresses database
- Everyone testing and reporting issues
- Vercel for documentation hosting
