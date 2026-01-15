# Solana Privacy Scanner Documentation

Welcome to the Solana Privacy Scanner documentation!

This site contains everything you need to understand, use, and contribute to the privacy scanner.

## Quick Links

<div class="vp-cards">
  <div class="vp-card">
    <h3>🚀 Getting Started</h3>
    <p>Install and run your first scan in under 5 minutes</p>
    <a href="/guide/getting-started">Get Started →</a>
  </div>

  <div class="vp-card">
    <h3>💻 CLI Guide</h3>
    <p>Complete command reference and examples</p>
    <a href="/cli/quickstart">CLI Docs →</a>
  </div>

  <div class="vp-card">
    <h3>📊 Understanding Reports</h3>
    <p>Learn how to interpret scan results</p>
    <a href="/reports/risk-levels">Risk Levels →</a>
  </div>

  <div class="vp-card">
    <h3>🤝 Contributing</h3>
    <p>Help expand the known entity database</p>
    <a href="/contributing/addresses">Contribute →</a>
  </div>
</div>

## What is This?

Solana Privacy Scanner is a developer tool that analyzes Solana wallets, transactions, or programs using public on-chain data to identify privacy risks.

## Key Features

- ✅ **Scan Wallets, Transactions, Programs** - Analyze any Solana address or signature
- ✅ **Clear Risk Scores** - Get LOW/MEDIUM/HIGH assessments
- ✅ **Known Entity Detection** - Identify CEX, bridge, and protocol interactions
- ✅ **Actionable Guidance** - Receive specific mitigation recommendations
- ✅ **Transparent** - All heuristics are documented and open source

## Quick Example

```bash
# Install
npm install -g solana-privacy-scanner

# Scan a wallet
solana-privacy-scanner scan-wallet <YOUR_WALLET> --rpc <YOUR_RPC>
```

## Documentation Sections

### Guide
- [What is this?](/guide/what-is-this) - Project overview and philosophy
- [Getting Started](/guide/getting-started) - Installation and first scan
- [Core Concepts](/guide/concepts) - Understanding privacy heuristics

### CLI
- [Quickstart](/cli/quickstart) - Fast intro to CLI usage
- [User Guide](/cli/user-guide) - Complete command reference
- [Examples](/cli/examples) - Real-world scanning scenarios

### Reports
- [Risk Levels](/reports/risk-levels) - How risk scores are calculated
- [Heuristics](/reports/heuristics) - Deep dive into each detection method
- [Known Entities](/reports/known-entities) - Database of tracked addresses

### Contributing
- [Adding Addresses](/contributing/addresses) - Expand the entity database
- [Development](/contributing/development) - Contributing code

## Why Privacy Matters

Public blockchains like Solana are transparent by design. Every transaction is permanently recorded and publicly visible. This creates:

- **Traceability** - Fund flows can be tracked
- **Clustering** - Related addresses can be linked
- **Profiling** - Behavioral patterns can be analyzed
- **Deanonymization** - Real identities can be inferred

This tool helps you understand your exposure and take action to improve privacy.

## Not Surveillance

This tool is for **privacy awareness**, not surveillance. It:

- ✅ Educates users about blockchain privacy
- ✅ Helps developers build privacy-aware applications
- ✅ Uses only publicly available data
- ✅ Is transparent about its methods and limitations

- ❌ Does not deanonymize users
- ❌ Does not track individuals
- ❌ Does not collect or store scan data
- ❌ Is not compliance or surveillance software

## Open Source

The entire project is open source and transparent:

- **Source code**: Available on GitHub
- **Heuristics**: Fully documented
- **Data**: Known entity database is public
- **Methods**: No black boxes or hidden algorithms

## Get Started

Ready to analyze your privacy exposure?

<div style="text-align: center; margin: 2rem 0;">
  <a href="/guide/getting-started" class="vp-button brand" style="margin-right: 1rem;">Get Started</a>
  <a href="/cli/quickstart" class="vp-button alt">CLI Quickstart</a>
</div>

---

*Built for privacy awareness. Released under MIT License.*
