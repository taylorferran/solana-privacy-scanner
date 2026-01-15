# Solana Privacy Scanner

A developer tool that analyzes Solana wallets, transactions, or programs using public on-chain data and produces a deterministic privacy risk report based on well-defined heuristics.

## What this is

* A **scanner and diagnostic tool**
* A **measurement of privacy exposure**, not proof of deanonymization
* A **developer library** with CLI and minimal web UI wrappers

## What this is not

* Not a wallet
* Not a protocol
* Not a privacy system
* Not surveillance software
* Not compliance tooling

**This tool does not deanonymize users.** It surfaces **privacy risk signals** that already exist due to public blockchain data.

## Core concept

Public Solana activity enables tracking, clustering, labeling, and profiling.
Solana Privacy Scanner makes that exposure **explicit, visible, and explainable**.

## Supported scan targets

* Wallet address
* Transaction signature
* Program ID

## Data sources

All analysis is based on standard Solana RPC calls (via QuickNode or any compatible RPC):

* `getSignaturesForAddress`
* `getTransaction`
* `getTokenAccountsByOwner`
* `getProgramAccounts`
* Transaction metadata
* Instruction data
* Block times

No zero-knowledge systems. No cryptography. No off-chain private data.

## Output

A deterministic privacy risk report containing:

* Overall privacy risk score (LOW / MEDIUM / HIGH)
* Individual risk signals with:
  * Reason
  * Evidence
  * Why it matters
  * Mitigation guidance
* Human-readable text output
* Machine-readable JSON output

## Privacy heuristics

These are **risk indicators**, not guarantees:

* Balance traceability
* Deterministic amount reuse
* Counterparty reuse / clustering
* Timing correlation (bursts, swaps + transfers)
* Known entity interaction (CEXs, bridges, major protocols — limited static set)

All heuristics are:

* Rule-based
* Transparent
* Deterministic
* Clearly labeled as probabilistic risk signals

## Interfaces

### CLI (Primary)

```bash
npx solana-privacy-scanner scan wallet <address> --rpc <rpc-url>
npx solana-privacy-scanner scan tx <signature> --rpc <rpc-url>
npx solana-privacy-scanner scan program <programId> --rpc <rpc-url>
```

Options:
* `--rpc` - RPC endpoint URL
* `--json` - Output as JSON
* `--max-signatures` - Limit number of transactions to analyze
* `--output` - Write to file

### Library (npm package)

```typescript
import { scanWallet } from '@solana-privacy-scanner/core';

const report = await scanWallet(address, {
  rpcUrl: 'https://your-rpc-endpoint.com',
  maxSignatures: 100
});

console.log(report.overallRisk); // LOW | MEDIUM | HIGH
console.log(report.signals); // Array of risk signals
```

### Web UI (Educational)

A minimal web interface for educational purposes:
* Single-page interface
* Address input and scan functionality
* Visual results display with risk signals
* Educational content about blockchain privacy

## Intended use

* Developer diagnostics
* Education about mass financial surveillance
* Privacy-aware application development
* CI / automated analysis

## Project structure

```
packages/
├── core/       # Core scanning engine and heuristics
├── cli/        # Command-line interface
├── server/     # HTTP API server (optional)
└── web/        # Minimal web UI (optional)
```

## Contributing

### Adding Known Addresses

We maintain a curated database of known Solana addresses (exchanges, bridges, protocols) to help identify privacy risks.

**Want to add an address?** See [CONTRIBUTING_ADDRESSES.md](./CONTRIBUTING_ADDRESSES.md) for guidelines.

We welcome community contributions of publicly documented addresses for:
- Centralized exchanges
- Cross-chain bridges  
- Major DeFi protocols
- Well-known programs

All submissions must be verified and publicly documented.

## License

TBD

## Disclaimer

This tool analyzes publicly available blockchain data. It produces privacy risk assessments based on heuristics and observable patterns. These assessments are probabilistic indicators, not definitive proof of identity linkage or deanonymization.