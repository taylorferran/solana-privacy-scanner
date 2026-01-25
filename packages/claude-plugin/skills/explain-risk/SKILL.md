---
name: explain-risk
description: This skill should be used when the user asks "explain this risk", "what is fee payer reuse", "why does this matter", wants to understand a specific privacy risk, or needs educational explanations about Solana privacy vulnerabilities.
version: 1.0.0
---

# Explain Risk - Privacy Risk Education

Provides detailed, educational explanations of specific privacy risks detected in Solana applications.

## Purpose

When the scanner detects privacy issues, this skill helps developers understand:
- What the risk is and how it works
- Why it matters for user privacy
- Real-world deanonymization scenarios
- How to prevent and mitigate the issue
- Solana-specific considerations

## Usage

```
/explain-risk <signal-id>
/explain-risk fee-payer-reuse
/explain-risk memo-pii
/explain-risk --list
```

## Parameters

- `<signal-id>` - The ID of the privacy risk to explain (required)
- `--list` - Show all available risk IDs with brief descriptions

## Available Risk IDs

### Solana-Specific (Critical)

**`fee-payer-reuse`** (CRITICAL)
- External fee payer used across multiple accounts
- Most powerful deanonymization vector on Solana

**`fee-payer-never-self`** (HIGH)
- Account never pays its own fees
- Indicates external funding relationship

**`signer-overlap`** (HIGH)
- Repeated signer combinations across transactions
- Links multiple accounts to same entity

**`memo-pii`** (CRITICAL/HIGH/MEDIUM)
- Personal information in transaction memos
- Includes emails, phones, SSNs, names, addresses

**`address-reuse`** (MEDIUM/LOW)
- Lack of address rotation
- Single address used repeatedly

### Behavioral Analysis

**`known-entity-cex`** (HIGH)
- Interaction with centralized exchange
- KYC data linkage risk

**`known-entity-bridge`** (MEDIUM)
- Cross-chain bridge usage
- Multi-chain correlation risk

**`known-entity-protocol`** (LOW)
- Interaction with DeFi protocols
- Transaction pattern exposure

**`counterparty-reuse`** (MEDIUM/LOW)
- Repeated transaction partners
- Relationship graph exposure

**`timing-burst`** (HIGH)
- Concentrated transaction activity
- Automated bot fingerprint

**`timing-regular`** (MEDIUM)
- Regular transaction intervals
- Scheduled payment pattern

**`timing-timezone`** (LOW)
- Transactions clustered by time-of-day
- Geographic location hint

**`instruction-fingerprint`** (MEDIUM)
- Unique program call patterns
- Developer/app identification

**`token-account-lifecycle`** (MEDIUM)
- Token account creation/closure patterns
- Rent refund linking

**`amount-reuse`** (LOW)
- Repeated transaction amounts
- Less impactful on Solana due to account model

**`balance-traceability`** (MEDIUM)
- Traceable fund flows
- Source/destination linking

## Example Usage

### Explain a specific risk
```
/explain-risk fee-payer-reuse
```

**Output:**
- Full explanation of fee payer reuse
- Why it's the #1 privacy risk on Solana
- Real-world deanonymization example
- Code-level prevention strategies
- Best practices

### List all available risks
```
/explain-risk --list
```

**Output:**
- Complete list of risk IDs
- Brief description of each
- Severity level
- Related risks

## Output Format

Each explanation includes:

1. **Overview** - What the risk is
2. **Why It Matters** - Privacy impact
3. **How It Works** - Technical explanation
4. **Real-World Scenario** - Deanonymization example
5. **Detection Methods** - How scanner finds it
6. **Prevention** - How to avoid the risk
7. **Mitigation** - How to fix existing issues
8. **Solana-Specific Notes** - Platform considerations
9. **Related Risks** - Connected privacy issues
10. **Resources** - Links to documentation

## Integration

This skill is designed to be used after `/scan-code` or `/scan-wallet`:

```
1. /scan-wallet ADDRESS
   → Detects "fee-payer-reuse" signal

2. /explain-risk fee-payer-reuse
   → Learn about the risk in detail

3. /suggest-fix fee-payer-reuse
   → Get code-level fix suggestions
```

## Knowledge Base

Explanations cover all 11 heuristics used by the scanner:
- 4 Solana-specific critical heuristics
- 5 behavioral analysis heuristics
- 3 traditional privacy heuristics (adapted for Solana)

All explanations are:
- **Accurate** - Based on actual Solana architecture
- **Educational** - Teach privacy concepts
- **Actionable** - Include specific fixes
- **Context-aware** - Solana-native considerations

## Notes

- Risk IDs match the `id` field in `PrivacySignal` objects
- Use this after scanning to understand detected issues
- Educational content suitable for developers at all levels
- Explanations focus on Solana's unique privacy characteristics
