# Claude Code Plugin Plan: Solana Privacy Scanner

> **Goal:** Make privacy scanning dead simple - scan code automatically, show detailed reports only when issues are found.

**Philosophy:** The plugin should work invisibly until there's a problem. When there is, explain it thoroughly.

---

## Core Design Principle

**Simple Interaction:**
1. Developer writes Solana code
2. Plugin automatically scans on save
3. If clean → silence (no noise)
4. If issues → detailed report with fixes

**No complex commands. No user decision-making. Just works.**

---

## Plugin Structure (Simplified)

```
solana-privacy/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── skills/
│   └── privacy-scan/
│       └── SKILL.md             # Auto-invoked scan skill
├── hooks/
│   └── hooks.json               # Auto-scan on file save
└── README.md
```

**That's it.** No multiple commands, no MCP server (initially), no complexity.

---

## How It Works

### 1. Automatic Scanning (The Only Feature)

**Trigger:** File saved with Solana code
**Action:** Scan for privacy issues
**Response:** 
- Clean → Say nothing
- Issues found → Show detailed report

### 2. The Skill (Model-Invoked)

```markdown skills/privacy-scan/SKILL.md
---
name: privacy-scan
description: Automatically scans Solana code for privacy vulnerabilities when files are saved or code is written. Use whenever you see Solana transaction code.
---

# Solana Privacy Scanner

You automatically scan Solana code for privacy vulnerabilities. Run this check whenever:
- User writes transfer/transaction code
- User saves a file with Solana patterns
- User asks about privacy

## Detection Patterns

### 1. Fee Payer Reuse (CRITICAL)
**Pattern:**
```typescript
const feePayer = Keypair.generate();
await transfer1({ feePayer });
await transfer2({ feePayer }); // ⚠️ REUSED
```

**Risk:** Links all transactions together - completely compromises privacy
**Fix:** Generate unique fee payer per transfer

### 2. PII in Memos (CRITICAL)
**Pattern:**
```typescript
memo: "Payment to john@example.com" // ⚠️ EMAIL
memo: "User: john.smith"            // ⚠️ NAME
memo: "Order #12345 for +1-555..."  // ⚠️ PHONE
```

**Risk:** Personal information permanently public on-chain
**Fix:** Remove PII entirely or use off-chain references

### 3. Known Entity Interactions (HIGH)
**Pattern:**
```typescript
// Direct transfer to CEX
await transfer(wallet, BINANCE_ADDRESS, amount);
```

**Risk:** Links your identity to known entity
**Fix:** Use intermediary wallet

### 4. Signer Overlap (MEDIUM)
**Pattern:**
```typescript
const signers = [key1, key2, key3];
await op1({ signers }); // Same set
await op2({ signers }); // Creates fingerprint
```

**Risk:** Behavioral fingerprinting
**Fix:** Vary signer combinations

### 5. Round Numbers (LOW)
**Pattern:**
```typescript
amount: 1.0  // ⚠️
amount: 10.0 // ⚠️
```

**Risk:** Less significant but still creates patterns
**Fix:** Use precise amounts

---

## Report Format

When issues are found, provide a clear, actionable report:

```
🔒 Privacy Scan Complete

Found X issues in [filename]:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL ISSUES (Must Fix)

1. Fee Payer Reused (Lines 45-52)
   
   Current code:
   ```
   const feePayer = Keypair.generate();
   await transfer1({ feePayer });
   await transfer2({ feePayer });
   await transfer3({ feePayer });
   ```
   
   ⚠️ Impact: All 3 transfers are linkable on-chain. Anyone can see
   they came from the same source, completely defeating privacy.
   
   ✅ Fix:
   ```
   await transfer1({ feePayer: Keypair.generate() });
   await transfer2({ feePayer: Keypair.generate() });
   await transfer3({ feePayer: Keypair.generate() });
   ```
   
   Shall I apply this fix?

