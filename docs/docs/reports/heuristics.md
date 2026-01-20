# Privacy Heuristics Explained

Deep dive into each detection method. The scanner uses **nine Solana-native heuristics** ranked by deanonymization power.

---

## Critical Solana-Specific Heuristics

### 1. Fee Payer Reuse ⚠️ CRITICAL

**The #1 deanonymization vector on Solana.**

**What It Detects:** The wallet(s) paying transaction fees.

**Why Critical:**
- Creates permanent on-chain linkage
- Reveals control structures (who funds whom)
- Exposes bot infrastructure
- Fee payer is explicitly tracked in Solana's transaction structure

**Example:**
```
Wallet A pays fees for Wallets B, C, D
→ All four wallets are trivially linked
```

**Mitigation:**
- Always pay your own transaction fees
- Never use relayers unless absolutely necessary
- Bot operators: Use unique fee payers per bot

**Severity:**
- CRITICAL: Never pays own fees
- HIGH: External wallets pay fees multiple times
- MEDIUM: Mixed fee payers

---

### 2. Signer Overlap 🔴 HIGH

**Cryptographic proof of control relationships.**

**What It Detects:** Repeated signers and multi-sig patterns.

**Why Important:**
- Signatures prove control
- Multi-sig reveals organizational structure
- Authority keys exposed
- Stronger than behavioral patterns

**Example:**
```
Txs 1-5: Signed by [A, B]
Txs 6-10: Signed by [A, C]
→ A is authority controlling B and C
```

**Mitigation:**
- Rotate signing keys for unrelated activities
- Use separate authorities for different purposes
- Vary multi-sig participants

**Severity:**
- HIGH: Signer in >70% of transactions
- HIGH: Authority hub (co-signs with many wallets)
- MEDIUM: Repeated multi-sig patterns

---

### 3. Known Entity Interaction 🔴 HIGH

**Direct linkage to real-world identity.**

**What It Detects:** Interactions with CEXs, bridges, protocols.

**Why Important:**
- CEXs have your KYC data
- Memos reveal deposit information
- Permanent public record

**Example:**
```
Transfer to Binance with memo
→ Binance knows this address is yours
→ All activity linked to your identity
```

**Mitigation:**
- Never send directly to CEXs from private wallets
- Use intermediate bridge wallets with delays
- Be careful with memos (permanent and public)

**Severity:**
- HIGH: CEX interaction (KYC linkage)
- MEDIUM: Bridge/DeFi protocol
- LOW: Common system programs

---

## Behavioral Fingerprinting

### 4. Counterparty & PDA Reuse 🟡 MEDIUM

**Solana-aware interaction tracking.**

**What It Detects:**
- Traditional address reuse
- PDA (Program-Derived Address) interactions
- Program usage patterns
- Counterparty-program combinations

**Why Important:**
- Most Solana interactions are via programs
- PDAs are user-specific (your DEX position)
- Program combinations create fingerprints

**Example:**
```
15 interactions with PDA abc123... (Jupiter position)
→ All 15 transactions linked
→ Reveals your DeFi strategy
```

**Mitigation:**
- Some PDA reuse is unavoidable
- Use fresh wallets for sensitive operations
- Diversify protocols

**Severity:**
- MEDIUM: Repeated PDA (5+ times)
- MEDIUM: Same counterparty + same program
- LOW: Program usage patterns

---

### 5. Instruction Fingerprinting 🟡 MEDIUM

**Behavioral signatures through program interactions.**

**What It Detects:**
- Instruction sequence patterns
- Program usage profiles
- PDA interaction patterns
- Instruction data similarity

**Why Important:**
- Instruction structure is like a strategy fingerprint
- Links activity even with different addresses
- Reveals automation and bot strategies

**Example:**
```
Pattern: System → SPL Token → Jupiter → SPL Token
→ Unique DeFi strategy fingerprint
→ All matching patterns likely same user
```

**Mitigation:**
- Vary instruction order when possible
- Diversify strategies across wallets
- Accept that complex operations are fingerprinted

**Severity:**
- MEDIUM: Repeated sequence (50%+ of txs)
- LOW: Distinctive program profile
- LOW: Repeated instruction types

---

### 6. Token Account Lifecycle 🟡 MEDIUM

**Rent refunds link burner accounts to owners.**

**What It Detects:**
- Token account creation/closure cycles
- Rent refund patterns
- Short-lived accounts
- Burner account usage

**Why Important:**
- Rent refunds (~0.002 SOL) link back to owner
- Defeats purpose of burner accounts
- Create-close cycles reveal privacy attempts

