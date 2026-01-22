# Core Concepts

## Heuristics

Rule-based analysis that detects privacy risk patterns. Not guarantees of deanonymization - risk indicators.

**Example:** If a wallet always sends exactly 1.5 SOL, this creates a recognizable fingerprint that could link transactions.

## Risk Levels

- **HIGH**: 2+ HIGH signals, or 1 HIGH + 2 MEDIUM
- **MEDIUM**: 1 HIGH, or 2+ MEDIUM, or 1 MEDIUM + 2 LOW  
- **LOW**: Few or no significant signals

## What Gets Detected

1. **Fee payer reuse** - Same fee payer across transactions
2. **Signer overlap** - Repeated signing patterns
3. **Counterparty reuse** - Repeated interactions with same addresses
4. **Timing patterns** - Transaction bursts, regular intervals
5. **Known entities** - CEX, bridge, protocol interactions
6. **Amount reuse** - Repeated transaction amounts
7. **Balance traceability** - Trackable fund flows
8. **Token lifecycle** - Account creation/closure patterns
9. **Instruction fingerprinting** - Unique program call patterns
10. **Memo exposure** - PII in transaction memos
11. **Address reuse** - Limited wallet diversity

## Limitations

:::warning[What This Tool Cannot Do]
- **Cannot prove identity** - Only indicates risk
- **Cannot see off-chain data** - Only uses public blockchain data
- **Cannot decrypt** - No access to private keys or encrypted data
:::