2. Email Exposed in Memo (Line 78)
   
   Current code:
   ```
   memo: "Payment to user@example.com for order #12345"
   ```
   
   ⚠️ Impact: Email address is permanently public and searchable.
   This can be used to link all your transactions to an identity.
   
   ✅ Fix: Remove memo entirely or use:
   ```
   memo: "Payment" // Generic
   // Or omit memo field entirely
   ```
   
   Shall I apply this fix?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 HIGH ISSUES (Should Fix)

3. Direct CEX Interaction (Line 89)
   
   Sending directly to known Binance wallet. This links your
   wallet to your CEX account identity.
   
   Consider: Use intermediary wallet pattern
   Your Wallet → Temp Wallet → CEX

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Privacy Score: 3/10 (High Risk)

Type "yes" to auto-fix issues #1 and #2, or let me know which
specific issues you'd like to address.
```

---

## When Issues Are Found

**Be proactive and helpful:**

1. **Explain the impact** - Why does this matter?
2. **Show the problematic code** - Make it obvious
3. **Provide the fix** - Exact code to use
4. **Offer to fix automatically** - One-word confirmation
5. **Educate** - Brief explanation so they learn

**Keep it conversational:**
- "I noticed this code reuses the fee payer..."
- "This would create a linkable transaction graph..."
- "Would you like me to fix this automatically?"

---

## When Code Is Clean

**Say nothing or give brief positive feedback:**

```
✅ Privacy check passed - no issues found
```

Or just stay silent. Don't be noisy when everything is good.

---

## Proactive Guidance

When user asks you to write Solana code, automatically write it correctly:

**User:** "Write a function to send SOL to 5 people"

**Claude:**
```typescript
async function sendToMultiple(recipients: PublicKey[], amounts: number[]) {
  for (let i = 0; i < recipients.length; i++) {
    // Using unique fee payer per transfer for privacy
    const feePayer = Keypair.generate();
    
    await connection.sendTransaction(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipients[i],
          lamports: amounts[i],
        })
      ),
      [wallet, feePayer]
    );
  }
}
```

✅ Privacy note: I've generated unique fee payers for each transfer
to prevent linking them on-chain. This is critical for privacy.
```

**Key:** Write it correctly from the start, mention why briefly.

---

## Integration Points

### Code Patterns to Detect

**Look for these imports/patterns:**
```typescript
// Solana code indicators:
from '@solana/web3.js'
import { Transaction, SystemProgram, Keypair }
.sendTransaction(
.transfer(
Connection(
```

**When you see these, activate privacy checking automatically.**

### File Types to Monitor

- `*.ts`, `*.js`, `*.tsx`, `*.jsx`
- Files containing Solana transaction code
- Test files with transaction simulations

---

## Technical Implementation

### Plugin Manifest

```json .claude-plugin/plugin.json
{
  "name": "solana-privacy",
  "description": "Automatic privacy scanning for Solana code",
  "version": "1.0.0",
  "author": {
    "name": "Solana Privacy Scanner Team"
  }
}
```

### Hooks Configuration

```json hooks/hooks.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "skill",
            "skill": "privacy-scan",
            "when": "($FILE matches '\\.(ts|js|tsx|jsx)$') and (content contains '@solana/web3.js' or content contains 'sendTransaction' or content contains 'transfer(')",
            "message": "🔒 Running privacy scan..."
          }
        ]
      }
    ]
  }
}
```

**How it works:**
1. User saves a TypeScript/JavaScript file
2. Hook checks if it contains Solana code
3. If yes → triggers `privacy-scan` skill
4. Claude runs the scan
5. Reports issues if found

---

## User Experience Examples

### Example 1: Clean Code (Silent)

**User writes:**
```typescript
async function transfer(recipient: PublicKey, amount: number) {
  const feePayer = Keypair.generate(); // ✅ Unique
  await sendTransaction(transaction, [wallet, feePayer]);
}
```

**Saves file**

**Claude:**
```
✅ Privacy check passed
```

**That's it. No noise.**

