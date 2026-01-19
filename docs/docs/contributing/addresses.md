# Contributing Known Addresses

We welcome community contributions to expand our database of known Solana addresses!

## What We're Looking For

We maintain a curated list of **publicly known** Solana addresses that help identify privacy risks when users interact with:

- **Centralized Exchanges (CEXs)** - Binance, Coinbase, Kraken, etc.
- **Bridges** - Wormhole, Allbridge, Portal, etc.
- **Major DEX Programs** - Jupiter, Orca, Raydium, etc.
- **NFT Marketplaces** - Magic Eden, Tensor, etc.
- **DeFi Protocols** - Marinade, Lido, Drift, etc.

## Guidelines

### DO Add

✅ **Publicly documented addresses** with verified sources  
✅ **Major protocols** with significant user activity  
✅ **Centralized services** that can link on-chain/off-chain identity  
✅ **Bridges** that connect to other blockchains  
✅ **Official program IDs** from protocol documentation

### DON'T Add

❌ Individual user wallets (even if famous)  
❌ Unverified addresses  
❌ Addresses without clear documentation  
❌ Personal addresses  
❌ Addresses for "doxxing" purposes

## How to Contribute

### 1. Find the Address

Ensure the address is:
- Publicly documented by the protocol/exchange
- Verifiable through official sources
- Currently active and relevant

### 2. Edit the JSON File

Add your entry to `packages/core/src/labels/known-addresses.json`:

```json
{
  "address": "YourAddressHere...",
  "name": "Protocol Name",
  "type": "exchange|bridge|protocol|program|mixer|other",
  "description": "Brief description of the address/protocol"
}
```

**Address Types:**
- `exchange` - Centralized exchanges (high privacy risk)
- `bridge` - Cross-chain bridges
- `protocol` - DeFi protocols, AMMs
- `program` - Program IDs
- `mixer` - Privacy protocols (if any)
- `other` - Other known entities

### 3. Provide Source Documentation

In your PR description, include:
- Official documentation link
- Block explorer link (Solscan/Solana Explorer)
- Why this address is important for privacy analysis

### 4. Submit Pull Request

1. Fork the repository
2. Create a branch: `git checkout -b add-protocol-name-address`
3. Add your address to `known-addresses.json`
4. Update `lastUpdated` field to current date
5. Commit: `git commit -m "Add [Protocol Name] address"`
6. Push and create PR

## Example Addition

```json
{
  "address": "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  "name": "Serum DEX v3",
  "type": "protocol",
  "description": "Serum decentralized exchange program"
}
```

**PR Description:**
```
Adding Serum DEX v3 program address

Source: https://docs.projectserum.com/
Explorer: https://solscan.io/account/9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin

This is a widely-used DEX program that's important to identify in privacy analysis.
```

## Quality Standards

- **Accuracy**: Double-check addresses (one character wrong = wrong address!)
- **Relevance**: Focus on high-impact, widely-used protocols
- **Documentation**: Always provide verifiable sources
- **Honesty**: Don't overclaim attribution or certainty

## Code of Conduct

This tool is for **privacy awareness**, not surveillance. Contributions should:
- Respect user privacy
- Focus on institutional/protocol addresses, not individuals
- Avoid enabling harassment or doxxing
- Maintain honest, accurate descriptions

Thank you for helping improve privacy awareness in the Solana ecosystem!
