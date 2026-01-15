# Testing Label Detection

## Current Status

The label system is **fully working** and displays known entities in a dedicated section of the report.

## How Labels Appear

Labels show up in two ways:

### 1. "KNOWN ENTITIES DETECTED" Section (Always shown if any are found)

This informational section lists all known addresses that appeared in the scan, grouped by type:

```
KNOWN ENTITIES DETECTED
───────────────────────────────────────────────────────────────

Exchanges:
  • Binance Hot Wallet
    Binance centralized exchange hot wallet

DeFi Protocols:
  • Jupiter Aggregator v6
    Jupiter DEX aggregator program

Note: These addresses were involved in transactions or identified in the scan.
This does not necessarily indicate a privacy risk.
```

### 2. "Known Entity Interaction" Risk Signal (Only if transfers detected)

When your wallet **sends or receives** tokens to/from a known entity, you'll also get a HIGH/MEDIUM risk signal:

```
DETECTED PRIVACY RISKS
───────────────────────────────────────────────────────────────

1. Known Entity Interaction [HIGH]

   Reason:
   Wallet interacted with 2 known entities

   Why This Matters:
   Interactions with centralized exchanges, bridges, or other known entities 
   can link your on-chain address to your real-world identity through KYC data, 
   IP addresses, and off-chain records.

   Evidence:
   • 3 interaction(s) with Binance Hot Wallet (exchange)
   • 1 interaction(s) with Wormhole Token Bridge (bridge)
```

## Testing Commands

### Test with your own wallet
```bash
# If you've interacted with Binance, Coinbase, or used Wormhole bridge:
solana-privacy-scanner scan-wallet YOUR_WALLET_ADDRESS --max-signatures 50
```

### The label system tracks these entities:

**Exchanges (HIGH privacy risk):**
- `5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9` - Binance Hot Wallet
- `2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S` - FTX Hot Wallet
- `H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS` - Bybit Hot Wallet
- `9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM` - Coinbase Custody

**Bridges (MEDIUM privacy risk):**
- `wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb` - Wormhole Token Bridge
- `WnFt12ZrnzZrFZkt2xsNsaNWoQribnuQ5B5FrDbwDhD` - Wormhole NFT Bridge
- `BBnraYq3M9GqTWDH5ZZ4H8hW8q3wMnRqmqo9AJZLfrdx` - Allbridge

**Major Protocols:**
- `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4` - Jupiter Aggregator v6
- `whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc` - Orca Whirlpools
- `675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8` - Raydium AMM v4

## Why You Might Not See Labels

If a wallet scan shows **no known entities**, it means:

1. ✓ Labels are loading correctly (you'll see `Loaded 15 address labels` in output)
2. ✗ The wallet hasn't interacted with any of the 15 known addresses we track
3. This is actually a **good thing** for privacy - no known entity interactions!

## When Labels Matter Most

Labels are most relevant for detecting:
- **Exchange deposits/withdrawals** - Links on-chain activity to KYC identity
- **Bridge usage** - Shows cross-chain activity patterns
- **Centralized service usage** - Indicates reliance on centralized infrastructure

## Future Enhancements

To make labels more visible, we could:
- Show "Interacted Programs" section listing all known programs used
- Add labels to the evidence data even when no risk signal fires
- Create a separate "Known Entities Detected" informational section

For now, labels appear when the privacy risk is significant enough to warrant a signal.

## Verification

You can verify labels are loaded by looking for this line in CLI output:
```
Loaded 15 address labels
```

If you see this, the system is working correctly.