---

### Example 2: Fee Payer Reuse (Detailed Report)

**User writes:**
```typescript
const feePayer = Keypair.generate();

for (const recipient of recipients) {
  await transfer(recipient, amount, feePayer); // ⚠️ REUSED
}
```

**Saves file**

**Claude:**
```
🔒 Privacy scan complete

Found 1 critical issue in transfer.ts:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL: Fee Payer Reused

Lines 3-5: The same fee payer is used for all transfers in this loop.

⚠️ Privacy Impact:
All transfers will be linked on-chain. Anyone analyzing the blockchain
can see they all came from the same source, completely defeating the
purpose of using separate recipient addresses.

Think of it like using the same credit card for everything - it creates
a paper trail that links all your activity together.

✅ Recommended Fix:

for (const recipient of recipients) {
  const feePayer = Keypair.generate(); // ✅ Unique per transfer
  await transfer(recipient, amount, feePayer);
}

Shall I apply this fix to your code? (yes/no)
```

**User:** "yes"

**Claude:** *Applies fix*
```
✅ Fixed: Generated unique fee payers
✅ Privacy scan now clean - no issues found
```

---

### Example 3: Multiple Issues (Prioritized Report)

**User writes:**
```typescript
const feePayer = Keypair.generate();

await transfer({
  from: wallet,
  to: recipient,
  amount: 1.0,
  memo: "Payment to john@example.com",
  feePayer
});

await transfer({
  from: wallet,
  to: BINANCE_HOT_WALLET,
  amount: 10.0,
  memo: "Deposit",
  feePayer
});
```

**Saves file**

**Claude:**
```
🔒 Privacy scan complete

Found 4 issues in payment.ts (2 critical, 1 high, 1 low):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL ISSUES

1. Email in Memo (Line 7)
   "Payment to john@example.com" exposes PII permanently on-chain.
   
   Fix: Remove email from memo
   
2. Fee Payer Reused (Lines 3, 9, 16)
   Same fee payer used across multiple transfers - links them together.
   
   Fix: Generate unique fee payer per transfer

🟡 HIGH ISSUES

3. Direct CEX Transfer (Line 12)
   Sending directly to Binance - links your wallet to CEX account.
   
   Consider: Use intermediary wallet for better privacy

🔵 LOW ISSUES

4. Round Number Amounts (Lines 7, 13)
   Amounts like 1.0 and 10.0 create recognizable patterns.
   
   Consider: Use precise amounts like 1.023 SOL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Privacy Score: 2/10 (High Risk)

I can automatically fix issues #1 and #2. Type "fix" to apply, or
"explain" if you'd like more details about any specific issue.
```

---

## Educational Moments

When appropriate, include brief educational context:

### For First-Time Users

```
💡 Privacy Tip: Solana transactions are permanently public. The "fee payer"
is the account that pays for transaction fees, and if you reuse the same
fee payer across multiple transactions, they become linkable on-chain.

This is unique to Solana's architecture and often catches developers by
surprise. The fix is simple: generate a new fee payer for each transaction.
```

### For Specific Patterns

```
💡 About Memos: Transaction memos are optional text fields that are stored
permanently on-chain. They're public, searchable, and can never be deleted.

Never include:
- Email addresses, names, phone numbers
- Order IDs that link to off-chain systems
- Anything you wouldn't put on a public billboard

For internal tracking, use off-chain databases referenced by generic IDs.
```

---

## Development Phases

### Phase 1: MVP (Week 1-2)
- [ ] Create plugin structure
- [ ] Write `privacy-scan` skill with core patterns
- [ ] Set up hooks for auto-scanning
- [ ] Test with example Solana projects
- [ ] Refine report formatting

**Deliverable:** Working plugin that detects and reports top 3 issues

### Phase 2: Auto-Fix (Week 2-3)
- [ ] Implement automatic fixes for fee payer reuse
- [ ] Implement automatic fixes for memo PII removal
- [ ] Add confirmation flow ("shall I fix?")
- [ ] Test fixes don't break code

