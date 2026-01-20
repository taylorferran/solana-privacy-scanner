# Implementation Plan

This document outlines the implementation plan for three major initiatives to enhance the Solana Privacy Scanner ecosystem.

---

## Task 1: CI/CD Example Repository & Regression Demo ✅ COMPLETE

**Goal:** Create a compelling demo showing automated privacy leak detection in CI/CD using Privacy Cash SDK.

**Status:** ✅ **COMPLETE**

**Repository:** [github.com/taylorferran/solana-privacy-scanner-example](https://github.com/taylorferran/solana-privacy-scanner-example)

**Live Demos:**
- **[PR #1 - Privacy Leak Detected](https://github.com/taylorferran/solana-privacy-scanner-example/pull/1)** - CI fails with privacy violation ❌
- **[PR #2 - Privacy Leak Fixed](https://github.com/taylorferran/solana-privacy-scanner-example/pull/2)** - CI passes with fix ✅

### Overview
Build an example repository using Privacy Cash SDK that demonstrates:
1. Good privacy practices (passing CI)
2. Privacy regression introduced via PR (failing CI)
3. GitHub Actions catching the leak automatically

### Implementation Steps

#### 1.1 Create Demo Repository Structure
- **Repo name:** `solana-privacy-scanner-example`
- **Structure:**
  ```
  /
  ├── src/
  │   └── transfer.ts          # Privacy Cash SDK transfer logic
  ├── tests/
  │   └── privacy.test.ts      # Privacy assertions
  ├── .github/
  │   └── workflows/
  │       └── privacy-check.yml # CI workflow
  ├── .privacyrc               # Privacy policy config
  ├── package.json
  └── README.md
  ```

#### 1.2 Implement Base Transfer Logic
- Install Privacy Cash SDK
- Create simple transfer function using their SDK
- Ensure it follows good privacy practices
- Add privacy tests using our CI tools matchers

#### 1.3 Set Up GitHub Actions
- Configure workflow to run privacy checks on PRs
- Use `solana-privacy-scanner-ci-tools` matchers
- Set to fail on HIGH risk violations
- Add PR comment with privacy report

#### 1.4 Create Privacy Regression Branch
- **Branch:** `feat/add-batch-transfers` (or similar realistic feature name)
- **Introduce leak:** Deliberately add a privacy violation
  - Options to consider (pick simplest):
    - Reuse same fee payer across multiple transfers
    - Add logging/memo with identifying info
    - Direct CEX interaction
    - Predictable timing pattern
- Ensure violation triggers HIGH risk signal

#### 1.5 Create PR Demonstrating Failure
- Open PR from regression branch to main
- GitHub Action should run and fail
- Red X appears with privacy violation details
- PR comment shows what leaked and why

#### 1.6 Create Fix Branch & PR
- **Branch:** `fix/privacy-leak`
- Fix the introduced violation
- Open new PR showing CI passing
- Green check appears
- Demonstrates proper privacy practices

#### 1.7 Documentation
- Add comprehensive README to demo repo explaining:
  - What the example does
  - How to run locally
  - How CI works
  - What the regression demonstrates
  - How the fix resolves it
- Link to demo repo from main docs
- Add screenshots of failing/passing CI

### Deliverables
- [x] Demo repository created and published
- [x] Base implementation with transfer logic
- [x] GitHub Actions workflow configured
- [x] Privacy regression branch created
- [x] PR #1 (failing) demonstrating leak detection
- [x] PR #2 (passing) demonstrating fix
- [x] README with clear explanation
- [x] Working CI that catches privacy leaks
- [x] Documentation in main project docs
- [x] Link added to main project README

### What Was Accomplished

**Repository Setup:**
- Created separate git repo within workspace
- Set up TypeScript, Vitest, GitHub Actions
- Configured `.privacyrc` privacy policy

**The Privacy Leak:**
- Introduced shared fee payer "optimization"
- All transfers use same fee payer (CRITICAL vulnerability)
- Creates linkable transaction graph

**Detection:**
- Test: `expect(uniqueFeePayers.size).toBeGreaterThan(1)`
- PR #1: Fails with 1 unique fee payer (leak detected)
- CI blocks merge with clear error message

**The Fix:**
- Removed shared fee payer constant
- Generate unique fee payer per transfer
- Test passes with 3 unique fee payers

**Documentation:**
- Comprehensive README in example repo
- New documentation page in main project
- Links from CI/CD tools docs
- Link from main project README

**Key Insight:**
Using basic Solana SDK instead of Light Protocol made the example simpler and more educational - shows the core privacy concept clearly.

---

## Task 2: Custom Heuristics & Solana-First Documentation ✅ COMPLETE

**Goal:** Enable users to create custom privacy heuristics and reposition docs as Solana-native (no Ethereum comparisons).

**Status:** ✅ **COMPLETE**

### Overview
1. Document how to extend the scanner with custom heuristics
2. Remove all Ethereum comparisons
3. Create "Why Solana Privacy Matters" page
4. Review and validate our heuristics

### Implementation Steps

#### 2.1 Create Custom Heuristics Documentation

**File:** `/docs/docs/advanced/custom-heuristics.md`

**Content to include:**
- Introduction to extensibility
- Full `ScanContext` type reference
- How to write a custom heuristic function
- How to integrate into pipeline
- Real-world examples:
  - Privacy protocol detecting own leak patterns
  - DeFi protocol checking for MEV exposure
  - NFT marketplace checking for sniping patterns
  - Custom compliance rules
- Testing custom heuristics
- Performance considerations

**Code examples:**
```typescript
// Example structure
import { ScanContext, PrivacySignal } from 'solana-privacy-scanner-core';

export const detectCustomPattern = (context: ScanContext): PrivacySignal[] => {
  const signals: PrivacySignal[] = [];
  
  // Custom logic here
  if (someCondition) {
    signals.push({
      id: 'my-custom-check',
      name: 'Custom Privacy Pattern',
      severity: 'HIGH',
      confidence: 0.9,
      reason: '...',
      evidence: [...]
    });
  }
  
  return signals;
};

// Integration
const customReport = {
  ...standardReport,
  signals: [
    ...standardReport.signals,
    ...detectCustomPattern(context)
  ]
};
```

**Privacy Protocol Example:**
- Show a privacy protocol detecting when users are using their SDK incorrectly
- Example: Detecting if privacy pool is being exited to a known exchange

#### 2.2 Update Sidebar Configuration
Add new "Advanced" section:
```typescript
{
  type: 'category',
  label: 'Advanced',
  items: [
    'advanced/custom-heuristics',
  ],
}
```

#### 2.3 Remove Ethereum Comparisons

**Files to audit and clean:**
- `/docs/docs/guide/what-is-this.md`
- `/docs/docs/guide/concepts.md`
- `/docs/docs/reports/heuristics.md`
- Any other files mentioning Ethereum

**Changes:**
- Remove all "Unlike Ethereum..." statements
- Remove all "Ethereum does X, but Solana does Y" comparisons
- Remove any UTXO vs Account model comparisons that reference Ethereum
- Focus purely on Solana's architecture and privacy implications

#### 2.4 Create "Why Solana Privacy Matters" Page

**File:** `/docs/docs/guide/why-privacy.md`

**Content structure:**
1. **Blockchain Transparency**
   - All transactions are public
   - Addresses are pseudonymous, not anonymous
   - Transaction history is permanent

2. **Solana-Specific Privacy Vectors**
   - Fee payer linkage (unique to Solana)
   - Signer patterns and multi-sig
   - Program-derived addresses (PDAs)
   - Token account lifecycles
   - High throughput = more data points
   - Memo programs and instruction data

3. **Real-World Implications**
   - Financial surveillance
   - Competitive intelligence
   - Security risks
   - Regulatory concerns
   - User safety

4. **What Makes Solana Different** (without comparing to Ethereum)
   - Account model vs alternative architectures
   - Transaction structure
   - Fee payers as a concept
   - High transaction volume

5. **Privacy Preservation Techniques**
   - Address rotation
   - Fee payer strategies
   - Timing obfuscation
   - Token account management
   - Privacy-focused protocols

**Tone:** Educational, technical, Solana-native

#### 2.5 Update Guide Section Navigation
Add new page to guide section and reorder:
```typescript
{
  type: 'category',
  label: 'Guide',
  items: [
    'guide/what-is-this',
    'guide/why-privacy',        // NEW
    'guide/getting-started',
    'guide/concepts',
    'guide/quicknode',
  ],
}
```

#### 2.6 Audit All Documentation
- Search for "Ethereum" across all docs
- Verify all mentions are removed (except historical context if absolutely necessary)
- Ensure language is Solana-first throughout
- Update any examples that might be blockchain-agnostic to be explicitly Solana

#### 2.7 Update Type Exports
Ensure `ScanContext` and related types are well-documented for extension:
- Add JSDoc comments to all fields
- Export all necessary types from main index
- Create type documentation in custom heuristics page

### Deliverables
- [x] `/docs/docs/advanced/custom-heuristics.md` created
- [x] Full `ScanContext` reference documented
- [x] Real-world custom heuristic examples included
- [x] Privacy protocol example documented
- [x] All Ethereum comparisons removed from docs
- [x] `/docs/docs/guide/why-privacy.md` created
- [x] Navigation updated with new pages
- [x] All documentation audited for Solana-first language
- [x] Type exports verified and documented
- [x] Docs build successfully
- [x] Heuristics reviewed and validated
- [x] New heuristics added (memo-exposure, address-reuse)
- [x] Existing heuristics refactored to return arrays
- [x] All tests passing (40/40)

### Open Research Questions
**Status:** ✅ **ADDRESSED**

**Completed Analysis:**
- ✅ Reviewed all 9 base heuristics - all appropriate for Solana
- ✅ Added 2 new Solana-specific heuristics (memo-exposure, address-reuse)
- ✅ Refactored 3 heuristics to return multiple signals (timing-patterns, balance-traceability, known-entity)
- ✅ Validated severity levels against Solana context
- ✅ Confirmed amount-reuse downgrade is correct for Solana
- ✅ Decided against adding MEV/dusting heuristics (out of scope)

**Final Heuristic Suite (11 total):**
1. Fee Payer Reuse (CRITICAL) ✅ Solana-specific
2. Signer Overlap (HIGH) ✅ Solana-specific
3. Memo Exposure (HIGH/MEDIUM/LOW) ✅ NEW - Solana-specific
4. Address Reuse (MEDIUM/LOW) ✅ NEW
5. Instruction Fingerprinting (MEDIUM) ✅ Solana-specific
6. Token Account Lifecycle (MEDIUM) ✅ Solana-specific
7. Counterparty Reuse (varies) ✅ Enhanced with PDA awareness
8. Amount Reuse (LOW on Solana) ✅ Validated downgrade
9. Balance Traceability (varies) ✅ Returns multiple patterns
10. Timing Patterns (HIGH/MEDIUM) ✅ Returns multiple patterns
11. Known Entity Interaction (varies) ✅ Returns entity-specific signals

---

## Task 3: Claude Code Plugin for Preventative Privacy Checks

**Goal:** Create a Claude Code plugin that prevents privacy leaks during Solana development through automatic AI-assisted analysis.

### Status
**Planning Phase** - Detailed plan in `CLAUDE_CODE_PLUGIN_PLAN.md`

### Core Concept
Single automatic skill that scans Solana code on save and provides detailed reports when issues are found. No complex commands - just works.

**See full plan:** [CLAUDE_CODE_PLUGIN_PLAN.md](./CLAUDE_CODE_PLUGIN_PLAN.md)

**Key Features:**
- Automatic scanning on file save
- Silent when code is clean
- Detailed reports when issues found
- One-click auto-fixes
- Educational explanations

**Timeline:** 2-3 weeks to MVP

---

### What is Claude Code?
Claude Code is Anthropic's official CLI tool that lets you interact with Claude in your terminal. It supports plugins that extend Claude's capabilities with:
- **Skills**: Commands that Claude can use (model-invoked) or users can call (like `/privacy-scan`)
- **Hooks**: Automatic actions triggered on events (e.g., after writing a file)
- **Agents**: Custom agent configurations
- **MCP Servers**: External tool integrations

### Our Plugin: `solana-privacy`

**Plugin Structure:**
```
solana-privacy/
├── .claude-plugin/
│   └── plugin.json                 # Plugin manifest
├── commands/
│   ├── privacy-scan.md             # User command: /solana-privacy:scan
│   ├── privacy-fix.md              # User command: /solana-privacy:fix
│   └── privacy-explain.md          # User command: /solana-privacy:explain
├── skills/
│   ├── check-fee-payer/
│   │   └── SKILL.md                # Auto-invoked: detect fee payer reuse
│   ├── check-memo/
│   │   └── SKILL.md                # Auto-invoked: scan memos for PII
│   ├── check-signer-overlap/
│   │   └── SKILL.md                # Auto-invoked: detect signer patterns
│   └── suggest-privacy-fix/
│       └── SKILL.md                # Auto-invoked: suggest improvements
├── hooks/
│   └── hooks.json                  # Auto-scan on file write/edit
├── .mcp.json                       # MCP server for privacy scanner
└── README.md
```

---

## Plugin Components

### 1. User Commands (Explicit Invocation)

#### `/solana-privacy:scan`
**Purpose:** Analyze current file or selection for privacy leaks

```markdown commands/privacy-scan.md
---
description: Scan Solana code for privacy vulnerabilities
---

# Privacy Scan Command

You are analyzing Solana code for privacy vulnerabilities. The user has requested a privacy scan with: "$ARGUMENTS"

## Instructions

1. **Identify Solana code patterns** in the current file or selection:
   - Keypair usage and reuse
   - Transfer sequences
   - Fee payer assignments
   - Memo field usage
   - Signer patterns
   - Token account operations

2. **Check for privacy violations**:
   
   **CRITICAL (Must Fix):**
   - Fee payer reused across multiple transfers
   - PII in transaction memos (emails, names, IDs)
   - Direct CEX/known entity interactions from privacy wallet
   
   **HIGH (Should Fix):**
   - Signer overlap across unrelated transactions
   - Predictable counterparty patterns
   - Token accounts closed immediately after use
   
   **MEDIUM (Consider Fixing):**
   - Instruction sequence fingerprinting
   - Timing patterns in transaction logic
   - Hardcoded addresses
   
   **LOW (Best Practice):**
   - Round number amounts
   - Long-term address reuse

3. **Report findings** in this format:
   ```
   🔒 Privacy Scan Results
   
   Critical Issues (X):
   • [Line Y] Fee payer reused across 5 transfers
     Impact: Creates linkable transaction graph
     Fix: Generate unique fee payer per transfer
   
   High Issues (X):
   • [Line Y] Email found in memo field
     Impact: Permanently exposes PII on-chain
     Fix: Remove PII from memo
   ```

4. **Offer to fix** critical and high issues automatically

## Context You Have Access To

- Use the `read_file` tool to analyze files
- Use the `grep_search` tool to find patterns across codebase
- Reference Solana Privacy Scanner heuristics for guidance

## Example Patterns to Detect

**Bad - Fee Payer Reuse:**
```typescript
const feePayer = Keypair.generate();
await transfer1({ feePayer }); // ⚠️ Reused
await transfer2({ feePayer }); // ⚠️ Reused
```

**Good - Unique Fee Payers:**
```typescript
await transfer1({ feePayer: Keypair.generate() }); // ✅ Unique
await transfer2({ feePayer: Keypair.generate() }); // ✅ Unique
```

**Bad - PII in Memo:**
```typescript
memo: "Payment to john@example.com for invoice #123" // ⚠️ Email exposed
```

**Good - Generic Memo:**
```typescript
memo: "Transfer" // ✅ Generic
// Or omit memo entirely
```
```

#### `/solana-privacy:fix`
**Purpose:** Auto-fix common privacy issues

```markdown commands/privacy-fix.md
---
description: Automatically fix common Solana privacy issues
---

# Privacy Fix Command

The user wants to fix privacy issues in: "$ARGUMENTS"

## Instructions

1. **Scan the code** for privacy violations (use the scan skill)

2. **For each CRITICAL or HIGH issue**, propose a fix:
   
   **Fee Payer Reuse:**
   - Replace shared `feePayer` variable with `Keypair.generate()` per transfer
   
   **PII in Memos:**
   - Remove or redact PII
   - Suggest generic alternatives
   
   **Known Entity Interactions:**
   - Suggest intermediary wallet pattern
   - Warn about privacy implications

3. **Apply fixes** using `apply_diff` or show diffs for user approval

4. **Re-scan** after fixes to confirm issues resolved

5. **Explain** what was fixed and why

## Example Fix Session

```
Found 2 critical issues:

1. Fixing fee payer reuse (lines 45-52)...
   ✅ Generated unique fee payer for each transfer

2. Removing PII from memo (line 78)...
   ✅ Replaced "john@example.com" with generic message

Privacy scan after fixes: ✅ No critical issues found
```
```

#### `/solana-privacy:explain`
**Purpose:** Deep dive explanation of privacy concepts

```markdown commands/privacy-explain.md
---
description: Explain Solana privacy concepts and best practices
---

# Privacy Explain Command

The user wants to understand: "$ARGUMENTS"

## Instructions

Explain Solana privacy concepts in an educational, approachable way:

### Topics to Cover

**Fee Payer Privacy:**
- What: Fee payer is the account that pays transaction fees
- Risk: Reusing fee payer links all transactions together
- Fix: Use unique fee payer per transfer or batch
- Analogy: "Like using the same credit card for everything - creates a paper trail"

**Memo Field Exposure:**
- What: Memos are optional text fields in transfers
- Risk: Permanently public on-chain, searchable forever
- Fix: Never include PII (names, emails, IDs, addresses)
- Analogy: "Like writing personal info on a billboard"

**Signer Patterns:**
- What: Accounts that sign transactions
- Risk: Repeated signer combinations are fingerprints
- Fix: Compartmentalize activities with different keys
- Analogy: "Using same password everywhere"

**Address Reuse:**
- What: Sending to same counterparty repeatedly
- Risk: Links your identity to that entity
- Fix: Use intermediary wallets for sensitive interactions
- Analogy: "Meeting someone at the same coffee shop every day"

Use examples from the codebase when available. Offer to scan their code for the specific pattern discussed.
```

---

### 2. Agent Skills (Model-Invoked)

These skills are automatically available to Claude when writing Solana code. Claude decides when to use them based on context.

#### Skill: `check-fee-payer`

```markdown skills/check-fee-payer/SKILL.md
---
name: check-fee-payer
description: Detects fee payer reuse patterns in Solana code. Use when writing or reviewing Solana transfers to ensure privacy.
---

# Check Fee Payer Privacy

When you see Solana transfer code, check for fee payer reuse:

## Detection Pattern

Look for:
1. `feePayer` variable declared once
2. Used in multiple `transfer()`, `sendTransaction()`, or similar calls
3. Multiple transfers in sequence or loop

## Privacy Violation

```typescript
// ⚠️ CRITICAL PRIVACY ISSUE
const feePayer = Keypair.generate();

for (const recipient of recipients) {
  await transfer(feePayer, recipient, amount); // Linked!
}
```

## Correct Pattern

```typescript
// ✅ Privacy-preserving
for (const recipient of recipients) {
  const feePayer = Keypair.generate(); // Unique per transfer
  await transfer(feePayer, recipient, amount);
}
```

## When to Alert

- **Always warn** if you detect fee payer reuse
- Explain the privacy implication
- Suggest the fix automatically
- Don't wait for user to ask - proactively mention it

## Integration

When writing Solana code that includes transfers:
1. Automatically check for this pattern
2. If detected, say: "⚠️ Privacy note: This code reuses the fee payer, which links these transfers. Would you like me to generate unique fee payers?"
3. Offer to fix it immediately
```

#### Skill: `check-memo`

```markdown skills/check-memo/SKILL.md
---
name: check-memo
description: Scans transaction memos for PII and sensitive information. Use when writing or reviewing Solana transfers with memos.
---

# Check Memo Privacy

Transaction memos are **permanently public** on-chain. Check for PII exposure.

## Detection Patterns

Scan memo strings for:

### Personal Information
- Email addresses (regex: `\b[\w\.-]+@[\w\.-]+\.\w+\b`)
- Phone numbers (regex: `\b\d{3}[-.]?\d{3}[-.]?\d{4}\b`)
- Names (common first/last names)
- Physical addresses
- National IDs, SSN patterns

### Sensitive Data
- Order numbers, invoice IDs
- Usernames, account IDs
- IP addresses
- URLs with query parameters (may contain tokens)
- Any string that looks like a database ID

## Privacy Violations

```typescript
// 🚫 CRITICAL - Multiple PII types
await transfer({
  memo: "Payment to john.doe@company.com for invoice #INV-12345"
});

// 🚫 CRITICAL - Name and phone
await transfer({
  memo: "Refund for John Smith, contact: 555-123-4567"
});

// ⚠️ HIGH - User ID (linkable)
await transfer({
  memo: "user_id: 847392, order: ORD-2847"
});
```

## Acceptable Memos

```typescript
// ✅ Generic, no PII
await transfer({
  memo: "Payment"
});

// ✅ No memo at all (best for privacy)
await transfer({
  // no memo field
});

// ✅ Generic category only
await transfer({
  memo: "Purchase"
});
```

## When to Alert

- **Always warn** for emails, phones, names
- **Suggest removing** even generic IDs if privacy-sensitive context
- Explain: "Memos are permanently searchable on-chain"
- Offer to rewrite or remove

## Integration

When writing transfer code with memos:
1. Scan the memo string automatically
2. If PII detected, say: "🚫 Privacy issue: This memo contains [X], which will be permanently public. Shall I remove it?"
3. Don't proceed without addressing it for CRITICAL issues
```

#### Skill: `check-signer-overlap`

```markdown skills/check-signer-overlap/SKILL.md
---
name: check-signer-overlap
description: Detects repeated signer combinations that create behavioral fingerprints. Use when reviewing multi-signature patterns.
---

# Check Signer Overlap

Repeated combinations of signers create identifiable patterns.

## Detection Pattern

Look for:
1. Multi-signature transactions
2. Same set of signers across multiple operations
3. Signer arrays with consistent membership

## Privacy Concern

```typescript
// ⚠️ Fingerprinting risk
const signers = [keypair1, keypair2, keypair3];

await operation1({ signers }); // Same signers
await operation2({ signers }); // Same signers
await operation3({ signers }); // Creates pattern
```

## When to Mention

- Multiple operations with identical signer sets
- Suggest varying signer combinations when possible
- Explain this is **MEDIUM** severity (not critical but should consider)

## Guidance

"These operations use the same signer combination, which creates a behavioral fingerprint. For better privacy, consider varying signers or compartmentalizing activities."
```

#### Skill: `suggest-privacy-fix`

```markdown skills/suggest-privacy-fix/SKILL.md
---
name: suggest-privacy-fix
description: Provides privacy-preserving alternatives when writing Solana code. Use proactively when the user is writing privacy-sensitive code.
---

# Suggest Privacy Fixes

Proactively suggest privacy-safe patterns when writing Solana code.

## When to Activate

When the user is:
- Writing transfer sequences
- Implementing batch operations
- Building payment systems
- Creating wallet interactions
- Integrating with CEX/bridges

## Suggested Patterns

### Batch Transfers
```typescript
// Instead of shared fee payer:
async function batchTransfer(recipients) {
  for (const recipient of recipients) {
    const feePayer = Keypair.generate(); // ✅ Unique
    await transfer({ feePayer, ...recipient });
  }
}
```

### Privacy-Preserving Config
```typescript
// Suggest adding privacy options:
interface TransferOptions {
  amount: number;
  recipient: PublicKey;
  useUniqueFeePayer?: boolean; // ✅ Default true
  omitMemo?: boolean;          // ✅ Default true
}
```

### Intermediary Pattern
```typescript
// For CEX interactions:
// User Wallet → Intermediary → CEX
// Breaks direct linkage
```

## Integration

When writing new Solana code, proactively mention:
"For privacy, I'm generating unique fee payers per transfer."
"Omitting memos to avoid on-chain metadata."
"Using separate signing keys to prevent fingerprinting."
```

---

### 3. Hooks (Automatic Triggers)

Hooks automatically run privacy checks when files are saved.

```json hooks/hooks.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "skill",
            "skill": "check-fee-payer",
            "when": "$FILE matches '\\.(ts|js|tsx|jsx)$' and content contains 'transfer\\('",
            "message": "🔒 Checking for privacy issues in Solana code..."
          },
          {
            "type": "skill",
            "skill": "check-memo",
            "when": "$FILE matches '\\.(ts|js|tsx|jsx)$' and content contains 'memo:'",
            "message": "🔒 Scanning transaction memos for PII..."
          }
        ]
      }
    ]
  }
}
```

**How it works:**
1. User writes Solana code
2. User saves file (Claude uses Write or Edit tool)
3. Hook triggers if file contains transfer code
4. Claude automatically runs privacy check Skills
5. Reports any issues found
6. Offers to fix immediately

---

### 4. MCP Server Integration

For advanced integration, expose our privacy scanner as an MCP server that Claude can call.

```json .mcp.json
{
  "solana-privacy-scanner": {
    "command": "npx",
    "args": [
      "solana-privacy-scanner-mcp-server"
    ],
    "env": {}
  }
}
```

**MCP Server Capabilities:**
- `scanWallet(address)` - Scan existing on-chain wallet
- `scanTransaction(signature)` - Analyze specific transaction
- `simulateTransaction(tx)` - Preview privacy before sending
- `getKnownEntities()` - Check if address is known entity

This allows Claude to:
- Fetch real transaction data for analysis
- Simulate transactions to predict privacy impact
- Check addresses against known entity database
- Provide on-chain context for better analysis

---

## Implementation Plan

### Phase 1: Core Plugin Structure (Week 1)

**Tasks:**
- [x] Create plugin directory structure
- [ ] Write `plugin.json` manifest
- [ ] Create basic `/solana-privacy:scan` command
- [ ] Test with `claude --plugin-dir`
- [ ] Validate plugin loads correctly

**Deliverables:**
- Working plugin skeleton
- Basic scan command functional
- Documentation started

---

### Phase 2: User Commands (Week 1-2)

**Tasks:**
- [ ] Implement `/solana-privacy:scan` command
  - Read current file/selection
  - Detect Solana patterns
  - Run privacy checks
  - Format report
- [ ] Implement `/solana-privacy:fix` command
  - Auto-fix fee payer reuse
  - Remove PII from memos
  - Apply diffs
- [ ] Implement `/solana-privacy:explain` command
  - Educational content
  - Interactive examples
  - Contextual guidance
- [ ] Test all commands with real Solana code

**Deliverables:**
- 3 working user commands
- Test cases for each
- User documentation

---

### Phase 3: Agent Skills (Week 2-3)

**Tasks:**
- [ ] Create `check-fee-payer` skill
  - Pattern detection logic
  - Clear alert messaging
  - Fix suggestions
- [ ] Create `check-memo` skill
  - PII regex patterns
  - Severity classification
  - Safe alternatives
- [ ] Create `check-signer-overlap` skill
  - Multi-sig detection
  - Pattern analysis
  - Guidance
- [ ] Create `suggest-privacy-fix` skill
  - Proactive suggestions
  - Best practice patterns
  - Integration with other skills
- [ ] Test skills are auto-invoked appropriately

**Deliverables:**
- 4 model-invoked skills
- Skill documentation
- Test scenarios

---

### Phase 4: Hooks & Automation (Week 3)

**Tasks:**
- [ ] Create `hooks.json` configuration
- [ ] Set up PostToolUse hooks for Write/Edit
- [ ] Configure file matchers for Solana code
- [ ] Test automatic triggering
- [ ] Optimize for performance (don't slow Claude down)

**Deliverables:**
- Working hooks system
- Automatic privacy checks on save
- Performance benchmarks

---

### Phase 5: MCP Server (Week 4)

**Tasks:**
- [ ] Create MCP server package
  - `solana-privacy-scanner-mcp-server`
- [ ] Implement MCP protocol
  - `scanWallet` tool
  - `scanTransaction` tool
  - `simulateTransaction` tool
  - `getKnownEntities` tool
- [ ] Integrate with core scanner library
- [ ] Add `.mcp.json` configuration
- [ ] Test MCP tools from Claude

**Deliverables:**
- Working MCP server
- Integration with existing scanner
- Tool documentation

---

### Phase 6: Testing & Polish (Week 4-5)

**Tasks:**
- [ ] Test with real Solana projects
- [ ] Gather feedback from Solana developers
- [ ] Refine prompts and messaging
- [ ] Optimize performance
- [ ] Write comprehensive README
- [ ] Create example use cases
- [ ] Record demo video

**Deliverables:**
- Tested plugin
- User documentation
- Demo video
- Example projects

---

### Phase 7: Distribution (Week 5)

**Tasks:**
- [ ] Create plugin marketplace
  - Host on GitHub
  - Or use team marketplace
- [ ] Write installation guide
- [ ] Publish announcement
  - Twitter/X
  - Solana Discord
  - Dev forums
- [ ] Monitor feedback
- [ ] Iterate based on usage

**Deliverables:**
- Published plugin
- Installation instructions
- Community awareness

---

## Key Features Detail

### Feature 1: Proactive Privacy Guidance

**Scenario:** Developer asks Claude to write batch transfer code

```
User: "Write a function to send SOL to 10 recipients"

Claude: "I'll write that function with privacy best practices:

[Writes code with unique fee payers]

✅ Privacy note: I'm generating a unique fee payer for each transfer
to prevent creating a linkable transaction graph. This is critical for
privacy as it ensures each transfer appears independent on-chain.

Would you like me to add additional privacy features like:
- Random timing delays between transfers?
- Intermediary wallet for enhanced privacy?
```

**How it works:**
- `suggest-privacy-fix` skill is active
- Claude proactively mentions privacy considerations
- Code is written correctly from the start

---

### Feature 2: Automatic File Scan

**Scenario:** Developer saves file with privacy leak

```
User: [Saves transfer.ts]

Claude: "🔒 Privacy scan complete:

⚠️ Found 1 critical issue:
Line 45: Fee payer reused across 5 transfers
  Impact: Creates linkable transaction graph
  Fix available: Generate unique fee payer per transfer

Would you like me to fix this automatically?"

User: "yes"

Claude: [Applies fix]
"✅ Fixed: Generated unique fee payers. Privacy scan now clean."
```

**How it works:**
- `PostToolUse` hook triggers on file save
- `check-fee-payer` skill runs automatically
- Issue detected and reported
- Fix offered immediately

---

### Feature 3: MCP-Powered On-Chain Analysis

**Scenario:** Developer wants to analyze existing wallet

```
User: "/solana-privacy:scan DXhVwWjk... (wallet address)"

Claude: [Uses MCP scanWallet tool]
"Analyzing on-chain transactions for DXhVwWjk...

Found 247 transactions. Privacy analysis:

🔴 Critical Issues:
- Fee payer never changes (all 247 txs use same account)
- 12 direct transfers to Binance hot wallet
- 3 memos contain email addresses

🟡 Medium Issues:
- 89% of transfers are round numbers
- Timing pattern: most activity between 9-10am EST

Privacy Score: 2.3/10 (High Risk)

This wallet has significant privacy leaks. The consistent fee payer
and CEX interactions make all activity linkable to your identity.

Would you like guidance on improving this wallet's privacy?"
```

**How it works:**
- MCP server fetches real transaction data
- Core scanner analyzes transactions
- Results formatted by Claude
- Actionable recommendations provided

---

## Success Metrics

### Adoption
- **Target:** 500 installs in first month
- **Target:** 2,000 installs in first quarter
- **Target:** Featured in Claude Code plugin marketplace

### Effectiveness
- **Privacy leaks caught:** Track violations detected
- **Auto-fixes applied:** Measure automatic corrections
- **Proactive suggestions:** Count times Claude suggests privacy patterns upfront

### Community
- **GitHub stars:** Increase on main repo
- **Plugin contributions:** Community PRs to improve skills
- **Developer testimonials:** Success stories
- **Integration:** Other Solana tools reference our patterns

---

## Distribution Strategy

### Option 1: Official Plugin Marketplace (Preferred)
- Submit to Anthropic's official marketplace
- Broadest reach
- Auto-updates
- Official backing

### Option 2: Team Marketplace
- Host on GitHub: `github.com/taylorferran/solana-privacy-claude`
- Users install with: `/plugin install github:taylorferran/solana-privacy-claude`
- Full control over updates
- Can iterate faster

### Option 3: Both
- Start with team marketplace for rapid iteration
- Submit to official marketplace once stable
- Best of both worlds

---

## Example User Journeys

### Journey 1: New Solana Developer

```
Developer: "I'm new to Solana. How do I send SOL to someone?"

Claude: "I'll show you how to send SOL with privacy best practices.
[Installs solana-privacy plugin if not already installed]

Here's a privacy-safe transfer function:

[Shows code with unique fee payers, no memos]

✅ Privacy notes:
- Using unique fee payer (line 5) prevents linking this transfer to others
- Omitting memo field avoids exposing data on-chain
- Separate signing key (line 8) compartmentalizes this activity

This ensures your transfer is as private as possible on a public blockchain."

Developer: "What if I want to add a note?"

Claude: "⚠️ Privacy warning: Transaction memos are permanently public and
searchable. Never include:
- Personal information (names, emails, addresses)
- Order IDs that link to off-chain systems
- Any data you wouldn't want public forever

For internal notes, use an off-chain database linked by a generic
transaction ID."
```

### Journey 2: Experienced Developer with Existing Code

```
Developer: "/solana-privacy:scan src/transfers.ts"

Claude: "Scanning src/transfers.ts for privacy issues...

🔍 Found 3 issues:

1. 🔴 CRITICAL (Line 34): Fee payer reused in loop
   All 50 transfers use same fee payer - creates linkable graph

2. 🔴 CRITICAL (Line 67): Email in memo field
   "Payment to user@example.com" - PII permanently on-chain

3. 🟡 MEDIUM (Line 89): Hardcoded CEX address
   Direct transfers to known Binance wallet from privacy wallet

Run `/solana-privacy:fix src/transfers.ts` to auto-fix issues #1 and #2.
Issue #3 requires architectural consideration (use intermediary wallet)."

Developer: "/solana-privacy:fix src/transfers.ts"

Claude: "Fixing privacy issues in src/transfers.ts...

✅ Fixed #1: Generated unique fee payers (lines 34-38)
✅ Fixed #2: Removed PII from memo (line 67)

⚠️ Issue #3 remains: Direct CEX interaction detected
Recommendation: Implement intermediary wallet pattern:
  Your Wallet → Intermediate Wallet → CEX
This breaks the direct link between your activity and CEX deposits.

Would you like me to implement this pattern?"
```

### Journey 3: CI/CD Integration

```
Developer: "How do I add this to my CI?"

Claude: "Great question! The solana-privacy plugin can integrate with CI:

1. Add pre-commit hook:
[Shows .git/hooks/pre-commit that calls /solana-privacy:scan]

2. Add GitHub Action:
[Shows workflow that fails on critical privacy issues]

3. Add to test suite:
[Shows Vitest test using our matchers]

I recommend all three layers:
- Pre-commit: Catches issues before commit
- CI: Team-wide enforcement
- Tests: Prevents regressions

Would you like me to set these up for your project?"
```

---

## Advanced Features (Future Phases)

### Phase 2 Enhancements
- [ ] Custom privacy policies per project (`.privacyrc` support)
- [ ] Historical privacy tracking (track improvements over time)
- [ ] Privacy score badge for README
- [ ] Integration with Solana Playground
- [ ] Visual privacy graphs (transaction flow diagrams)

### AI-Powered Enhancements
- [ ] Learn from team's privacy patterns
- [ ] Suggest architectural improvements
- [ ] Predict privacy implications of planned features
- [ ] Generate privacy documentation automatically

### Ecosystem Integrations
- [ ] Anchor framework integration
- [ ] Metaplex integration
- [ ] DeFi protocol-specific checks
- [ ] NFT marketplace privacy patterns

---

## Technical Specifications

### Plugin Manifest

```json .claude-plugin/plugin.json
{
  "name": "solana-privacy",
  "description": "AI-powered Solana privacy analysis and guidance",
  "version": "1.0.0",
  "author": {
    "name": "Solana Privacy Scanner Team",
    "url": "https://github.com/taylorferran/solana-privacy-scanner"
  },
  "homepage": "https://solana-privacy-scanner.com",
  "repository": {
    "type": "git",
    "url": "https://github.com/taylorferran/solana-privacy-scanner-claude"
  },
  "keywords": [
    "solana",
    "privacy",
    "security",
    "blockchain",
    "analysis"
  ],
  "license": "MIT",
  "engines": {
    "claude": ">=1.0.33"
  }
}
```

### Dependencies

The plugin will require:
- `solana-privacy-scanner-core` (our existing package)
- `@solana/web3.js` (for address validation)
- Node.js 18+ (for MCP server)

### File Structure

```
solana-privacy-claude/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── privacy-scan.md
│   ├── privacy-fix.md
│   └── privacy-explain.md
├── skills/
│   ├── check-fee-payer/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── check-memo/
│   │   ├── SKILL.md
│   │   └── examples.md
│   ├── check-signer-overlap/
│   │   ├── SKILL.md
│   │   └── examples.md
│   └── suggest-privacy-fix/
│       ├── SKILL.md
│       └── patterns.md
├── hooks/
│   └── hooks.json
├── .mcp.json
├── mcp-server/
│   ├── package.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── tools/
│   │   │   ├── scanWallet.ts
│   │   │   ├── scanTransaction.ts
│   │   │   ├── simulateTransaction.ts
│   │   │   └── getKnownEntities.ts
│   │   └── server.ts
│   └── tsconfig.json
├── tests/
│   ├── commands.test.ts
│   ├── skills.test.ts
│   └── mcp.test.ts
├── examples/
│   ├── good-patterns/
│   └── bad-patterns/
├── docs/
│   ├── installation.md
│   ├── usage.md
│   └── development.md
├── package.json
├── README.md
└── LICENSE
```

---

## Resources Needed

### Development
- **Time:** 5 weeks for MVP
- **Skills:** TypeScript, Claude Code plugin system, Solana knowledge, MCP protocol
- **Tools:** Claude Code CLI, Node.js, our existing scanner library

### Testing
- **Beta testers:** 10-20 Solana developers
- **Test projects:** Real Solana codebases
- **Feedback loops:** Discord channel for plugin users

### Documentation
- **Plugin README:** Installation and usage
- **Skill documentation:** How each skill works
- **Developer guide:** Contributing to plugin
- **Blog post:** Launch announcement
- **Video tutorial:** 5-minute walkthrough

---

## Risk Mitigation

### False Positives
- **Risk:** Over-alerting frustrates users
- **Mitigation:** Conservative defaults, clear explanations, easy ignore
- **Mitigation:** Learn from feedback, tune detection patterns

### Performance
- **Risk:** Plugin slows down Claude interactions
- **Mitigation:** Efficient Skills (run only when relevant)
- **Mitigation:** Async MCP calls (don't block)
- **Mitigation:** Cache known entity data

### Adoption
- **Risk:** Users don't discover plugin
- **Mitigation:** SEO optimization for "Solana privacy"
- **Mitigation:** Partnerships with Solana ecosystem projects
- **Mitigation:** Content marketing (blogs, videos, tutorials)

### Maintenance
- **Risk:** Plugin breaks with Claude Code updates
- **Mitigation:** Use stable APIs
- **Mitigation:** Automated testing
- **Mitigation:** Active monitoring of Claude Code releases

---

## Next Steps

1. **Validate with community**
   - Survey Solana developers: Would they use this?
   - Get feedback on feature priorities
   - Identify beta testers

2. **Create MVP roadmap**
   - Choose Phase 1 features
   - Set 2-week milestones
   - Assign tasks

3. **Set up development environment**
   - Install Claude Code
   - Create plugin directory
   - Test basic plugin loading

4. **Build Phase 1**
   - Manifest + basic command
   - Test locally
   - Gather feedback

5. **Iterate rapidly**
   - Weekly releases during development
   - Incorporate feedback
   - Add features incrementally

---

## Conclusion

**The Claude Code plugin approach is optimal because:**

✅ **Most Useful:**
- Integrates privacy into developers' primary workflow
- AI-powered analysis understands context
- Proactive guidance prevents leaks before they happen
- Works in terminal where Solana devs already work

✅ **Easiest to Use:**
- Install with one command: `/plugin install solana-privacy`
- Automatic activation (hooks)
- Natural language interface
- No configuration needed (works out of the box)

**Timeline:** 5 weeks to production-ready plugin

**Unique Value:** Only privacy tool that gives AI-powered, contextual guidance during development

This is the right approach for the Claude Code era of development. 🚀

---

## Implementation Order

1. **Task 2** (documentation) - Can be done immediately
2. **Task 1** (demo repo) - Requires Task 2 knowledge for examples
3. **Task 3** (Claude plugin) - Requires Tasks 1 & 2 complete

---

## Success Metrics

### Task 1
- Demo repo has clear README
- CI successfully catches introduced leak
- PR screenshots show red/green status
- Community can clone and run locally

### Task 2
- Zero Ethereum mentions in docs (except maybe changelog)
- Custom heuristics page has 3+ real examples
- "Why Privacy" page is comprehensive and educational
- Docs feel Solana-native throughout

### Task 3
- TBD after scoping

---

## Notes

- Keep everything simple and focused
- Don't over-engineer solutions
- Prioritize clarity and usability
- Document as we go
