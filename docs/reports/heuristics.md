# Privacy Heuristics Explained

Deep dive into each detection method used by the scanner.

## 1. Balance Traceability

### What It Detects
The ability to follow fund flows through transactions by analyzing balance changes.

### How It Works
```typescript
// Simplified logic
for (transaction of transactions) {
  const balanceChanges = analyzePrePostBalances(transaction);
  if (balanceChanges.length > threshold) {
    // Funds are easily traceable
    flagRisk();
  }
}
```

### Why It Matters
- **Adversary capability**: Can track where money came from and where it went
- **Privacy impact**: Creates a financial graph connecting addresses
- **Real-world risk**: Enables "taint analysis" linking addresses to events

### Example
```
Address A sends 10 SOL → Address B → Address C (9.99 SOL)
```
The 10 SOL can be traced through all three addresses.

### Mitigation
- Use intermediate addresses to break the chain
- Mix funds with other transactions
- Use privacy-preserving protocols when available

### Severity
- **HIGH**: Clear, direct traceability across multiple hops
- **MEDIUM**: Some traceability with mixing
- **LOW**: Difficult to trace beyond one hop

---

## 2. Amount Reuse

### What It Detects
Repeated use of identical or very similar transaction amounts.

### How It Works
```typescript
const amounts = transactions.map(tx => tx.amount);
const frequency = countDuplicates(amounts);

if (frequency[amount] >= 3) {
  // Same amount used multiple times = fingerprint
  flagRisk();
}
```

### Why It Matters
- **Fingerprinting**: Deterministic amounts create unique signatures
- **Linkability**: Can connect transactions even without direct address links
- **Behavioral pattern**: Reveals automated or scripted activity

### Example
```
5 transactions all sending exactly 1.5 SOL
→ Clear fingerprint, likely same user/bot
```

### Mitigation
- Vary transaction amounts slightly
- Add random "dust" amounts
- Batch operations to reduce transaction count

### Severity
- **HIGH**: 5+ uses of exact same amount
- **MEDIUM**: 3-4 uses or very similar amounts
- **LOW**: 2 uses with some variation

---

## 3. Counterparty Reuse

### What It Detects
Repeated interactions with the same addresses.

### How It Works
```typescript
const counterparties = new Map();

for (transfer of transfers) {
  const other = transfer.from === wallet ? transfer.to : transfer.from;
  counterparties.set(other, (counterparties.get(other) || 0) + 1);
}

// Flag if any counterparty appears many times
```

### Why It Matters
- **Clustering**: Reveals relationships and transaction networks
- **Deanonymization**: If one address is known, others can be inferred
- **Pattern analysis**: Shows regular business relationships

### Example
```
Wallet A interacts with Wallet B 15 times
→ Clear relationship, possibly same owner or regular counterparty
```

### Mitigation
- Use different addresses for different counterparties
- Rotate receiving addresses
- Compartmentalize activities

### Severity
- **HIGH**: 10+ interactions with same address
- **MEDIUM**: 5-9 interactions
- **LOW**: 2-4 interactions

---

## 4. Timing Correlation

### What It Detects
Time-based patterns including bursts, regular intervals, and suspicious timing.

### How It Works
```typescript
const timestamps = transactions.map(tx => tx.blockTime).sort();

// Check for bursts (many txs in short time)
for (i in timestamps) {
  const window = timestamps.slice(i, i+10);
  const duration = window[9] - window[0];
  
  if (duration < 1_hour) {
    flagBurst();
  }
}
```

### Why It Matters
- **Temporal fingerprinting**: Timing creates unique signatures
- **Event correlation**: Can link transactions to real-world events
- **Bot detection**: Regular intervals reveal automation

### Example
```
10 transactions in 5 minutes
→ Burst pattern, possibly automated or panicked activity
```

### Mitigation
- Spread transactions over time
- Add random delays
- Use scheduled transactions
- Batch when possible

### Severity
- **HIGH**: 10+ txs in <1 hour (severe burst)
- **MEDIUM**: 5-9 txs in <2 hours (moderate burst)
- **LOW**: Minor timing patterns

---

## 5. Known Entity Interaction

### What It Detects
Transfers to/from labeled addresses (CEXs, bridges, etc.).

### How It Works
```typescript
const knownEntities = loadLabelDatabase();

for (transfer of transfers) {
  const label = knownEntities.get(transfer.to) || 
                knownEntities.get(transfer.from);
  
  if (label && label.type === 'exchange') {
    flagHighRisk(); // CEX = identity linkage
  }
}
```

### Why It Matters
- **Identity linkage**: CEXs know your real identity via KYC
- **Cross-chain tracking**: Bridges connect multiple blockchains
- **Centralization risk**: Known entities collect metadata

### Example
```
Transfer to Binance hot wallet
→ Binance now knows this address belongs to you
```

### Mitigation
- Never send directly from privacy-sensitive wallets to CEXs
- Use intermediate "bridge" wallets
- Avoid KYC services when possible

### Severity
- **HIGH**: CEX interactions (direct identity linkage)
- **MEDIUM**: Bridge/DeFi protocol interactions
- **LOW**: Interaction with common system programs

---

## Confidence Scoring

Each heuristic includes a confidence score:

| Score | Meaning | Example |
|-------|---------|---------|
| 95%+ | Very high - undeniable pattern | Known CEX interaction |
| 80-94% | High - clear pattern | 5+ amount reuses |
| 60-79% | Moderate - likely pattern | Possible timing correlation |
| 40-59% | Low - uncertain | Ambiguous patterns |
| <40% | Very low - speculative | Weak signals |

## Combining Heuristics

The scanner's power comes from combining multiple heuristics:

### Example: HIGH Risk Profile
```
✗ Known Entity Interaction (HIGH, 95%)
  → 3 Binance deposits

✗ Counterparty Reuse (HIGH, 90%)
  → 15 interactions with same address

✗ Timing Correlation (MEDIUM, 80%)
  → Burst of 8 transactions

→ OVERALL: HIGH RISK
```

Multiple signals reinforce each other, increasing confidence in the assessment.

## Limitations

::: warning What Heuristics Cannot Do
- **Cannot prove identity** - Only indicate patterns
- **Cannot see intent** - Patterns might be innocent
- **Cannot predict future** - Based on past data only
- **Cannot decrypt** - Only uses public data
:::

## Next Steps

- **[Risk Levels](/reports/risk-levels)** - How risks are scored
- **[Known Entities](/reports/known-entities)** - Database details
- **[CLI Examples](/cli/examples)** - See heuristics in action
