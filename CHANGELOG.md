# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-01-22

### Added

- **Extended Known Addresses Database (78 addresses)** - Comprehensive database of known Solana entities
  - 9 CEX hot wallets (Binance, Coinbase, Bybit, OKX, FTX)
  - 7 cross-chain bridges (Wormhole, deBridge, Mayan, Allbridge)
  - 15+ DEX protocols (Jupiter, Raydium, Orca, Meteora, Phoenix, Pump.fun)
  - Liquid staking protocols (Marinade, Jito, Blaze, Sanctum)
  - NFT marketplaces (Magic Eden, Tensor, Metaplex)
  - Lending protocols (Kamino, MarginFi, Solend)
  - 10 MEV infrastructure addresses (Jito tip accounts, BloXroute)
  - 9 core Solana programs
  - 5 major token mints (USDC, USDT, mSOL, JitoSOL, bSOL, stSOL, wSOL)

- **Community-Driven Database** - Moved `known-addresses.json` to repository root
  - Community can submit PRs to update addresses without waiting for package releases
  - Other tools can import the database directly
  - Separation of data (community-contributed) from code

- **New Label Types**
  - `mev` - MEV infrastructure (Jito tip accounts, etc.)
  - `token` - Token mints (stablecoins, LSTs)

- **Custom Heuristics Documentation** - Comprehensive guide for writing custom heuristics
  - PrivacySignal field reference table
  - Evidence field reference table
  - Complete ScanContext field documentation
  - Integration examples with built-in signals
  - Unit tests for custom heuristics

- **Enhanced Documentation**
  - Updated contributing guide for adding addresses
  - Clear database location and PR workflow
  - Type field reference with privacy impact ratings
  - Example PR descriptions

### Changed

- Database location: `packages/core/src/labels/known-addresses.json` → `known-addresses.json` (root)
- Build process: Core package now copies database from repository root
- CLI build: Now copies known-addresses.json from core package to dist
- Documentation: All references updated to point to new database location

### Fixed

- CLI no longer requires manual RPC endpoint (uses default QuickNode RPC)
- Removed stale compiled .js files from CLI src directory that caused old code to be bundled
- Custom heuristics integration now properly documented and tested

## [0.3.1] - 2026-01-19

### Added
- Memo Exposure heuristic with 3 signal types (PII exposure, descriptive content, general usage)
- Address Reuse heuristic with 3 signal types (high/moderate diversity, long-term usage)
- All heuristics now return arrays of signals for better specificity
- Enhanced mitigation suggestions for each signal type

### Changed
- Timing Patterns: Now detects burst patterns, regular intervals, and timezone patterns separately
- Balance Traceability: Identifies matching pairs, sequential similar amounts, and full balance movements
- Known Entity: Returns entity-specific signals (exchange, bridge, other) instead of generic

## [0.3.0] - 2026-01-15

### Added
- Initial public release
- 11 Solana-native privacy heuristics
- CLI tool for wallet, transaction, and program scanning
- Core library for programmatic access
- CI/CD tools for automated privacy testing
- Default QuickNode RPC endpoint (no configuration required)
- Known addresses database (15 addresses)

### Features
- **Solana-Specific Heuristics**
  - Fee payer reuse detection
  - Signer overlap analysis
  - Memo exposure scanning
  - Address reuse patterns

- **Behavioral Analysis**
  - Known entity interaction tracking
  - Counterparty reuse detection
  - Instruction fingerprinting
  - Token account lifecycle analysis
  - Timing pattern detection

- **Traditional Heuristics (Adapted)**
  - Amount reuse
  - Balance traceability

- **Output Formats**
  - Human-readable terminal output with colors
  - JSON output for programmatic use
  - File export support

- **CI/CD Integration**
  - GitHub Actions support
  - Custom privacy policy definitions
  - Vitest/Jest matchers

[0.4.0]: https://github.com/taylorferran/solana-privacy-scanner/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/taylorferran/solana-privacy-scanner/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/taylorferran/solana-privacy-scanner/releases/tag/v0.3.0
