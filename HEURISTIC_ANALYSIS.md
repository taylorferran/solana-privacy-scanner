# Heuristic Review & Analysis

## Current Heuristics Analysis

### 1. **Fee Payer Reuse** (CRITICAL) ✅ KEEP
**Status:** Core Solana privacy vector  
**Reasoning:**
- Unique to Solana's architecture
- Most powerful linkage mechanism
- Well-implemented with 4 distinct cases
- Catches managed accounts, bots, infrastructure leaks
- Has good severity graduation

**Quality:** Excellent - comprehensive coverage

---

### 2. **Signer Overlap** (HIGH) ✅ KEEP  
**Status:** Core Solana privacy vector  
**Reasoning:**
- Multi-sig patterns are Solana-specific
- Authority structures visible on-chain
- Detects 3 distinct patterns (repeated signers, multi-sig sets, authority hubs)
- Links organizational structure

**Quality:** Excellent - well thought out

---

### 3. **Instruction Fingerprinting** (MEDIUM) ✅ KEEP  
**Status:** Behavioral analysis  
**Reasoning:**
- Detects automated/bot behavior
- Unique to Solana's instruction model
- 4 sub-cases (sequences, program clustering, PDA patterns, instruction types)
- Creates behavioral fingerprints

**Quality:** Good - could be enhanced with more sophisticated pattern matching

---

### 4. **Token Account Lifecycle** (MEDIUM) ✅ KEEP  
**Status:** Solana-specific mechanism  
**Reasoning:**
- Rent refund pattern is unique to Solana
- Defeats "burner account" privacy
- 4 distinct cases well-covered
- Practical and actionable

**Quality:** Excellent - addresses real privacy leak

---

### 5. **Counterparty Reuse** (VARIES) ✅ KEEP  
**Status:** Traditional + Solana-aware  
**Reasoning:**
- Upgraded to be PDA-aware
- Includes program interaction patterns
- Detects counterparty-program combos
- Good severity graduation

**Quality:** Good - well-adapted to Solana

---

### 6. **Amount Reuse** (LOW) ✅ KEEP (with current downgrade)  
**Status:** Downgraded for Solana context  
**Reasoning:**
- Correctly identifies that round numbers are common on Solana
- Only flags when combined with other signals (counterparty/signer)
- Appropriate severity downgrade from Ethereum-style analysis
- Still useful for automated behavior detection

**Quality:** Good - appropriately scoped

---

### 7. **Timing Patterns** (MEDIUM) ⚠️ NEEDS UPDATE  
**Status:** Currently returns single RiskSignal (old format)  
**Reasoning:**
- Still valuable - burst detection is useful
- BUT: Should return `PrivacySignal[]` for consistency
- Should detect more patterns:
  - Regular intervals (every hour, every day)
  - Timezone patterns
  - Coordinated timing with other addresses

**Action Required:** Refactor to return array, add more pattern detection

---

### 8. **Balance Traceability** (MEDIUM) ⚠️ NEEDS UPDATE  
**Status:** Currently returns single RiskSignal (old format), limited implementation  
**Reasoning:**
- Concept is valid
- BUT: Implementation is weak (simplified, no real balance tracking)
- Should return `PrivacySignal[]` for consistency
- Needs better balance chain analysis

**Action Required:** Refactor to return array, improve implementation

---

### 9. **Known Entity Interaction** (VARIES) ⚠️ NEEDS UPDATE  
**Status:** Currently returns single RiskSignal (old format)  
**Reasoning:**
- Very important for privacy
- CEX interactions are high-risk
- BUT: Should return `PrivacySignal[]` for consistency
- Could detect more patterns (deposit/withdrawal sequences)

**Action Required:** Refactor to return array

---

## Missing Heuristics - Should We Add?

### A. **MEV Exposure** ❌ DO NOT ADD (as general heuristic)
**Reasoning:**
- MEV on Solana is different from Ethereum
- Not primarily a privacy issue - it's a value extraction issue
- Detecting MEV-vulnerable patterns requires:
  - Understanding specific DEX mechanics
  - AMM pool state analysis
  - Slippage tolerance examination
  - Transaction ordering preferences
- This is better as a **custom heuristic example** for DeFi protocols
- Too protocol-specific for general scanner

**Alternative:** Keep it in custom heuristics documentation as an example

---

### B. **Memo Field Exposure** ✅ ADD  
**Reasoning:**
- Solana memo program is commonly used
- Can contain PII (personal identifying information)
- Easy to detect and flag
- Clear privacy violation when used incorrectly

**Implementation:**
```typescript
export function detectMemoExposure(context: ScanContext): PrivacySignal[] {
  // Check for memo program usage
  // Flag memos with:
  // - Email addresses
  // - Names
  // - URLs
  // - Long text (likely descriptive)
  // Severity: HIGH if PII detected, MEDIUM if descriptive text
}
```

---

### C. **Address Reuse** ✅ ADD  
**Reasoning:**
- Using same wallet for everything is a major privacy leak
- Easy to detect (single address, many interactions)
- Should encourage address rotation
- Different from counterparty reuse

