---
sidebar_position: 1
---

# Claude Code Plugin

## What

Plugin for Claude Code that detects and fixes privacy vulnerabilities in Solana code.

## Why

Catch privacy leaks during development with interactive fixing.

## How

```
/solana-privacy-scan src/
```

**Flow:**
1. Runs static analyzer on your code
2. Reports privacy issues with severity
3. Explains each issue
4. Proposes fixes for your approval

**Detects:**
- Fee payer reuse in loops (CRITICAL)
- PII in transaction memos (CRITICAL/HIGH/MEDIUM)

## Setup

```bash
# 1. Install analyzer in your project
npm install --save-dev solana-privacy-analyzer

# 2. Load plugin in Claude Code
# (See installation docs)
```

[Installation Guide](./installation) | [Code Analyzer CLI](../code-analyzer/overview)
