---
sidebar_position: 1
---

# Claude Plugin

AI-powered privacy analysis integrated directly into Claude Code.

## Installation

Open Claude Code and run:

```
/plugins add-marketplace taylorferran/solana-privacy-scanner
```

Then install the plugin:

```
/plugins install solana-privacy-scanner@solana-privacy-scanner-marketplace
```

## Available Skills

- `/scan-wallet` - Analyze on-chain wallet privacy
- `/scan-code` - Detect privacy risks in source code
- `/explain-risk` - Learn about specific privacy risks
- `/suggest-fix` - Get code fixes for detected issues
- `/privacy-audit` - Full codebase privacy audit

## Quick Examples

**Scan a wallet:**

```
/scan-wallet DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy
```

**Analyze your code:**

```
/scan-code src/transactions.ts
```

**Learn about a risk:**

```
/explain-risk fee-payer-reuse
```

**Get a fix suggestion:**

```
/suggest-fix fee-payer-reuse
```

## Configuration

**Custom RPC endpoint:**

```bash
export SOLANA_RPC=https://your-rpc-url.com
```

Or use the `--rpc` flag:

```
/scan-wallet ADDRESS --rpc https://your-rpc.com
```

**Limit transaction depth:**

```
/scan-wallet ADDRESS --max-signatures 50
```

## Next Steps

- **[Skills Reference](./skills)** - Complete skill documentation
