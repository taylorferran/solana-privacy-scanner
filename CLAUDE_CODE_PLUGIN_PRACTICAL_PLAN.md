# Claude Code Plugin: Practical Implementation Plan

**Status:** Revised based on actual Claude Code plugin capabilities and constraints

---

## Reality Check: What the Original Plan Got Wrong

### ❌ What Won't Work

1. **Automatic scanning on every file save via PostToolUse hooks**
   - **Why:** Comprehensive static analysis takes >5 seconds, hooks should be <5s
   - **Why:** Non-deterministic LLM-based pattern detection will have false positives/negatives
   - **Why:** Would be noisy and slow down developer workflow

2. **Claude doing pattern detection via skill instructions**
   - **Why:** Claude's pattern matching is probabilistic, not deterministic
   - **Why:** Can't reliably detect variable reuse, regex patterns, or data flow
   - **Why:** Security/privacy analysis requires zero false negatives

3. **Model-invoked automatic triggering**
   - **Why:** Claude would auto-trigger at random times during conversation
   - **Why:** Privacy scanning has explicit trigger points (pre-commit, pre-deploy)
   - **Why:** Lacks deterministic control over when analysis runs

### ✅ What Will Work

1. **External deterministic analyzer + Claude orchestration**
   - External tool (Python/JS/Rust) does reliable pattern detection
   - Claude skill runs the tool and helps fix issues
   - Best of both worlds: reliability + intelligence

2. **User-invoked skill for explicit scanning**
   - Developer runs `/solana-privacy-scan` when ready
   - Integrates with pre-commit hooks, CI/CD, or manual workflow
   - No noise, full control

3. **Lightweight PostToolUse hook for obvious issues only**
   - Quick regex checks for PII in memos (emails, phones)
   - Fast (<2 seconds), high-confidence patterns only
   - Provides immediate feedback without blocking

---

## Recommended Architecture

### Two-Tier System

**Tier 1: Deterministic Static Analyzer** (External Tool)
```
┌─────────────────────────────────────┐
│  Solana Privacy Analyzer (Node.js)  │
│  - AST parsing for variable reuse   │
│  - Regex detection for PII          │
│  - Known address checking           │
│  - Data flow analysis               │
│  Returns: JSON report with findings │
└─────────────────────────────────────┘
```

**Tier 2: Claude Orchestrator** (Skill)
```
┌──────────────────────────────────────┐
│  Claude Code Skill                   │
│  - Runs analyzer tool                │
│  - Parses JSON results               │
│  - Reads code context                │
│  - Applies intelligent fixes         │
│  - Explains issues to developer      │
└──────────────────────────────────────┘
```

### Why This Works

| Component | Responsibility | Why It's the Right Tool |
|-----------|---------------|------------------------|
| External Analyzer | Pattern detection | Deterministic, fast, reliable |
| Claude Skill | Orchestration + fixing | Contextual understanding, code modification |
| Developer | Explicit invocation | Control, no noise, clear workflow |

---

## Implementation Plan (Revised)

### Phase 1: Build External Analyzer (Week 1-2)

**Create `packages/code-analyzer/`**

A Node.js tool that does deterministic static analysis:

