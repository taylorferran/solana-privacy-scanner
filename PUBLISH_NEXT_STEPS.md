# Publish Next Steps

This document outlines the changes needed to publish the next version of the scanner with the new top-level known-addresses database.

## Changes Made

### 1. Known Addresses Database → Top Level ✅

**Before:** `packages/core/src/labels/known-addresses.json` (bundled with package)
**After:** `known-addresses.json` (repository root)

**Why:**
- Community can update via PRs without package releases
- Other tools can import directly from repository
- Separation of data (community-contributed) from code
- More frequent updates without version bumps

### 2. Extended Address Database ✅

Added **100+ addresses** across:
- **CEXs**: Binance, Coinbase, Bybit, OKX, FTX (defunct)
- **Bridges**: Wormhole, deBridge, Allbridge, Mayan
- **DEXs**: Jupiter, Raydium, Orca, Meteora, Phoenix, Pump.fun
- **Liquid Staking**: Marinade, Jito, Blaze, Sanctum
- **NFT**: Magic Eden, Tensor, Metaplex
- **Lending**: Kamino, MarginFi, Solend
- **MEV**: Jito tip accounts, BloXroute
- **Core Programs**: All major Solana programs
- **Tokens**: USDC, USDT, mSOL, JitoSOL, bSOL, stSOL

### 3. Updated Build Process ✅

`packages/core/build.js` now copies from repository root:
```javascript
copyFileSync('../../known-addresses.json', 'dist/known-addresses.json');
```

### 4. Updated Documentation ✅

- `docs/docs/contributing/addresses.md` - Points to root location
- `CLAUDE.md` - Updated architecture notes
- Clear contribution guidelines

## Pre-Release Checklist

### Testing

- [ ] Run full test suite
  ```bash
  npm test -- --run
  ```

- [ ] Verify core package builds successfully
  ```bash
  cd packages/core
  npm run build
  ```

- [ ] Confirm `dist/known-addresses.json` exists after build
  ```bash
  ls -la packages/core/dist/known-addresses.json
  ```

- [ ] Test label provider loads new addresses
  ```bash
  cd examples
  npm run wallet  # Should detect new exchanges/protocols
  ```

- [ ] Verify CLI works with new database
  ```bash
  cd packages/cli
  npm run build
  node dist/index.js scan-wallet <BINANCE_ADDRESS>
  # Should label as "Binance Hot Wallet 2"
  ```

### Documentation

- [ ] Update CHANGELOG with new addresses count
- [ ] Update README with new database location
- [ ] Verify contributing docs are accurate
- [ ] Check all code examples still work

### Backward Compatibility

⚠️ **Breaking Change Assessment:**

**Impact**: NONE (backward compatible)
- Old packages will continue working (bundled JSON)
- New packages use root JSON
- Provider API unchanged
- Users don't need to change code

**No breaking changes** - this is a **MINOR** version bump.

## Version Bump

Current: `0.3.1`
Next: `0.4.0` (new features: extended database, new types)

### Update Versions

1. **Core package**
   ```bash
   cd packages/core
   # Edit package.json: "version": "0.4.0"
   ```

2. **CLI package** (depends on core)
   ```bash
   cd packages/cli
   # Edit package.json: "version": "0.4.0"
   # Update core dependency: "solana-privacy-scanner-core": "^0.4.0"
   ```

3. **CI tools package** (depends on core)
   ```bash
   cd packages/ci-tools
   # Edit package.json: "version": "0.4.0"
   # Update core dependency: "solana-privacy-scanner-core": "^0.4.0"
   ```

4. **Root package**
   ```bash
   # Edit package.json: "version": "0.4.0"
   ```

5. **Constants** (if exists)
   ```bash
   # Edit packages/core/src/constants.ts: VERSION = "0.4.0"
   ```

## Publish Steps

### 1. Build All Packages

```bash
npm run build
```

### 2. Run Tests

```bash
npm test -- --run
```

### 3. Publish Core Package

```bash
cd packages/core
npm publish
```

### 4. Publish CLI Package

```bash
cd packages/cli
npm install  # Gets latest core
npm run build
npm publish
```

### 5. Publish CI Tools Package

```bash
cd packages/ci-tools
npm install  # Gets latest core
npm run build
npm publish
```

### 6. Tag Release

```bash
git tag -a v0.4.0 -m "v0.4.0: Extended address database, top-level known-addresses.json"
git push origin v0.4.0
```

### 7. Create GitHub Release

- Go to: https://github.com/taylorferran/solana-privacy-scanner/releases/new
- Tag: `v0.4.0`
- Title: `v0.4.0: Extended Address Database`
- Description:

```markdown
## What's New

### Extended Address Database (100+ addresses)
- 9 CEX hot wallets (Binance, Coinbase, Bybit, OKX)
- 7 cross-chain bridges (Wormhole, deBridge, Mayan, Allbridge)
- 15+ DEX protocols (Jupiter, Raydium, Orca, Meteora, Phoenix)
- Liquid staking (Marinade, Jito, Blaze, Sanctum)
- NFT marketplaces (Magic Eden, Tensor, Metaplex)
- Lending protocols (Kamino, MarginFi, Solend)
- MEV infrastructure (Jito tip accounts, BloXroute)
- All core Solana programs
- Major token mints (USDC, USDT, LSTs)

### Community-Driven Database
- `known-addresses.json` moved to repository root
- PRs can update addresses without package releases
- Other tools can import database directly
- See [Contributing Addresses](https://taylorferran.github.io/solana-privacy-scanner/docs/contributing/addresses)

### New Label Types
- `mev` - MEV infrastructure
- `token` - Token mints

## Breaking Changes

None - fully backward compatible.

## Install

```bash
npm install solana-privacy-scanner
npm install solana-privacy-scanner-core@0.4.0
npm install solana-privacy-scanner-ci-tools@0.4.0
```
```

### 8. Update Documentation Site

```bash
npm run docs:build
npm run docs:deploy  # If auto-deploy not set up
```

## Post-Release

- [ ] Verify npm packages installed correctly
  ```bash
  npm install solana-privacy-scanner-core@0.4.0
  ```

- [ ] Test in fresh project
  ```bash
  mkdir test-install
  cd test-install
  npm init -y
  npm install solana-privacy-scanner
  # Test scan-wallet command
  ```

- [ ] Announce on:
  - [ ] GitHub discussions
  - [ ] Twitter/X
  - [ ] Discord (if applicable)

## Rollback Plan

If issues are discovered post-publish:

1. **Deprecate bad version**
   ```bash
   npm deprecate solana-privacy-scanner-core@0.4.0 "Use 0.3.1 - issues with database"
   ```

2. **Fix and republish as 0.4.1**
   - Fix issue
   - Bump to 0.4.1
   - Republish

3. **Or revert to 0.3.1**
   - Update packages to depend on `^0.3.1`
   - Republish with reverted changes

## Future Improvements

Consider for v0.5.0+:

1. **Separate database package**
   - `@solana-privacy-scanner/known-addresses`
   - Core imports from separate package
   - Community can publish updates independently

2. **Auto-update mechanism**
   - Fetch latest database from GitHub on runtime
   - Cache locally
   - Fall back to bundled version

3. **Community API**
   - REST API for address lookups
   - Submit addresses via web form
   - Automatic verification pipeline

## Questions?

Contact: taylor@example.com
Issues: https://github.com/taylorferran/solana-privacy-scanner/issues
