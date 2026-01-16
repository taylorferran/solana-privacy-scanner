# Changelog

All notable changes to the Solana Privacy Scanner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
| 0.1.4 | 2026-01-16 | ✅ Current | Bug fixes + comprehensive testing |
| 0.1.3 | 2026-01-16 | ⚠️ Skipped | Internal only |
| 0.1.2 | 2026-01-15 | ✅ Stable | Documentation + Web UI |
| 0.1.1 | 2026-01-15 | ✅ Stable | CLI fixes |
| 0.1.0 | 2026-01-15 | ✅ Stable | Initial release |

---

## Contributing

If you'd like to contribute to the Solana Privacy Scanner, please:

1. Check the [Contributing Guide](/contributing/development)
2. Review [open issues](https://github.com/taylorferran/solana-privacy-scanner/issues)
3. Submit PRs with test coverage for new features
4. Add entries to this changelog for your changes

---

## Links

- **[Documentation](https://taylorferran.github.io/solana-privacy-scanner)**
- **[GitHub Repository](https://github.com/taylorferran/solana-privacy-scanner)**
- **[npm - Core Package](https://www.npmjs.com/package/solana-privacy-scanner-core)**
- **[npm - CLI Package](https://www.npmjs.com/package/solana-privacy-scanner)**