```typescript
// packages/code-analyzer/src/index.ts
import { parse } from '@typescript-eslint/parser';

export interface AnalyzerResult {
  issues: Issue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface Issue {
  type: 'fee-payer-reuse' | 'memo-pii' | 'known-entity' | 'signer-overlap';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  file: string;
  line: number;
  column: number;
  message: string;
  suggestion: string;
  codeSnippet: string;
}

export async function analyzeSolanaCode(files: string[]): Promise<AnalyzerResult> {
  const issues: Issue[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');

    // Pattern 1: Fee payer variable reuse
    issues.push(...detectFeePayerReuse(content, file));

    // Pattern 2: PII in memo strings
    issues.push(...detectMemoPII(content, file));

    // Pattern 3: Known entity addresses
    issues.push(...detectKnownEntities(content, file));

    // Pattern 4: Signer overlap patterns
    issues.push(...detectSignerOverlap(content, file));
  }

  return {
    issues,
    summary: summarizeIssues(issues)
  };
}

// Deterministic pattern detection
function detectFeePayerReuse(content: string, file: string): Issue[] {
  const ast = parse(content, { sourceType: 'module' });
  const issues: Issue[] = [];

  // Track variable declarations and their usage
  const feePayerVars = new Map<string, Location[]>();

  // Walk AST to find:
  // 1. Variable assigned to Keypair.generate()
  // 2. Same variable used in multiple transaction calls

  traverse(ast, {
    VariableDeclarator(path) {
      if (isFeePayerVariable(path)) {
        // Track this variable
        feePayerVars.set(path.node.id.name, []);
      }
    },
    CallExpression(path) {
      if (isTransactionCall(path)) {
        // Check if uses tracked fee payer
        const usedVar = getFeePayerArg(path);
        if (feePayerVars.has(usedVar)) {
          feePayerVars.get(usedVar)!.push(path.node.loc);
        }
      }
    }
  });

  // Analyze: if fee payer used >1 times, flag it
  for (const [varName, locations] of feePayerVars) {
    if (locations.length > 1) {
      issues.push({
        type: 'fee-payer-reuse',
        severity: 'CRITICAL',
        file,
        line: locations[0].start.line,
        column: locations[0].start.column,
        message: `Fee payer '${varName}' reused ${locations.length} times`,
        suggestion: 'Generate unique fee payer for each transaction',
        codeSnippet: extractSnippet(content, locations[0])
      });
    }
  }

  return issues;
}

function detectMemoPII(content: string, file: string): Issue[] {
  const issues: Issue[] = [];
  const lines = content.split('\n');

  // Regex patterns for PII
  const patterns = [
    { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, type: 'email' },
    { regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, type: 'phone' },
    { regex: /\b(?:ssn|social.?security).?\d{3}-?\d{2}-?\d{4}\b/i, type: 'ssn' }
  ];

  lines.forEach((line, idx) => {
    if (line.includes('memo:') || line.includes('memo =')) {
      for (const { regex, type } of patterns) {
        if (regex.test(line)) {
          issues.push({
            type: 'memo-pii',
            severity: 'CRITICAL',
            file,
            line: idx + 1,
            column: line.indexOf('memo'),
            message: `${type} detected in memo field`,
            suggestion: 'Remove PII from transaction memos',
            codeSnippet: line.trim()
          });
        }
      }
    }
  });

  return issues;
}
```

**CLI Interface:**
```bash
npx solana-privacy-analyzer scan src/**/*.ts --json
```

**Output Format:**
```json
{
  "issues": [
    {
      "type": "fee-payer-reuse",
      "severity": "CRITICAL",
      "file": "src/transfer.ts",
      "line": 45,
      "column": 8,
      "message": "Fee payer 'feePayer' reused 3 times",
      "suggestion": "Generate unique fee payer for each transaction",
      "codeSnippet": "const feePayer = Keypair.generate();"
    }
  ],
  "summary": {
    "critical": 1,
    "high": 0,
    "medium": 0,
    "low": 0
  }
}
```

---

### Phase 2: Create Claude Code Skill (Week 2-3)

**File: `.claude/skills/solana-privacy-scan/SKILL.md`**

```yaml
---
name: solana-privacy-scan
description: Scan Solana TypeScript/JavaScript code for privacy vulnerabilities using deterministic static analysis
disable-model-invocation: true
allowed-tools: Bash, Read, Edit, Glob
---

# Solana Privacy Scanner

You scan Solana code for privacy vulnerabilities by:
1. Running the external analyzer tool
2. Parsing results
3. Explaining issues to the user
4. Offering to fix issues automatically

## Usage

User invokes: `/solana-privacy-scan [path]`

Default path: Current working directory

## Workflow

### Step 1: Run Analyzer

Use Bash tool to run the static analyzer:

```bash
npx solana-privacy-analyzer scan $PATH --json
```

If analyzer not installed, prompt user to install:
```bash
npm install --save-dev solana-privacy-analyzer
```

### Step 2: Parse Results

The analyzer returns JSON with issues. Parse and categorize by severity.

### Step 3: Present Results

**If no issues:**
```
✅ Privacy scan complete - no issues found

Scanned X files in [path]
All code follows privacy best practices.
```

**If issues found:**

```
🔒 Privacy Scan Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found X issues in Y files:

