# Claude Code Plugin Implementation Plan

## Overview

Build a Claude Code plugin that integrates the Solana Privacy Scanner toolkit with Claude's AI capabilities to provide interactive privacy analysis, explanations, and fixes for Solana development.

## Architecture

```
packages/claude-plugin/
├── .claude-plugin/
│   └── manifest.json          # Plugin metadata and configuration
├── skills/
│   ├── scan-code/             # Static code analysis skill
│   ├── scan-wallet/           # On-chain wallet analysis skill
│   ├── explain-risk/          # Explain privacy risk details skill
│   └── suggest-fix/           # Generate fix suggestions skill
├── src/
│   ├── index.ts               # Main plugin entry point
│   ├── analyzer.ts            # Static analyzer integration
│   ├── scanner.ts             # On-chain scanner integration
│   ├── formatter.ts           # Output formatting utilities
│   └── types.ts               # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

## Tasks

### Phase 1: Plugin Foundation

- [x] **Task 1.1**: Create plugin directory structure ✅
  - Create `packages/claude-plugin/` directory
  - Set up `.claude-plugin/manifest.json`
  - Create `package.json` with dependencies
  - Set up TypeScript configuration

- [x] **Task 1.2**: Create core plugin infrastructure ✅
  - Implement main `src/index.ts` entry point
  - Create `src/types.ts` with shared types
  - Set up formatter utilities in `src/formatter.ts`
  - Add build configuration

### Phase 2: Static Analysis Skill

- [x] **Task 2.1**: Implement scan-code skill ✅
  - Create `skills/scan-code/skill.md` with skill definition
  - Create `skills/scan-code/handler.ts` for skill logic
  - Integrate with `solana-privacy-scanner` analyze command
  - Format analyzer results for Claude

- [x] **Task 2.2**: Add analysis result parsing ✅
  - Parse analyzer JSON output
  - Extract issue details (severity, location, message)
  - Group issues by file and severity
  - Create human-readable summaries

### Phase 3: On-Chain Analysis Skill

- [x] **Task 3.1**: Implement scan-wallet skill ✅
  - Create `skills/scan-wallet/skill.md`
  - Create `skills/scan-wallet/handler.ts`
  - Integrate with wallet scanning from core library
  - Format privacy reports

- [x] **Task 3.2**: Add report formatting ✅
  - Format signals with evidence
  - Format mitigations as actionable items
  - Add known entity information
  - Create risk level visualizations

### Phase 4: AI-Powered Explanation Skill

- [x] **Task 4.1**: Implement explain-risk skill ✅
  - Create `skills/explain-risk/skill.md`
  - Create `skills/explain-risk/handler.ts`
  - Map risk signal IDs to detailed explanations
  - Provide context-aware privacy education

- [x] **Task 4.2**: Add contextual explanations ✅
  - Explain why each risk matters
  - Describe real-world deanonymization scenarios
  - Reference Solana-specific privacy considerations
  - Link to relevant documentation

### Phase 5: Fix Suggestion Skill

- [x] **Task 5.1**: Implement suggest-fix skill ✅
  - Create `skills/suggest-fix/skill.md`
  - Create `skills/suggest-fix/handler.ts`
  - Generate code fix suggestions
  - Map issues to fix templates

- [x] **Task 5.2**: Add fix generation logic ✅
  - Fee payer reuse fixes (move inside loop)
  - Memo PII removal fixes (sanitize/remove)
  - Generic privacy improvement templates
  - Code diff formatting

### Phase 6: Integration & Testing

- [x] **Task 6.1**: Create integration tests ✅
  - Test each skill independently
  - Test skill chaining workflows
  - Test error handling
  - Test with real code samples

- [ ] **Task 6.2**: Documentation
  - Write comprehensive README
  - Create usage examples
  - Document each skill's capabilities
  - Add troubleshooting guide

### Phase 7: Polish & Distribution

- [ ] **Task 7.1**: Add CLI helpers
  - Create interactive mode
  - Add progress indicators
  - Improve error messages
  - Add verbose/quiet modes

- [ ] **Task 7.2**: Prepare for distribution
  - Create installation guide
  - Add plugin publishing metadata
  - Create demo video/GIFs
  - Write announcement post

## Skills Detail

### 1. scan-code Skill

**Purpose:** Analyze source code for privacy anti-patterns

**Usage:**
```
/scan-code src/transactions.ts
/scan-code src/**/*.ts
```

**Output:**
- List of detected issues
- Severity levels (CRITICAL, HIGH, MEDIUM, LOW)
- File locations with line numbers
- Brief descriptions

**Integration:**
- Uses `solana-privacy-scanner analyze` command
- Parses JSON output
- Formats for Claude Code UI

### 2. scan-wallet Skill

**Purpose:** Analyze on-chain wallet privacy

**Usage:**
```
/scan-wallet DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy
/scan-wallet ADDRESS --json
```

**Output:**
- Overall risk level
- Privacy signals with evidence
- Known entity interactions
- Mitigation recommendations

**Integration:**
- Uses `solana-privacy-scanner-core` library
- Calls `collectWalletData`, `normalizeWalletData`, `generateReport`
- Formats privacy report

### 3. explain-risk Skill

**Purpose:** Deep-dive explanation of specific privacy risks

**Usage:**
```
/explain-risk fee-payer-reuse
/explain-risk memo-pii
```

**Output:**
- What the risk is
- Why it matters
- How it could be exploited
- Real-world examples
- Prevention strategies

**Integration:**
- Built-in knowledge base
- Maps signal IDs to explanations
- Context-aware based on detected issues

### 4. suggest-fix Skill

**Purpose:** Generate code fixes for detected issues

**Usage:**
```
/suggest-fix src/transactions.ts:25
/suggest-fix fee-payer-reuse
```

**Output:**
- Before/after code comparison
- Explanation of changes
- Alternative approaches
- Testing recommendations

**Integration:**
- Template-based fix generation
- AST-aware code modifications
- Preserves code style

## Technical Decisions

### Dependencies

```json
{
  "dependencies": {
    "solana-privacy-scanner": "file:../cli",
    "solana-privacy-scanner-core": "file:../core"
  }
}
```

### Skill Format

Each skill follows Claude Code skill structure:
- `skill.md` - Markdown file defining skill metadata and behavior
- `handler.ts` - Optional TypeScript handler for complex logic

### Data Flow

1. User invokes skill in Claude Code
2. Skill definition parsed by Claude
3. Handler executes (if present)
4. Results formatted and returned to Claude
5. Claude presents results with AI-powered context

## Success Criteria

- [ ] All 4 skills working independently
- [ ] Skills can be chained together (scan → explain → fix)
- [ ] Handles errors gracefully
- [ ] Provides clear, actionable feedback
- [ ] Works with both local files and on-chain data
- [ ] Documentation complete and clear
- [ ] Ready for distribution

## Timeline

**Phase 1-2:** Foundation + Static Analysis (Current)
**Phase 3-4:** On-Chain Analysis + Explanations
**Phase 5-6:** Fixes + Testing
**Phase 7:** Polish + Release

## Next Steps

Starting with **Task 1.1**: Create plugin directory structure
