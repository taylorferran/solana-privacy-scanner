# Changelog

All notable changes to the Solana Privacy Scanner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.1] - 2026-01-20

### Added

**New Heuristics**
- `memo-exposure` - Detects PII and sensitive information in transaction memos (3 signal types: PII exposure, descriptive content, general memo usage)
- `address-reuse` - Analyzes wallet address diversity across counterparties (3 signal types: high/moderate diversity, long-term usage)

**Enhanced Heuristics**
- `timing-patterns` - Now returns multiple signals for different patterns (burst patterns, regular intervals, timezone patterns)
- `balance-traceability` - Returns multiple signals (matching pairs, sequential similar amounts, full balance movements)
- `known-entity` - Returns entity-specific signals (exchange, bridge, other) instead of generic interaction

### Changed

- All heuristics now return `PrivacySignal[]` arrays for consistency and better granularity
- Removed Ethereum mentions from `amount-reuse` heuristic
- Scanner updated to handle array returns from all heuristics
- Improved mitigation suggestions for new signal types

### Fixed

- Test expectations updated for new array return types
- All 40 tests passing

---

## [0.3.0 / CI Tools 0.1.0] - 2026-01-19

### 🎉 New Package: CI/CD Tools

Introducing `solana-privacy-scanner-ci-tools` - integrate privacy analysis directly into your development workflow!

#### Added

**Transaction Simulator**
- `simulateTransactionPrivacy()` - Analyze transactions before sending to mainnet
- `simulateTransactionFlow()` - Analyze multi-transaction user flows
- `compareImplementations()` - Compare privacy of different approaches
- Detects emergent patterns across transaction sequences

**Testing Matchers**
- Custom Vitest/Jest matchers for privacy assertions:
  - `toHavePrivacyRisk(level)` - Assert risk level
  - `toNotLeakUserRelationships()` - Verify no counterparty/signer linkage
  - `toHaveNoHighRiskSignals()` - No HIGH severity signals
  - `toNotHaveSignal(type)` - Specific signal not present
  - `toHavePrivacyScore(min)` - Minimum privacy score
  - Plus 6 more specialized matchers

**Configuration System**
- `.privacyrc` file for project-level privacy policies
- JSON schema validation with helpful error messages
- Environment-specific configurations
- Threshold settings (maxHighSeverity, maxMediumSeverity, etc.)

**GitHub Actions Integration**
- Pre-built workflow templates
- Automated privacy checks on PRs
- PR comments with scan results
- Configurable fail conditions

**Pre-commit Hooks**
- Catch privacy issues before committing
- Fast local validation
- Skip hooks when needed

**Docker Support**
- Containerized CLI for any CI/CD platform
- Alpine-based lightweight image
- GitLab CI, CircleCI, Jenkins compatible

**Setup Wizard**
- Interactive `npx privacy-scanner-init` command
- Generates `.privacyrc` configuration
- Installs integrations (GitHub Actions, hooks, testing)
- Guided setup with sensible defaults

#### Infrastructure

**Default RPC Endpoint**
- All packages now include a default QuickNode RPC endpoint
- No configuration required to get started
- Removed `--rpc` requirement from CLI
- Library works without explicit RPC initialization