**Example:**
```
Create token account → Use once → Close
→ Rent refund to main wallet
→ Burner no longer anonymous
```

**Mitigation:**
- Don't close token accounts if privacy matters
- Accept small rent cost instead of refunding
- Use fresh wallets without refunds

**Severity:**
- MEDIUM: Frequent create/close cycles
- MEDIUM: Multiple refunds to same address
- LOW: Short-lived accounts

---

## Traditional Heuristics (Solana-Adapted)

### 7. Timing Patterns 🟢 LOW-MEDIUM

**Time-based behavioral patterns.**

**What It Detects:**
- Transaction bursts
- Periodic patterns (automation)
- Regular intervals

**Solana Context:**
- Bots are common (high TPS)
- MEV causes natural clustering
- Periodic timing stronger signal than bursts

**Mitigation:**
- Add random delays
- Spread transactions over time
- Batch operations

**Severity:**
- MEDIUM: Periodic timing (automation)
- LOW: Transaction bursts

---

### 8. Amount Reuse 🟢 LOW

**Repeated amounts (DOWNGRADED for Solana).**

**What It Detects:**
- Repeated transaction amounts
- Round numbers

**Why Downgraded:**
- Round numbers are common on Solana
- SPL tokens have fixed decimals
- Programs emit deterministic amounts
- Only strong when combined with other patterns

**Mitigation:**
- Vary amounts when sending to same address
- Accept that this is weak signal alone

**Severity:**
- MEDIUM: Same amount + same counterparty (3+)
- LOW: Repeated amounts alone
- LOW: Round numbers (benign)

---

### 9. Balance Traceability 🟢 LOW

**Fund flow analysis (adapted for Solana).**

**What It Detects:**
- Balance changes and flow patterns

**Solana Account Model:**
- Focus on signer reuse
- Fee payer reuse more important
- Token account ownership

**Severity:**
- LOW: Supporting evidence only

---

## Heuristic Power Ranking

| Rank | Heuristic | Severity | Power |
|------|-----------|----------|-------|
| 1 | Fee Payer Reuse | CRITICAL | ⚠️⚠️⚠️ |
| 2 | Signer Overlap | HIGH | 🔴🔴 |
| 3 | Known Entity | HIGH | 🔴🔴 |
| 4 | Counterparty/PDA | MEDIUM | 🟡 |
| 5 | Instruction Fingerprinting | MEDIUM | 🟡 |
| 6 | Token Lifecycle | MEDIUM | 🟡 |
| 7 | Timing Patterns | LOW-MED | 🟢 |
| 8 | Amount Reuse | LOW | 🟢 |
| 9 | Balance Traceability | LOW | 🟢 |

---

## Combining Signals

**Example: CRITICAL Risk**
```
⚠️ Fee Payer Reuse (CRITICAL)
  → Never pays own fees

🔴 Signer Overlap (HIGH)
  → Same authority in 80% of txs

🔴 Known Entity (HIGH)
  → 3 Binance deposits

→ OVERALL: HIGH RISK
```

---

## What's New in v0.3.1

### Enhanced Granularity
- **New:** Memo Exposure heuristic with 3 signal types (PII exposure, descriptive content, general usage)
- **New:** Address Reuse heuristic with 3 signal types (high/moderate diversity, long-term usage)
- All heuristics now return arrays of signals for better specificity
- Enhanced mitigation suggestions for each signal type

### Improved Detection
- **Timing Patterns:** Now detects burst patterns, regular intervals, and timezone patterns separately
- **Balance Traceability:** Identifies matching pairs, sequential similar amounts, and full balance movements
- **Known Entity:** Returns entity-specific signals (exchange, bridge, other) instead of generic

---

## What's New in v0.2.0

### Solana-Native Redesign
- 4 new Solana-specific heuristics
- Fee payer analysis (most critical)
- Signer pattern detection
- PDA and program awareness
- Downgraded weak signals (amount reuse)

### Why This Matters
Previous versions missed Solana's unique architecture:
- Fee payer as explicit linkage
- Account-based model
- Program-mediated interactions
- Multi-signature patterns

---

## Limitations

:::warning What Heuristics Cannot Do
- Cannot prove identity (patterns only)
- Cannot see intent
- Cannot decrypt
- Privacy risk assessment, not certainty
:::

:::tip Solana Is Different
- Fee payer creates hard linkage
- Multi-sig exposes structure
- PDAs are user-specific
- Account model ≠ UTXO chains
:::

---

## Next Steps

- [Risk Levels](/docs/reports/risk-levels) - Overall risk calculation
- [Known Entities](/docs/reports/known-entities) - Labeled addresses
- [CLI Examples](/docs/cli/examples) - See in action
