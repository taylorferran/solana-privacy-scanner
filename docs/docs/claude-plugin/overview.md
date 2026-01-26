---
sidebar_position: 1
---

# Claude Plugin

Privacy analysis plugin for Claude Code with AI-powered explanations and code fixes.

## Installation

In Claude Code, add the marketplace:

```
/plugins add-marketplace taylorferran/solana-privacy-scanner
```

Install the plugin:

```
/plugins install solana-privacy-scanner@solana-privacy-scanner-marketplace
```

## Skills

**Analysis:**
- `/scan-wallet` - Analyze wallet privacy on-chain
- `/scan-code` - Static analysis for privacy anti-patterns

**Education:**
- `/explain-risk` - Learn about specific privacy risks
- `/suggest-fix` - Get code fixes for detected issues

**Audit:**
- `/privacy-audit` - Full codebase privacy audit

## Quick Start

**Scan a wallet:**

```
/scan-wallet DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy
```

**Analyze code:**

```
/scan-code src/transactions.ts
```

**Learn about risks:**

```
/explain-risk fee-payer-reuse
```

## RPC Configuration

The plugin uses a default QuickNode RPC endpoint. Override if needed:

```bash
export SOLANA_RPC=https://your-rpc-url.com
```

Or use `--rpc` flag:

```
/scan-wallet ADDRESS --rpc https://your-rpc.com
```

## Next Steps

- **[Skills](./skills)** - Complete skill reference