🔴 CRITICAL (Must Fix): 2 issues

1. Fee Payer Reused
   📁 src/transfer.ts:45

   Current code:
   ```typescript
   const feePayer = Keypair.generate();
   await transfer1({ feePayer });
   await transfer2({ feePayer }); // ⚠️ REUSED
   await transfer3({ feePayer }); // ⚠️ REUSED
   ```

   ⚠️ Impact: All 3 transfers are linkable on-chain, completely
   compromising privacy. Anyone analyzing the blockchain can see
   they came from the same source.

   ✅ Fix: Generate unique fee payer per transaction

   Type 'fix 1' to apply automatic fix

2. Email in Memo Field
   📁 src/payment.ts:78

   Current code:
   ```typescript
   memo: "Payment to user@example.com"
   ```

   ⚠️ Impact: Email permanently exposed on-chain and searchable.
   Can be used to link wallet to real identity.

   ✅ Fix: Remove PII from memo

   Type 'fix 2' to apply automatic fix

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Privacy Score: 3/10 (High Risk)

Commands:
- 'fix all' - Apply all automatic fixes
- 'fix 1,2' - Fix specific issues
- 'explain 1' - Get detailed explanation of issue #1
- 'ignore 1' - Mark issue #1 as intentional
```

### Step 4: Apply Fixes

When user requests fixes, use Read and Edit tools:

**For fee payer reuse:**
1. Read the file
2. Find the fee payer variable declaration
3. Replace shared variable with inline `Keypair.generate()` per usage
4. Use Edit tool to apply changes

**For memo PII:**
1. Read the file
2. Remove or redact PII from memo strings
3. Use Edit tool to apply changes

**After fixing:**
```
✅ Applied fixes for issues #1, #2

Re-running scan to verify...
✅ All issues resolved - privacy scan now clean
```

### Step 5: Educational Explanations

When user types 'explain N', provide detailed context:

```
💡 Fee Payer Reuse - Why It Matters

On Solana, every transaction has a "fee payer" - the account that
pays for transaction fees. This is different from the sender.

When you reuse the same fee payer across multiple transactions:
- All transactions become linkable on-chain
- Blockchain analysts can group them together
- Privacy is completely compromised

Example:
- Transaction 1: Alice → Bob (fee payer: X)
- Transaction 2: Alice → Carol (fee payer: X)
→ Analysts know both transactions came from the same source

Best Practice:
Generate a unique fee payer for each transaction, or batch
transactions that you're okay being linked together.

Trade-offs:
- More fee payers = higher cost (each needs SOL)
- But essential for privacy-critical applications
```

## Key Implementation Notes

1. **Always run analyzer first** - Don't try to detect patterns yourself
2. **Trust analyzer results** - They're deterministic and tested
3. **Focus on clear explanations** - Make it educational
4. **Be cautious with fixes** - Verify code before/after
5. **Re-run scan after fixes** - Confirm issues are resolved

## Error Handling

If analyzer fails:
```
❌ Privacy scanner failed to run

Error: [error message]

Troubleshooting:
1. Install analyzer: npm install --save-dev solana-privacy-analyzer
2. Check file paths are correct
3. Verify files are valid TypeScript/JavaScript
```

If analyzer not installed:
```
⚠️ Solana Privacy Analyzer not found

This skill requires the analyzer tool to run static analysis.

Install it:
npm install --save-dev solana-privacy-analyzer

Then re-run: /solana-privacy-scan
```
```

---

### Phase 3: Lightweight PostToolUse Hook (Week 3, Optional)

**File: `.claude/hooks/privacy-quick-check.js`**

