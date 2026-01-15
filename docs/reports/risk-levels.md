# Understanding Risk Levels

Learn how the scanner calculates and reports privacy risks.

## The Three Risk Levels

### 🟢 LOW Risk

**What it means:**  
Minimal privacy exposure. Standard blockchain visibility with no significant patterns that aid deanonymization.

**Typical scenarios:**
- Few transactions analyzed
- No repeated patterns detected
- No known entity interactions
- Varied transaction behavior

**What to do:**  
Continue practicing good privacy hygiene. You're doing well!

---

### 🟡 MEDIUM Risk

**What it means:**  
Moderate privacy exposure. Some patterns exist that could aid in linking transactions or profiling behavior.

**Typical scenarios:**
- 1 HIGH severity signal
- 2+ MEDIUM severity signals
- Some counterparty reuse
- Moderate timing patterns
- Mixed risk indicators

**What to do:**
- Review the specific signals
- Implement recommended mitigations
- Consider using multiple wallets
- Vary transaction patterns

---

### 🔴 HIGH Risk

**What it means:**  
Significant privacy exposure. Clear patterns exist that make deanonymization efforts substantially easier.

**Typical scenarios:**
- 2+ HIGH severity signals
- 1 HIGH + 2 MEDIUM signals
- Direct CEX interactions
- Severe amount/timing reuse
- Multiple clustering signals

**What to do:**
- **Take action immediately**
- Compartmentalize activities across wallets
- Avoid direct CEX interactions from privacy-sensitive addresses
- Use intermediate "mixing" wallets
- Review all mitigation recommendations

## How Risk is Calculated

### Step 1: Individual Signal Detection

Each heuristic analyzes the data and may generate a risk signal with severity:
- **HIGH**: Significant, exploitable pattern
- **MEDIUM**: Moderate pattern that aids analysis
- **LOW**: Minor pattern with limited impact

### Step 2: Signal Aggregation

The scanner counts signals by severity:

```typescript
const highCount = signals.filter(s => s.severity === 'HIGH').length;
const mediumCount = signals.filter(s => s.severity === 'MEDIUM').length;
const lowCount = signals.filter(s => s.severity === 'LOW').length;
```

### Step 3: Overall Risk Calculation

Deterministic thresholds are applied:

```
if (highCount >= 2 OR (highCount >= 1 AND mediumCount >= 2))
  → HIGH RISK

if (highCount >= 1 OR mediumCount >= 2 OR (mediumCount >= 1 AND lowCount >= 2))
  → MEDIUM RISK

otherwise
  → LOW RISK
```

## Example Scoring

### Example 1: HIGH Risk

**Signals detected:**
- Known Entity Interaction (HIGH) - Binance deposits
- Counterparty Reuse (HIGH) - 10 interactions with same address
- Timing Correlation (MEDIUM) - Transaction bursts

**Calculation:**  
2 HIGH signals → **HIGH RISK**

---

### Example 2: MEDIUM Risk

**Signals detected:**
- Counterparty Reuse (MEDIUM) - 5 interactions
- Timing Correlation (MEDIUM) - Some bursts
- Balance Traceability (LOW) - Minor patterns

**Calculation:**  
2 MEDIUM + 1 LOW → **MEDIUM RISK**

---

### Example 3: LOW Risk

**Signals detected:**
- No significant patterns

**Calculation:**  
0 signals → **LOW RISK**

## Confidence Scores

Each signal includes a confidence percentage:

| Confidence | Meaning |
|------------|---------|
| 95-100% | Very high confidence - clear, unambiguous pattern |
| 80-94% | High confidence - strong evidence |
| 60-79% | Moderate confidence - likely pattern |
| 40-59% | Low confidence - possible pattern |
| <40% | Very low confidence - uncertain |

**Example:**
```
Known Entity Interaction [HIGH]
Confidence: 95%
```
This signal is very reliable - the address is confirmed in the known entity database.

## Why Deterministic?

The scanner uses **deterministic** (not probabilistic) scoring rules because:

1. **Reproducibility**: Same input always produces same output
2. **Transparency**: Rules are clear and documented
3. **No black boxes**: You know exactly how scores are calculated
4. **Testability**: Behavior can be verified
5. **Honesty**: No overly confident ML models

## Limitations

::: warning Keep in Mind
- **Not absolute**: Risk levels are indicators, not guarantees
- **Context-dependent**: Some patterns are normal in some contexts
- **Snapshot**: Based only on analyzed transactions (limited by --max-signatures)
- **Conservative**: Designed to flag potential issues, may have false positives
:::

## Reading Your Report

When you scan, focus on:

1. **Overall Risk** - Quick assessment
2. **Individual Signals** - Specific issues
3. **Evidence** - What patterns were detected
4. **Mitigations** - Concrete steps to improve

Don't panic if you see MEDIUM or HIGH. Read the details and understand **why** the risk was assigned.

## Next Steps

- **[Heuristics](/reports/heuristics)** - Understanding each detection method
- **[Known Entities](/reports/known-entities)** - Database of tracked addresses
- **[CLI Examples](/cli/examples)** - See real scans
