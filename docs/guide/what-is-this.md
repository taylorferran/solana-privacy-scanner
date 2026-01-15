# What is Solana Privacy Scanner?

Solana Privacy Scanner is a developer tool that analyzes Solana wallets, transactions, or programs using public on-chain data and produces a deterministic privacy risk report based on well-defined heuristics.

## What this is

* **A scanner and diagnostic tool**
* **A measurement of privacy exposure**, not proof of deanonymization
* **A developer library** with CLI and minimal web UI wrappers

::: warning Important
**This tool does not deanonymize users.** It surfaces **privacy risk signals** that already exist due to public blockchain data.
:::

## Core Concept

Public Solana activity enables tracking, clustering, labeling, and profiling.

Solana Privacy Scanner makes that exposure **explicit, visible, and explainable**.

## Why This Matters

Blockchain privacy is often misunderstood. Many users believe public blockchains provide anonymity when they actually provide:

- **Pseudonymity** - addresses are not directly linked to names
- **Transparency** - all transactions are public forever
- **Traceability** - fund flows can be tracked

This tool helps developers and users understand their actual privacy exposure.

## Supported Scan Targets

- **Wallet address** - Analyze a user's transaction history and patterns
- **Transaction signature** - Deep dive into a single transaction
- **Program ID** - Analyze interactions with a specific program

## Data Sources

All analysis is based on standard Solana RPC calls:

- `getSignaturesForAddress`
- `getTransaction`
- `getTokenAccountsByOwner`
- `getProgramAccounts`
- Transaction metadata
- Instruction data
- Block times

**No zero-knowledge systems. No cryptography. No off-chain private data.**

Everything the scanner sees is already publicly visible on the blockchain.

## Output

A deterministic privacy risk report containing:

- **Overall privacy risk score** (LOW / MEDIUM / HIGH)
- **Individual risk signals** with:
  - Reason
  - Evidence
  - Why it matters
  - Mitigation guidance
- **Human-readable text output**
- **Machine-readable JSON output**

## Intended Use

- Developer diagnostics
- Education about mass financial surveillance
- Privacy-aware application development
- CI / automated analysis

## Project Philosophy

This tool is built on principles of:

- **Transparency** - All heuristics are documented and open source
- **Honesty** - No overclaiming, clear about limitations
- **Education** - Help users understand privacy, not scare them
- **Determinism** - Same input always produces same output
- **Responsibility** - This is for awareness, not surveillance