```javascript
#!/usr/bin/env node

// Quick privacy check for obvious issues
// Runs after Write/Edit on Solana files
// Completes in <2 seconds

const fs = require('fs');
const path = require('path');

const MEMO_PII_PATTERNS = [
  { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, type: 'email' },
  { regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, type: 'phone' }
];

async function quickScan(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const issues = [];

  // Only check for PII in memos (fast regex)
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('memo:') || line.includes('memo =')) {
      for (const { regex, type } of MEMO_PII_PATTERNS) {
        if (regex.test(line)) {
          issues.push({
            line: idx + 1,
            type,
            message: `${type} detected in memo field - this will be public on-chain`
          });
        }
      }
    }
  });

  return issues;
}

async function main() {
  const filePath = process.argv[2];

  // Only check TypeScript/JavaScript files
  if (!/\.(ts|js|tsx|jsx)$/.test(filePath)) {
    process.exit(0);
  }

  // Only check if file contains Solana imports
  const content = await fs.promises.readFile(filePath, 'utf-8');
  if (!content.includes('@solana/web3.js')) {
    process.exit(0);
  }

  const issues = await quickScan(filePath);

  if (issues.length > 0) {
    console.log('⚠️  Privacy Warning:');
    issues.forEach(issue => {
      console.log(`  Line ${issue.line}: ${issue.message}`);
    });
    console.log('\n  Run /solana-privacy-scan for full analysis');
    process.exit(0); // Don't block, just warn
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Privacy check error:', err.message);
  process.exit(0); // Don't block on errors
});
```

**Hook Configuration: `.claude/hooks/hooks.json`**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/privacy-quick-check.js",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

---

## User Experience Flow

### Scenario 1: Developer Writes New Code

```typescript
// Developer writes:
async function batchTransfer(recipients: PublicKey[]) {
  const feePayer = Keypair.generate();

  for (const recipient of recipients) {
    await sendTransaction(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipient,
          lamports: LAMPORTS_PER_SOL
        })
      ),
      [wallet, feePayer] // ⚠️ Reused fee payer
    );
  }
}
```

**Saves file** → PostToolUse hook runs (if configured):
```
✅ Quick privacy check passed
```

**Before committing, developer runs:**
```
/solana-privacy-scan src/
```

**Claude responds:**
```
🔒 Running privacy analyzer...

Found 1 critical issue in src/transfer.ts:

🔴 Fee Payer Reused (Line 2)
   Variable 'feePayer' used in 5 transactions

   This creates a linkable transaction graph.

   Type 'fix 1' to apply automatic fix, or 'explain 1' for details
```

**Developer types:** `fix 1`

**Claude:**
```
✅ Applying fix to src/transfer.ts...

Changed:
- const feePayer = Keypair.generate();
- Used in 5 places

To:
- Inline Keypair.generate() at each usage

Re-running scan...
✅ All issues resolved - privacy scan clean
```

---

### Scenario 2: CI/CD Integration

**`.github/workflows/privacy-check.yml`**

```yaml
name: Privacy Check

on: [pull_request]

jobs:
  privacy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Install privacy analyzer
        run: npm install --save-dev solana-privacy-analyzer

      - name: Run privacy scan
        run: |
          npx solana-privacy-analyzer scan src/ --json > report.json

      - name: Check results
        run: |
          CRITICAL=$(jq '.summary.critical' report.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "❌ Privacy scan failed: $CRITICAL critical issues found"
            jq '.issues' report.json
            exit 1
          fi
          echo "✅ Privacy scan passed"
```

Developer can then use Claude Code skill to fix issues:
```
/solana-privacy-scan src/
[Reviews issues from CI]
fix all
```

---

## What Gets Built

### Deliverables

1. **`packages/code-analyzer/`** - Deterministic static analysis tool
   - AST parsing for pattern detection
   - JSON output format
   - CLI interface
   - ~2-3 days of work

2. **`.claude/skills/solana-privacy-scan/`** - Claude Code skill
   - Orchestrates analyzer
   - Formats results
   - Applies fixes
   - Educational explanations
   - ~2-3 days of work

3. **`.claude/hooks/privacy-quick-check.js`** - Lightweight hook (optional)
   - Fast PII detection only
   - Non-blocking warnings
   - ~1 day of work

4. **Documentation** - Usage guide
   - Installation instructions
   - Example workflows
   - CI/CD integration
   - ~1 day of work

**Total time:** 1-2 weeks for full implementation

---

## Advantages of This Approach

✅ **Reliable** - Deterministic static analysis, no false negatives
✅ **Fast** - Analyzer runs in <5 seconds for typical projects
✅ **Explicit Control** - Developer chooses when to scan
✅ **CI/CD Ready** - Analyzer can run in automated pipelines
✅ **Intelligent Fixes** - Claude understands context for fixing
✅ **Educational** - Clear explanations help developers learn
✅ **No Noise** - Only runs when invoked, no auto-triggering chaos

