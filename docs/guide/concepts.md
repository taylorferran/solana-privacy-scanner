# Core Concepts

Understanding the key concepts behind Solana Privacy Scanner.

## Privacy Heuristics

The scanner uses **deterministic, rule-based heuristics** to identify privacy risk patterns. These are **not guarantees** of deanonymization - they are risk indicators.

### What is a Heuristic?

A heuristic is a rule-based analysis that says "if X pattern exists, there's a Y% chance of Z risk."

For example:
- **If** a wallet always sends exactly 1.5 SOL
- **Then** this creates a recognizable fingerprint
- **Risk**: Someone could link these transactions together

## The Five Core Heuristics

### 1. Balance Traceability

**What it detects**: Ability to track fund flows through transactions

**How it works**: Analyzes pre/post balances to see if funds can be followed

**Risk**: Adversaries can see where your money came from and where it went

### 2. Amount Reuse

**What it detects**: Repeated use of the same transaction amounts

**How it works**: Looks for deterministic amounts that appear multiple times

**Risk**: Creates a fingerprint that can link seemingly unrelated transactions

### 3. Counterparty Reuse

**What it detects**: Repeated interactions with the same addresses

**How it works**: Counts interactions with each counterparty

**Risk**: Creates clusters of related addresses, reveals relationships

### 4. Timing Correlation

**What it detects**: Time-based patterns (bursts, regular intervals)

**How it works**: Analyzes transaction timestamps for patterns

**Risk**: Timing fingerprints can link addresses and activities

### 5. Known Entity Interaction

**What it detects**: Interactions with labeled addresses (CEXs, bridges, protocols)

**How it works**: Matches counterparties against a database of known addresses

**Risk**: Known entities (especially CEXs) can link on-chain and off-chain identities

## Risk Severity Levels

Each heuristic assigns a severity to detected signals:

### LOW
Minor privacy exposure, limited exploitability

### MEDIUM
Moderate risk, could aid in deanonymization efforts

### HIGH
Significant privacy exposure, serious deanonymization risk

## Overall Risk Score

The overall risk is calculated by aggregating individual signals:

- **HIGH**: 2+ HIGH signals, or 1 HIGH + 2 MEDIUM
- **MEDIUM**: 1 HIGH, or 2+ MEDIUM, or 1 MEDIUM + 2 LOW
- **LOW**: Few or no significant signals

## Confidence Scores

Each signal includes a confidence percentage (0-100%):

- **95%+**: Very high confidence (e.g., known CEX interaction)
- **80-95%**: High confidence (e.g., clear amount reuse)
- **50-80%**: Moderate confidence (e.g., possible timing correlation)
- **<50%**: Low confidence (uncertain pattern)

## Known Entity Database

The scanner maintains a curated list of 15+ known addresses:

- **Exchanges**: Binance, Coinbase, Bybit, FTX
- **Bridges**: Wormhole, Allbridge
- **Protocols**: Jupiter, Orca, Raydium
- **Core Programs**: SPL Token, Metaplex, etc.

See [Known Entities](/reports/known-entities) for the full list.

## Limitations

::: warning What This Tool Cannot Do
- **Cannot prove identity** - Only indicates risk
- **Cannot see off-chain data** - Only uses public blockchain data
- **Cannot decrypt** - No access to private keys or encrypted data
- **Cannot track zero-knowledge transactions** - If/when Solana adds ZK privacy
:::

## Privacy is a Spectrum

Privacy is not binary (private vs. public). It's a spectrum:

```
Low Privacy          Medium Privacy          High Privacy
     |                      |                      |
 CEX user      →     Regular wallet    →    Privacy-conscious
 No awareness        Some practices          Best practices
```

This tool helps you understand where you are on that spectrum.

## Next Steps

- **[Risk Levels](/reports/risk-levels)** - Deep dive into risk scoring
- **[Heuristics](/reports/heuristics)** - Detailed heuristic explanations
- **[CLI Usage](/cli/quickstart)** - Start scanning