**Documentation Updates**
- New CI/CD Tools section with guides:
  - [Overview](https://sps.guide/ci-tools/overview) - Quick start and features
  - [Testing Guide](https://sps.guide/ci-tools/testing) - Complete testing examples
  - [GitHub Actions](https://sps.guide/ci-tools/github-actions) - CI/CD setup
- Updated all docs to mention QuickNode partnership
- Added infrastructure acknowledgments

**Website Improvements**
- Updated favicon to detective emoji (🕵️)
- Added QuickNode mention in footer and scanner UI
- Better SEO images and metadata
- CI/CD Tools added to packages table

### Version Bumps

- `solana-privacy-scanner-core`: `0.2.0` → `0.3.0`
- `solana-privacy-scanner` (CLI): `0.2.0` → `0.3.0`
- `solana-privacy-scanner-ci-tools`: NEW package at `0.1.0`

### Example Usage

```typescript
// Test privacy in your test suite
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';
import 'solana-privacy-scanner-ci-tools/matchers';

test('transfer maintains privacy', async () => {
  const tx = await createTransfer(user, recipient, amount);
  const report = await simulateTransactionPrivacy(tx, connection);
  
  expect(report).toHavePrivacyRisk('LOW');
  expect(report).toNotLeakUserRelationships();
});
```

### Links

- **[CI Tools npm Package](https://www.npmjs.com/package/solana-privacy-scanner-ci-tools)**
- **[CI Tools Documentation](https://sps.guide/ci-tools/overview)**
- **[GitHub Repository](https://github.com/taylorferran/solana-privacy-scanner)**

---

## [0.2.0] - 2026-01-19

### 🚀 Major Release: Solana-Native Privacy Model

This release represents a **complete overhaul** of the privacy analysis model to be truly Solana-native, addressing feedback that the original heuristics were "Ethereum-biased" and missing critical Solana-specific privacy leaks.

### Added

#### New Solana-Specific Heuristics

1. **Fee Payer Reuse** (CRITICAL)
   - Tracks fee payer addresses across transactions
   - Detects single wallet paying fees for multiple "unrelated" accounts
   - This is one of the strongest deanonymization vectors on Solana

2. **Signer Overlap** (HIGH)
   - Identifies when the same signer appears across many transactions
   - Detects signers signing for different accounts
   - Provides cryptographic evidence for linking activities

3. **Instruction Fingerprinting** (MEDIUM)
   - Detects unique instruction layouts and patterns
   - Identifies repeated program interaction strategies
   - Can fingerprint bots and automated systems

4. **Token Account Lifecycle** (MEDIUM)
   - Tracks frequent token account creation/closure
   - Flags rent refunds flowing back to the same wallet
   - Links "burner" accounts back to primary wallets

#### Enhanced Data Collection

- New `ScanContext` fields: `feePayers`, `signers`, `transactionMetadata`, `tokenAccountEvents`, `pdaInteractions`, `programs`
- Enhanced normalizer extracts:
  - Transaction metadata (fee payers, signers, memos, program IDs)
  - Token account creation/closure events with rent refunds
  - Program Derived Address (PDA) interactions
  - Complete account involvement tracking

### Changed

#### Heuristic Reprioritization

Heuristics are now ranked by **real-world Solana deanonymization power**:

1. Fee Payer Reuse (was not present)
2. Signer Overlap (was not present)
3. Known Entity Interaction
4. Counterparty Reuse (enhanced)
5. Instruction Fingerprinting (new)
6. Token Account Lifecycle (new)
7. Timing Patterns
8. Amount Reuse (downgraded)
9. Balance Traceability (contextualized)

#### Enhanced Existing Heuristics

- **Counterparty Reuse**: Now detects program-mediated reuse (PDAs, vault accounts) in addition to direct transfers
- **Amount Reuse**: Downgraded severity for Solana context, now only strong when combined with other signals
- **Balance Traceability**: Updated conceptual understanding for Solana's account-based model

#### Breaking Changes

- Heuristics now return `PrivacySignal[]` (arrays) instead of `RiskSignal | null`
- New required fields in `ScanContext` for Solana-specific analysis
- Enhanced `PrivacySignal` type with optional `category` field
- `Evidence` type now has optional `type` and `data` fields

### Fixed

- Added defensive programming for backwards compatibility
- All heuristics now gracefully handle missing Solana-specific data
- Enhanced error handling in `extractTransactionMetadata` for malformed transactions
- Improved null/undefined safety throughout the codebase

### Testing

- ✅ All 36 tests passing
- Updated test expectations to match new array return format
- Enhanced test fixtures to meet new heuristic thresholds
- Full backwards compatibility maintained

### Documentation

- Completely rewritten heuristics documentation with Solana-specific context
- Updated library usage guide with new API patterns
- Added "What's New in v0.2.0" section
- Detailed explanations of each new heuristic's methodology and mitigation strategies

### Performance

- No performance degradation despite additional data extraction
- Maintained efficient processing for large transaction histories

---

## [0.1.4] - 2026-01-16

### Added
- Comprehensive test suite with 36 tests covering all major functionality
- Test coverage for edge cases (undefined, null, empty arrays, malformed data)
- Mock RPC client utilities for unit testing
- Tests for data collectors with RPC failure scenarios
- Tests for data normalizers with undefined/null handling
- Better defensive programming throughout the codebase

### Fixed
- **Critical**: Fixed `normalizeProgramData` crashing when `relatedTransactions` is undefined
- **Critical**: Fixed `normalizeWalletData` crashing when `transactions` is undefined
- Fixed `normalizeTransactionData` incorrectly counting null transactions as 1 instead of 0
- Fixed program scan example using wrong property name (`transactions` → `relatedTransactions`)
- Added try/catch blocks to all collector functions for graceful RPC failure handling
- Fixed RPC client to trim whitespace from URLs, preventing "Endpoint URL must start with `http:` or `https:`" errors

### Changed
- All collector functions now catch and log RPC errors instead of throwing
- Normalizer functions now safely handle undefined/null arrays with fallback to empty arrays
- Improved error messages throughout the codebase
- Updated documentation with v0.1.4 references and testing guide

### Testing
- 36 tests passing across 4 test suites
- Full coverage of normalizers, collectors, heuristics, and scanner
- All examples verified working (wallet, transaction, program)

---

## [0.1.3] - 2026-01-16

### Changed
- Internal refactoring (not published due to immediate bug fixes)

---

## [0.1.2] - 2026-01-15

### Added
- Initial comprehensive documentation with VitePress
- Interactive web UI scanner on homepage
- Known entity labeling system with 15+ addresses
- Example code for wallet, transaction, and program scanning

### Fixed
- RPC client to accept both string URLs and config objects
- Various CLI output formatting issues

---

## [0.1.1] - 2026-01-15

### Fixed
- CLI shebang issues causing syntax errors
- Buffer compatibility in CLI for Node.js environments

---

## [0.1.0] - 2026-01-15

### Added
- Initial release
- Core scanning engine
- CLI wrapper
- Five privacy heuristics:
  - Counterparty Reuse
  - Amount Reuse
  - Timing Patterns
  - Known Entity Interaction
  - Balance Traceability
- Support for wallet, transaction, and program scanning
- RPC client with rate limiting and retry logic
- JSON report generation
- TypeScript support

---

## Future Releases

### Planned Features
- Additional heuristics (Dust attacks, Round amounts, Self-transfers)
- Enhanced label database with community contributions
- Performance optimizations for large wallets
- Historical trend analysis
- Comparative privacy scoring
- Privacy improvement recommendations engine

---

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.2.0 | 2026-01-19 | ✅ Current | Solana-native privacy model |
| 0.1.4 | 2026-01-16 | ✅ Stable | Bug fixes + comprehensive testing |
| 0.1.3 | 2026-01-16 | ⚠️ Skipped | Internal only |
| 0.1.2 | 2026-01-15 | ✅ Stable | Documentation + Web UI |
| 0.1.1 | 2026-01-15 | ✅ Stable | CLI fixes |
| 0.1.0 | 2026-01-15 | ✅ Stable | Initial release |

---

## Contributing

If you'd like to contribute to the Solana Privacy Scanner, please:

1. Check the [Contributing Guide](/docs/contributing/development)
2. Review [open issues](https://github.com/taylorferran/solana-privacy-scanner/issues)
3. Submit PRs with test coverage for new features
4. Add entries to this changelog for your changes

---

## Links

- **[Documentation](https://taylorferran.github.io/solana-privacy-scanner)**
- **[GitHub Repository](https://github.com/taylorferran/solana-privacy-scanner)**
- **[npm - Core Package](https://www.npmjs.com/package/solana-privacy-scanner-core)**
- **[npm - CLI Package](https://www.npmjs.com/package/solana-privacy-scanner)**