---

## What This Doesn't Do (And That's OK)

❌ **Automatic scanning on every file save** - Too slow, too noisy
❌ **Real-time IDE feedback** - Not an LSP server, requires explicit invocation
❌ **Complex data flow analysis** - Static analysis has limits
❌ **On-chain analysis** - Focuses on code, not deployed contracts (could add MCP later)
❌ **False positive elimination** - Will flag issues that might be intentional

---

## Next Steps

### Week 1: Validate with Prototype

1. **Build minimal analyzer** - Just fee payer reuse detection
2. **Create basic skill** - Run analyzer and show results
3. **Test with real Solana projects** - See if it catches actual issues
4. **Gather feedback** - Is this useful? What's missing?

### Week 2: Build Full Version

1. **Complete analyzer** - All pattern detections
2. **Polish skill** - Better formatting, explanations, fixes
3. **Add CI/CD examples** - GitHub Actions workflow
4. **Write documentation** - Installation and usage guide

### Week 3: Launch

1. **Test with beta users** - 5-10 Solana developers
2. **Iterate based on feedback** - Fix issues, improve UX
3. **Publish analyzer to npm** - Make it easy to install
4. **Publish skill to marketplace** - Or GitHub for distribution

---

## Success Criteria

**Must Have:**
- Analyzer detects fee payer reuse with 100% accuracy
- Analyzer detects PII in memos with >95% accuracy
- Skill can run analyzer and present results clearly
- Skill can apply fixes safely (with confirmation)

**Nice to Have:**
- Detects signer overlap patterns
- Detects known entity interactions
- Lightweight PostToolUse hook for instant feedback
- CI/CD examples for multiple platforms

**Stretch Goals:**
- MCP server for on-chain analysis
- IDE extension for real-time feedback
- Custom rule configuration per project

---

## Conclusion

**The practical approach is:**

Build a **deterministic external analyzer** that does reliable pattern detection, then create a **Claude Code skill** that orchestrates it and provides intelligent fixing and explanations.

