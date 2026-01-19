# Known Entities Database

The scanner maintains a curated database of known Solana addresses to identify privacy-relevant interactions.

## Current Database (15 Addresses)

### Centralized Exchanges (4)

Interactions with CEXs create **HIGH privacy risk** because:
- They link on-chain addresses to real-world identities through KYC
- They collect IP addresses, device fingerprints, and behavior data
- They can be compelled to share data with authorities

| Name | Address | Risk Level |
|------|---------|------------|
| Binance Hot Wallet | `5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9` | HIGH |
| FTX Hot Wallet (defunct) | `2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S` | HIGH |
| Bybit Hot Wallet | `H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS` | HIGH |
| Coinbase Custody | `9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM` | HIGH |

### Cross-Chain Bridges (3)

Bridge interactions create **MEDIUM privacy risk** because:
- They link activity across multiple blockchains
- They reveal cross-chain transaction patterns
- Some bridges collect additional metadata

| Name | Address | Description |
|------|---------|-------------|
| Wormhole Token Bridge | `wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb` | Cross-chain bridge |
| Wormhole NFT Bridge | `WnFt12ZrnzZrFZkt2xsNsaNWoQribnuQ5B5FrDbwDhD` | NFT cross-chain bridge |
| Allbridge | `BBnraYq3M9GqTWDH5ZZ4H8hW8q3wMnRqmqo9AJZLfrdx` | Multi-chain bridge |

### DeFi Protocols (3)

Protocol interactions are **informational** - they reveal usage patterns but don't directly link identities:

| Name | Address | Description |
|------|---------|-------------|
| Jupiter Aggregator v6 | `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4` | DEX aggregator |
| Orca Whirlpools | `whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc` | Concentrated liquidity DEX |
| Raydium AMM v4 | `675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8` | Automated market maker |

### NFT & Core Programs (5)

These are system-level programs that appear in most transactions:

| Name | Address | Type |
|------|---------|------|
| Metaplex Token Metadata | `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s` | NFT metadata |
| Magic Eden v2 | `M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K` | NFT marketplace |
| SPL Token Program | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` | Core program |
| Associated Token Account | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` | Core program |
| System Program | `11111111111111111111111111111111` | Core program |

## How Known Entities Are Used

### 1. Detection

When you scan a wallet, the scanner:
1. Loads the known entities database
2. Checks all transaction counterparties against the database
3. Matches any addresses that appear

### 2. Reporting

Known entities appear in two places:

**"KNOWN ENTITIES DETECTED" Section:**
```
KNOWN ENTITIES DETECTED
───────────────────────────────────────────────────────────────

Exchanges:
  • Binance Hot Wallet
    Binance centralized exchange hot wallet

DeFi Protocols:
  • Jupiter Aggregator v6
    Jupiter DEX aggregator program
```

**"Known Entity Interaction" Risk Signal** (if transfers occurred):
```
1. Known Entity Interaction [HIGH]

   Evidence:
   • 3 interaction(s) with Binance Hot Wallet (exchange)
   • 1 interaction(s) with Wormhole Token Bridge (bridge)
```

## Why We Track These

### Exchanges: Identity Linkage

When you deposit/withdraw from a CEX:
- They know your real identity (KYC)
- They can see your deposit address
- **Result**: Your on-chain address is linked to your real-world identity

### Bridges: Cross-Chain Tracking

When you use a bridge:
- Both source and destination chains see the transaction
- Pattern analysis can link your addresses across chains
- **Result**: Your activity on multiple blockchains can be correlated

### Protocols: Usage Patterns

When you interact with labeled protocols:
- Reveals your DeFi/NFT usage patterns
- Can create behavioral fingerprints
- **Result**: Helps build a profile of your on-chain activity

## Privacy Levels

| Entity Type | Privacy Risk | Reason |
|-------------|--------------|---------|
| CEX | **HIGH** | Direct identity linkage via KYC |
| Bridge | **MEDIUM** | Cross-chain tracking, some metadata |
| Protocol | **LOW-INFO** | Usage patterns only, no direct identity link |
| Core Programs | **NONE** | Universal, appears in almost all transactions |

## Community Growth

The database starts small (15 addresses) but is designed to grow through community contributions.

**Want to add an address?** See [Contributing Addresses](/docs/contributing/addresses)

## Limitations

::: warning Important Limitations
- **Not exhaustive**: Only tracks a curated subset of addresses
- **Static**: No real-time updates from on-chain registries (yet)
- **Focused**: Prioritizes privacy-relevant entities, not comprehensive coverage
- **Conservative**: Better to miss some entities than include unverified ones
:::

## Future Enhancements

Potential improvements:
- API-based label providers (on-chain registries)
- User-provided custom label files
- Automatic address discovery via on-chain data
- Confidence scores for label accuracy
