---
sidebar_position: 1
---

# Claude Code Plugin Overview

An AI-powered plugin for Claude Code that automatically detects and fixes privacy vulnerabilities in your Solana code.

## What is This?

The Solana Privacy Scanner plugin for Claude Code combines:

- **Static Code Analyzer** - Deterministic pattern detection using AST parsing
- **Claude's Intelligence** - Context-aware fixing and explanation
- **Interactive Workflow** - Review and approve fixes before they're applied

This gives you the best of both worlds: **reliable detection** + **smart fixing**.

## Why Use the Plugin?

### Instant Privacy Feedback

Run `/solana-privacy-scan` and get immediate analysis of your Solana code:

```
/solana-privacy-scan src/
```

Claude will:
1. Run the static analyzer
2. Report all privacy issues found
3. Explain each issue's impact
4. Suggest and apply fixes with your approval

### AI-Powered Fixes

Unlike traditional linters that just point out problems, Claude can:

- **Understand Context** - Knows why the code is written a certain way
- **Refactor Safely** - Maintains functionality while fixing privacy issues
- **Explain Trade-offs** - Discusses performance vs. privacy implications
- **Handle Edge Cases** - Adapts fixes to your specific patterns

### Interactive Review

You stay in control:

1. Claude explains what's wrong
2. Shows you the proposed fix
3. You approve or request changes
4. Claude applies the fix

No automatic code changes - you review everything.

## How It Works

### Architecture

```
┌─────────────────┐
│  /solana-       │
│  privacy-scan   │  ← You invoke the skill
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Claude Code    │
│  Skill          │  ← Orchestrates the workflow
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Static Code    │
│  Analyzer       │  ← Deterministic detection
│  (npm package)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JSON Report    │  ← Issues with severity
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Claude         │
│  Analysis +     │  ← Intelligent fixing
│  Fixing         │
└─────────────────┘
```

### Detection: Static Analyzer

The static analyzer (npm package `solana-privacy-analyzer`) provides:

- **100% Deterministic** - No false negatives for known patterns
- **Fast** - Scans typical projects in under 5 seconds
- **AST-Based** - Accurate pattern matching
- **Severity Ratings** - CRITICAL, HIGH, MEDIUM, LOW

### Fixing: Claude Intelligence

Claude Code provides:

- **Context Understanding** - Reads your entire codebase
- **Safe Refactoring** - Maintains code functionality
- **Explanations** - Helps you learn privacy best practices
- **Adaptive** - Works with any code style or framework

## What It Detects

### 1. Fee Payer Reuse (CRITICAL)

**Problem:** Same fee payer used across multiple transactions in a loop.

**Example:**

```typescript
// ❌ BAD - All transactions linkable
const feePayer = Keypair.generate();
for (const recipient of recipients) {
  await sendTransaction(tx, [wallet, feePayer]);
}
```

**Fix:**

```typescript
// ✅ GOOD - Each transaction unlinkable
for (const recipient of recipients) {
  const feePayer = Keypair.generate();
  await sendTransaction(tx, [wallet, feePayer]);
}
```

**Impact:** Complete loss of privacy - all transactions can be linked on-chain.

### 2. PII in Memos (CRITICAL/HIGH/MEDIUM)

**Problem:** Personally identifiable information stored in transaction memos.

**Severity Levels:**

- **CRITICAL**: Email, phone, SSN, credit card
- **HIGH**: Personal names, sensitive URLs
- **MEDIUM**: Descriptive content revealing identity

**Example:**

```typescript
// ❌ BAD - PII exposed forever
createMemoInstruction("Payment to john@example.com")
createMemoInstruction("User: John Smith")

// ✅ GOOD - Generic or omitted
createMemoInstruction("Payment")
// Or omit memo entirely
```

**Impact:** Personal information permanently exposed on-chain, searchable forever.

## Use Cases

### During Development

Catch privacy issues while writing code:

```
/solana-privacy-scan src/batch-transfer.ts
```

Claude will review your file and suggest improvements.

### Before Committing

Scan staged changes:

```
/solana-privacy-scan src/
```

Get a clean privacy bill of health before pushing.

### Code Reviews

Let Claude review pull requests for privacy issues:

```
/solana-privacy-scan
```

Claude will scan the current directory and report findings.

### Learning

Understand privacy patterns:

```
/solana-privacy-scan examples/
```

Claude explains why certain patterns are problematic and how to fix them.

## Installation

The plugin requires:

1. **Claude Code CLI** installed
2. **Solana Privacy Analyzer** npm package in your project
3. **Plugin files** loaded from GitHub

See the [Installation Guide](./installation) for detailed setup instructions.

## Comparison: Plugin vs. CLI

| Feature | CLI Tool | Claude Plugin |
|---------|----------|---------------|
| Detection | ✅ Same AST-based | ✅ Same AST-based |
| Speed | ✅ Under 5 seconds | ✅ Under 5 seconds |
| CI/CD | ✅ Excellent | ❌ Manual only |
| Auto-fixing | ❌ No | ✅ Yes |
| Explanations | ❌ Basic | ✅ Detailed |
| Context-aware | ❌ No | ✅ Yes |
| Interactive | ❌ No | ✅ Yes |
| Best for | Automation | Development |

**Recommendation:** Use **both**:
- **CLI** for CI/CD, pre-commit hooks, automation
- **Plugin** for development, learning, interactive fixing

## Next Steps

- [Installation](./installation) - Set up the plugin
- [Usage Guide](./usage) - Learn the `/solana-privacy-scan` command
- [Examples](./examples) - See it in action
- [Code Analyzer CLI](../code-analyzer/overview) - Use the standalone tool