This gives you:
- ✅ Reliability (no false negatives)
- ✅ Speed (fast enough for developer workflow)
- ✅ Intelligence (Claude's contextual understanding)
- ✅ Control (explicit invocation, no noise)

**This is buildable in 1-2 weeks and will be genuinely useful to Solana developers.**

---

## Implementation Guide

### Project Structure

```
solana-privacy-scanner/
├── packages/
│   ├── core/              # Existing - on-chain scanner
│   ├── cli/               # Existing - CLI tool
│   ├── ci-tools/          # Existing - CI/CD tools
│   ├── code-analyzer/     # NEW - Static code analyzer
│   └── claude-plugin/     # NEW - Claude Code plugin
```

### Phase 1: Static Analyzer Package (2-3 days)

**Location:** `packages/code-analyzer/`

**Structure:**
```
packages/code-analyzer/
├── src/
│   ├── index.ts           # Main entry point + CLI
│   ├── analyzer.ts        # Core analysis orchestrator
│   ├── detectors/
│   │   ├── fee-payer-reuse.ts
│   │   ├── memo-pii.ts
│   │   ├── signer-overlap.ts
│   │   └── known-entities.ts
│   ├── types.ts           # Issue types, result types
│   └── utils.ts           # AST helpers, file reading
├── test/
│   ├── fixtures/          # Sample code with issues
│   └── analyzer.test.ts   # Tests for each detector
├── package.json
├── tsconfig.json
└── README.md
```

**Build Steps:**

1. **Setup package structure**
   - Create directory and package.json
   - Add TypeScript config
   - Install dependencies: `@typescript-eslint/parser`, `@typescript-eslint/typescript-estree`, `commander`, `chalk`

2. **Implement types** (`types.ts`)
   - Define `Issue` interface
   - Define `AnalyzerResult` interface
   - Define severity levels

3. **Build detector: Fee Payer Reuse** (`detectors/fee-payer-reuse.ts`)
   - Parse TypeScript/JavaScript with AST
   - Track variable declarations with `Keypair.generate()`
   - Track usage in transaction calls
   - Flag if used >1 time
   - Write tests with fixtures

4. **Build detector: Memo PII** (`detectors/memo-pii.ts`)
   - Regex patterns for email, phone, SSN
   - Scan memo fields in code
   - Flag matches
   - Write tests

5. **Build core analyzer** (`analyzer.ts`)
   - Load files from directory
   - Run all detectors
   - Aggregate results
   - Calculate summary

6. **Build CLI** (`index.ts`)
   - Parse arguments with commander
   - Run analyzer
   - Output JSON or formatted text
   - Exit codes for CI/CD

7. **Test thoroughly**
   - Create test fixtures with known issues
   - Verify 100% detection accuracy
   - Test edge cases

### Phase 2: Claude Code Plugin (1-2 days)

**Location:** `packages/claude-plugin/`

**Structure:**
```
packages/claude-plugin/
├── skills/
│   └── solana-privacy-scan/
│       ├── SKILL.md           # Main skill definition
│       └── examples/
│           ├── good-code.ts   # Examples of privacy-safe code
│           └── bad-code.ts    # Examples with issues
├── .claude-plugin/
│   └── plugin.json            # Plugin manifest
├── hooks/
│   ├── hooks.json             # Hook configuration
│   └── quick-check.js         # Fast PII check (optional)
├── README.md                  # Installation & usage
└── package.json               # Dependencies
```

**Build Steps:**

1. **Create plugin manifest** (`.claude-plugin/plugin.json`)
   - Define name, version, description
   - Set metadata

2. **Write skill** (`skills/solana-privacy-scan/SKILL.md`)
   - Instructions for running analyzer
   - Response formatting templates
   - Fix application logic
   - Educational explanations
   - Error handling

3. **Add code examples** (skill reference files)
   - Good patterns (privacy-safe)
   - Bad patterns (with issues)
   - Claude loads these as reference

4. **Test skill locally**
   - Use `claude --plugin-dir packages/claude-plugin`
   - Run `/solana-privacy-scan` on test code
   - Verify analyzer runs correctly
   - Verify formatting is clear
   - Test fix application

5. **(Optional) Add quick hook** (`hooks/quick-check.js`)
   - Fast memo PII check only
   - Configure in hooks.json
   - Test doesn't block workflow

### Phase 3: Integration & Testing (1 day)

1. **Test end-to-end workflow**
   - Create sample Solana project with issues
   - Install analyzer: `npm install --save-dev solana-privacy-analyzer`
   - Load plugin: `claude --plugin-dir packages/claude-plugin`
   - Run: `/solana-privacy-scan src/`
   - Verify issues detected
   - Test fixes: `fix all`
   - Verify fixes work

2. **Test CI/CD integration**
   - Create GitHub Actions workflow
   - Run analyzer in CI
   - Verify exit codes work
   - Test JSON output parsing

3. **Write documentation**
   - `packages/code-analyzer/README.md` - Analyzer usage
   - `packages/claude-plugin/README.md` - Plugin installation
   - Update main repo README with plugin info

### Phase 4: Release & Distribution

**Analyzer Distribution:**
```bash
# Publish to npm
cd packages/code-analyzer
npm publish --access public

# Users install:
npm install --save-dev solana-privacy-analyzer
```

**Plugin Distribution (Two Options):**

**Option 1: GitHub Distribution (Recommended for MVP)**
```bash
# Users install:
git clone https://github.com/taylorferran/solana-privacy-scanner
cd solana-privacy-scanner/packages/claude-plugin

# Load in Claude Code:
claude --plugin-dir /path/to/solana-privacy-scanner/packages/claude-plugin
```

**Option 2: Claude Plugin Marketplace (Future)**
```bash
# Once approved by Anthropic:
/plugin install solana-privacy
```

**For MVP, use GitHub distribution:**
- Faster to ship
- Can iterate quickly
- No approval process
- Users already familiar with the project

---

## Task Breakdown

### Static Analyzer Tasks

**Setup (30 mins)**
- [ ] Create `packages/code-analyzer/` directory
- [ ] Initialize package.json with dependencies
- [ ] Create tsconfig.json
- [ ] Setup build script

**Types & Core (1 hour)**
- [ ] Create types.ts with Issue, AnalyzerResult interfaces
- [ ] Create analyzer.ts with main orchestration logic
- [ ] Create utils.ts with file reading helpers

**Detector: Fee Payer Reuse (3-4 hours)**
- [ ] Implement AST parsing for variable tracking
- [ ] Detect Keypair.generate() assignments
- [ ] Track usage in sendTransaction/transfer calls
- [ ] Flag reuse with line/column info
- [ ] Create test fixtures with reuse cases
- [ ] Write tests verifying 100% detection

**Detector: Memo PII (1-2 hours)**
- [ ] Implement regex patterns for PII
- [ ] Scan memo fields in code
- [ ] Flag matches with context
- [ ] Create test fixtures
- [ ] Write tests

**CLI Interface (1 hour)**
- [ ] Implement commander CLI
- [ ] Add --json flag
- [ ] Add formatted text output
- [ ] Proper exit codes

**Testing & Polish (2 hours)**
- [ ] Test on real Solana projects
- [ ] Fix edge cases
- [ ] Polish error messages
- [ ] Write README

### Plugin Tasks

**Setup (30 mins)**
- [ ] Create `packages/claude-plugin/` directory
- [ ] Create directory structure
- [ ] Create plugin.json manifest

**Skill Implementation (3-4 hours)**
- [ ] Write SKILL.md with full instructions
- [ ] Add analyzer execution logic
- [ ] Add result formatting templates
- [ ] Add fix application logic
- [ ] Add educational explanations
- [ ] Create example reference files

**Testing (2 hours)**
- [ ] Load plugin in Claude Code
- [ ] Test analyzer execution
- [ ] Test result formatting
- [ ] Test fix application
- [ ] Test error handling

**Documentation (1 hour)**
- [ ] Write plugin README
- [ ] Add installation instructions
- [ ] Add usage examples
- [ ] Update main repo README

### Total Estimated Time: 15-20 hours (2-3 days of focused work)

---

## Testing Strategy

### Unit Tests (Analyzer)
```typescript
// packages/code-analyzer/test/analyzer.test.ts
describe('Fee Payer Reuse Detection', () => {
  it('detects fee payer reused in loop', async () => {
    const code = `
      const feePayer = Keypair.generate();
      for (const recipient of recipients) {
        await sendTransaction(tx, [wallet, feePayer]);
      }
    `;
    const result = await analyze(code);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].type).toBe('fee-payer-reuse');
    expect(result.issues[0].severity).toBe('CRITICAL');
  });

  it('does not flag unique fee payers', async () => {
    const code = `
      for (const recipient of recipients) {
        const feePayer = Keypair.generate();
        await sendTransaction(tx, [wallet, feePayer]);
      }
    `;
    const result = await analyze(code);
    expect(result.issues).toHaveLength(0);
  });
});
```

### Integration Tests (Plugin)
```bash
# Test with real code
cd test-project
echo "const feePayer = Keypair.generate();" > test.ts
claude --plugin-dir ../packages/claude-plugin
# Run: /solana-privacy-scan test.ts
# Verify: Reports fee payer reuse issue
```

### CI/CD Tests
```bash
# Test analyzer in CI mode
npx solana-privacy-analyzer scan fixtures/ --json > report.json
# Verify exit code 1 if issues found
# Verify JSON format correct
```

---

## Release Checklist

**Analyzer Package:**
- [ ] All tests passing
- [ ] README complete with examples
- [ ] CLI documented with --help
- [ ] Version 0.1.0 in package.json
- [ ] Published to npm

**Plugin:**
- [ ] Skill tested with analyzer
- [ ] README has installation steps
- [ ] Example workflows documented
- [ ] Version 0.1.0 in plugin.json
- [ ] Tagged in git

**Documentation:**
- [ ] Main README updated with plugin info
- [ ] Link to plugin README added
- [ ] Example usage in docs site
- [ ] Blog post or announcement ready

**Validation:**
- [ ] Works on macOS, Linux, Windows
- [ ] Works with Node 18, 20, 22
- [ ] Analyzer runs in <5 seconds on typical projects
- [ ] Plugin successfully detects and fixes issues
- [ ] CI/CD example workflow tested
