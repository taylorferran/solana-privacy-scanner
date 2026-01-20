# Implementation Plan

This document outlines the implementation plan for three major initiatives to enhance the Solana Privacy Scanner ecosystem.

---

## Task 1: CI/CD Example Repository & Regression Demo

**Goal:** Create a compelling demo showing automated privacy leak detection in CI/CD using Privacy Cash SDK.

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
- [ ] Demo repository created and published
- [ ] Base implementation with Privacy Cash SDK
- [ ] GitHub Actions workflow configured
- [ ] Privacy regression branch created
- [ ] PR #1 (failing) demonstrating leak detection
- [ ] PR #2 (passing) demonstrating fix
- [ ] README with clear explanation
- [ ] Screenshots of CI in action
- [ ] Link added to main project docs

### Research Questions
- Which Privacy Cash SDK functions to use?
- What specific violation is simplest to demo?
- Should we use actual devnet transactions or simulation?

---

## Task 2: Custom Heuristics & Solana-First Documentation

**Goal:** Enable users to create custom privacy heuristics and reposition docs as Solana-native (no Ethereum comparisons).

### Overview
1. Document how to extend the scanner with custom heuristics
2. Remove all Ethereum comparisons
3. Create "Why Solana Privacy Matters" page
4. Review and validate our heuristics (research question)

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
- [ ] `/docs/docs/advanced/custom-heuristics.md` created
- [ ] Full `ScanContext` reference documented
- [ ] Real-world custom heuristic examples included
- [ ] Privacy protocol example documented
- [ ] All Ethereum comparisons removed from docs
- [ ] `/docs/docs/guide/why-privacy.md` created
- [ ] Navigation updated with new pages
- [ ] All documentation audited for Solana-first language
- [ ] Type exports verified and documented
- [ ] Docs build successfully

### Open Research Questions
**To address when we reach this task:**
- Are our current 9 heuristics appropriate for Solana?
- Should we adjust severity levels based on real-world usage?
- Are there new Solana-specific heuristics we should add?
- Should we deprecate any existing heuristics?

**Current Heuristics to Review:**
1. Fee Payer Reuse (CRITICAL) - Validate severity
2. Signer Overlap (HIGH) - Validate severity
3. Instruction Fingerprinting (MEDIUM) - Validate severity
4. Token Account Lifecycle (MEDIUM) - Validate severity
5. Counterparty Reuse (varies) - Review PDA logic
6. Amount Reuse (LOW on Solana) - Confirm downgrade is correct
7. Balance Traceability (varies) - Review with Solana context
8. Timing Patterns (MEDIUM) - Validate for high-throughput chain
9. Known Entity Interaction (varies) - Expand entity database?

---

## Task 3: Claude Code Plugin for Preventative Privacy

**Goal:** Create a Claude Code plugin that prevents privacy leaks during development.

### Status
**Deferred** - Will scope out full design after Tasks 1 & 2 are complete.

### High-Level Concept
- Real-time privacy analysis as code is written
- Inline warnings in IDE
- Suggestions for privacy-preserving alternatives
- Integration with Claude Code context

### Next Steps
- Complete Tasks 1 & 2
- Research Claude Code plugin architecture
- Design integration approach
- Create detailed implementation plan

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