**Implementation:**
```typescript
export function detectAddressReuse(context: ScanContext): PrivacySignal[] {
  // For wallet scans:
  // - Count distinct activity types (DeFi, NFT, gaming, DAO)
  // - Check if same address used across all types
  // - Flag high-diversity single addresses
  // Severity: HIGH if 4+ distinct use cases
}
```

---

### D. **Dust Attack Detection** ⚠️ MAYBE  
**Reasoning:**
- Receiving small amounts from unknown sources
- Used to track wallet linkages
- Relevant security/privacy issue on Solana

**Concern:**
- Hard to distinguish from legitimate airdrops
- May have false positives
- Severity: LOW (informational)

**Decision:** Maybe as LOW severity informational signal

---

### E. **Account Age Correlation** ❌ DO NOT ADD  
**Reasoning:**
- Multiple accounts created around same time
- Could indicate same operator
- BUT: Very weak signal, high false positive rate
- Account creation time is common data point
- Not specific enough

---

### F. **Transaction Graph Centrality** ❌ TOO COMPLEX  
**Reasoning:**
- Analyzing position in transaction graph
- High centrality = hub node = linking point
- Requires full graph analysis (expensive)
- Better done by specialized chain analysis tools

---

### G. **Cross-Chain Linkage** ❌ OUT OF SCOPE  
**Reasoning:**
- Bridge transactions linking Solana to other chains
- Requires monitoring multiple chains
- Out of scope for Solana-focused scanner

---

## Recommendations Summary

### Immediate Actions

1. **Refactor to PrivacySignal[] (3 heuristics):**
   - `timing-patterns.ts` - Update to return array
   - `balance-traceability.ts` - Update to return array
   - `known-entity.ts` - Update to return array

2. **Add New Heuristics (2 new):**
   - `memo-exposure.ts` - Detect PII in memos
   - `address-reuse.ts` - Detect lack of address rotation

3. **Enhance Existing:**
   - `timing-patterns.ts` - Add regular interval detection
   - `balance-traceability.ts` - Improve balance chain analysis

### Keep as Custom Heuristic Examples

- MEV exposure (DeFi-specific)
- Protocol misuse detection (protocol-specific)
- NFT sniping (marketplace-specific)
- DAO voting patterns (governance-specific)

### Do Not Add

- Transaction graph centrality (too complex)
- Account age correlation (too weak)
- Cross-chain linkage (out of scope)
- Dust attacks (maybe later as informational)

---

## Revised Heuristic List (11 total)

### Core Solana-Specific (5)
1. Fee Payer Reuse (CRITICAL) ✅
2. Signer Overlap (HIGH) ✅
3. Instruction Fingerprinting (MEDIUM) ✅
4. Token Account Lifecycle (MEDIUM) ✅
5. **Memo Exposure (HIGH)** 🆕

### Behavioral Analysis (4)
6. Counterparty Reuse (VARIES) ✅
7. **Address Reuse (HIGH)** 🆕
8. Amount Reuse (LOW) ✅
9. Timing Patterns (MEDIUM) ⚠️ needs update

### Balance & Identity (2)
10. Balance Traceability (MEDIUM) ⚠️ needs update
11. Known Entity Interaction (VARIES) ⚠️ needs update

---

## Implementation Priority

**Phase 1 (Critical):**
1. Refactor 3 old heuristics to return arrays
2. Add Memo Exposure heuristic

**Phase 2 (Important):**
3. Add Address Reuse heuristic  
4. Enhance Timing Patterns
5. Improve Balance Traceability

**Phase 3 (Polish):**
6. Consider Dust Attack detection (informational)
7. Add more sophisticated pattern matching to existing heuristics

---

## Why Not MEV as Default?

**MEV is not primarily a privacy issue - it's a value extraction issue.**

Privacy concerns:
- "Am I being watched?" ✓
- "Can my actions be linked?" ✓
- "Does this expose my identity?" ✓

MEV concerns:
- "Will I get frontrun?" ← Different problem
- "Is my transaction order manipulated?" ← Not privacy
- "Will I lose value to sandwich attacks?" ← Value, not privacy

**MEV exposure CAN leak some behavioral info** (trading strategy, size, timing), but:
- It's highly protocol-specific
- Detection requires deep DEX/AMM knowledge
- Better suited as custom heuristic for DeFi protocols
- General scanner can't meaningfully detect it

**Better approach:** Keep MEV in custom heuristics examples, show protocols how to detect their own MEV-vulnerable patterns.

---

## Conclusion

**Current heuristics are strong and well-designed for Solana.**

**Main issues:**
1. Three heuristics need refactoring (return format)
2. Two obvious gaps (memo exposure, address reuse)
3. Some implementations could be enhanced

**Overall assessment:** 8/10
- Solana-native focus is excellent
- Coverage of unique Solana vectors is comprehensive
- Need consistency in return types
- Missing a few obvious privacy vectors

**Action plan clear:** Refactor 3, add 2, enhance as needed.