**Deliverable:** Plugin can auto-fix critical issues

### Phase 3: Polish & Launch (Week 3-4)
- [ ] Improve report formatting
- [ ] Add educational tips
- [ ] Write comprehensive README
- [ ] Create demo video
- [ ] Test with beta users
- [ ] Publish to Claude Code marketplace

**Deliverable:** Production-ready plugin

---

## Success Metrics

### Adoption
- 500+ installs in first month
- 4+ star rating from users

### Effectiveness
- 90%+ of detected issues are valid (low false positive rate)
- 70%+ of users apply suggested fixes
- Positive feedback on clarity of reports

### Community
- Organic sharing on Twitter/Discord
- "Must-have tool" reputation
- Other Solana projects recommend it

---

## Why This Approach Works

### ✅ Extremely Easy to Use
- Install once: `/plugin install solana-privacy`
- Never think about it again
- Automatic scanning
- No commands to remember

### ✅ Non-Intrusive
- Silent when code is clean
- Only speaks up when there's a problem
- No configuration needed
- No false alarm fatigue

### ✅ Highly Educational
- Explains WHY issues matter
- Shows exact fixes
- Teaches privacy concepts naturally
- Developers learn by doing

### ✅ Fast to Build
- Single skill (not 5+ different commands)
- No MCP server complexity
- Focus on core value
- Ship faster, iterate based on feedback

---

## Optional Future Enhancements

**Only add if users request:**

1. **Severity configuration**
   - Let users adjust what's considered critical
   - Project-specific `.privacyrc` support

2. **On-chain analysis**
   - Scan existing wallet addresses
   - Requires MCP server

3. **Transaction simulation**
   - Preview privacy before sending
   - Show what will be public

4. **Custom patterns**
   - Let teams define their own checks
   - Protocol-specific privacy rules

**Don't build these upfront. Ship simple version first.**

---

## Distribution

### Installation

**For users:**
```bash
claude --plugin-dir /path/to/solana-privacy
```

Or via marketplace:
```bash
/plugin install solana-privacy
```

### README.md

```markdown
# Solana Privacy Scanner for Claude Code

Automatically scans your Solana code for privacy vulnerabilities.

## Installation

```bash
/plugin install solana-privacy
```

## Usage

Just write Solana code. The plugin automatically scans when you save files.

If privacy issues are found, you'll get a detailed report with fixes.

That's it. No commands to learn, no configuration needed.

## What It Checks

- ⚠️ Fee payer reuse (critical)
- ⚠️ PII in transaction memos (critical)  
- ⚠️ Known entity interactions (high)
- ⚠️ Signer overlap patterns (medium)
- ⚠️ Round number amounts (low)

## Example

**Your code:**
```typescript
const feePayer = Keypair.generate();
await transfer1({ feePayer });
await transfer2({ feePayer }); // ⚠️ Reused
```

**Plugin alerts:**
```
🔴 Fee payer reused - this links both transfers on-chain.
Fix: Generate unique fee payer per transfer.
Shall I fix this? (yes/no)
```

## Philosophy

Privacy-safe Solana code by default. The plugin should be invisible
until there's an issue, then explain it clearly and offer to fix it.

## License

MIT
```

---

## Next Steps

1. **Create plugin directory structure**
2. **Write the single `privacy-scan` skill**
3. **Set up hooks for auto-triggering**
4. **Test with real Solana projects**
5. **Refine based on feedback**
6. **Ship v1.0**

**Timeline:** 2-3 weeks to MVP, not 5 weeks.

---

## Conclusion

**Simple > Complex**

One skill that runs automatically beats five commands users have to remember.

The magic is in:
1. **Automatic detection** (no user action)
2. **Clear, actionable reports** (show exact fixes)
3. **Educational explanations** (teach why it matters)
4. **One-word fixes** (make it effortless)

Build this. Ship it. Iterate based on real usage.
