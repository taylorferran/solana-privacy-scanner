# Implementation Task Outline

This is intentionally linear. Do not skip steps.

---

## Phase 1 — Core scan engine (library-first)

- [x] 1. Create monorepo structure
  - [x] `packages/core`
  - [x] `packages/cli`
  - [x] `packages/server` (optional)
  - [x] `packages/web` (optional)

- [x] 2. Define core TypeScript types
  - [x] `PrivacyReport`
  - [x] `RiskSignal`
  - [x] `Evidence`
  - [x] `ScanOptions`
  - [x] `ScanContext`
  - [x] `Label`

- [x] 3. Implement RPC client wrapper
  - [x] Accept generic RPC URL (QuickNode-compatible)
  - [x] Centralize rate limiting + retries
  - [x] No CLI or UI logic here

- [x] 4. Implement raw data collection layer
  - [x] Wallet:
    - [x] fetch recent signatures (bounded)
    - [x] fetch transactions
    - [x] fetch token accounts
  - [x] Transaction:
    - [x] fetch full transaction + meta
  - [x] Program:
    - [x] limited program account scan or instruction-based analysis

- [x] 5. Normalize RPC data into internal facts
  - [x] Transfers (SOL + SPL)
  - [x] Amounts
  - [x] Counterparties
  - [x] Instruction categories
  - [x] Block times and deltas

- [x] 6. Implement heuristic evaluation functions
  - [x] One file per heuristic
  - [x] Input: `ScanContext`
  - [x] Output: `RiskSignal | null`
  - [x] No scoring magic; fixed thresholds

- [x] 7. Implement scoring + aggregation
  - [x] Combine signals into overall risk
  - [x] Deterministic ordering
  - [x] Stable output

- [x] 8. Produce final `PrivacyReport` JSON
  - [x] Versioned schema
  - [x] Serializable
  - [x] Used by all consumers

---

## Phase 2 — CLI wrapper

- [x] 9. Implement CLI command structure
  - [x] `scan wallet <address>`
  - [x] `scan tx <signature>`
  - [x] `scan program <programId>`

- [x] 10. Add CLI flags
  - [x] `--rpc`
  - [x] `--json`
  - [x] `--max-signatures`
  - [x] `--output`

- [x] 11. Implement human-readable formatter
  - [x] Clean, boring text output
  - [x] Mirrors report JSON exactly

- [x] 12. Ensure CLI is thin
  - [x] No heuristics
  - [x] No RPC logic
  - [x] Calls core only

---

## Phase 3 — Labeling support (minimal, honest)

- [x] 13. Define label provider interface
  - [x] `lookup(address) -> Label | null`

- [x] 14. Implement static JSON label provider
  - [x] Small curated list:
    - [x] Major CEX hot wallets
    - [x] Bridges
    - [x] Well-known program IDs

- [x] 15. Integrate label signals into heuristics
  - [x] Flag interaction
  - [x] Explain why it matters
  - [x] Do not overclaim attribution

---

## Phase 4 — Minimal web UI (education-focused)

- [ ] 16. Implement HTTP server wrapper
  - [ ] `POST /scan`
  - [ ] Accept target + options
  - [ ] Return `PrivacyReport`

- [ ] 17. Implement minimal frontend
  - [ ] Single page
  - [ ] Address input
  - [ ] Scan button
  - [ ] Results view

- [ ] 18. Render results as:
  - [ ] Overall exposure score
  - [ ] Evidence cards (signals)
  - [ ] "Why this matters" explanations
  - [ ] Mitigation guidance

- [ ] 19. Add educational copy
  - [ ] Wallets are not anonymous
  - [ ] Public activity is permanently linkable
  - [ ] Selective privacy reduces exposure

---

## Phase 5 — Packaging and delivery

- [ ] 20. Package core as npm library
  - [ ] ESM + CJS
  - [ ] Typed exports
  - [ ] No CLI assumptions

- [ ] 21. Package CLI as executable
  - [ ] `npx solana-privacy-scanner`
  - [ ] Reads from env or flags

- [ ] 22. Write README
  - [ ] What it is
  - [ ] What it is not
  - [ ] How surveillance works
  - [ ] CLI usage
  - [ ] Library usage

- [ ] 23. Add examples
  - [ ] CLI example
  - [ ] Library import example
  - [ ] JSON report example

---

## Phase 6 — Final sanity checks

- [ ] 24. Determinism test
  - [ ] Same input → same output

- [ ] 25. Performance caps
  - [ ] Signature limits enforced
  - [ ] RPC concurrency controlled

- [ ] 26. Language audit
  - [ ] No claims of deanonymization
  - [ ] Always framed as risk signals
