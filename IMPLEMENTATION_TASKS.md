# Implementation Task Outline

This is intentionally linear. Do not skip steps.

---

## Phase 1 — Core scan engine (library-first)

1. Create monorepo structure

   * `packages/core`
   * `packages/cli`
   * `packages/server` (optional)
   * `packages/web` (optional)

2. Define core TypeScript types

   * `PrivacyReport`
   * `RiskSignal`
   * `Evidence`
   * `ScanOptions`
   * `ScanContext`
   * `Label`

3. Implement RPC client wrapper

   * Accept generic RPC URL (QuickNode-compatible)
   * Centralize rate limiting + retries
   * No CLI or UI logic here

4. Implement raw data collection layer

   * Wallet:

     * fetch recent signatures (bounded)
     * fetch transactions
     * fetch token accounts
   * Transaction:

     * fetch full transaction + meta
   * Program:

     * limited program account scan or instruction-based analysis

5. Normalize RPC data into internal facts

   * Transfers (SOL + SPL)
   * Amounts
   * Counterparties
   * Instruction categories
   * Block times and deltas

6. Implement heuristic evaluation functions

   * One file per heuristic
   * Input: `ScanContext`
   * Output: `RiskSignal | null`
   * No scoring magic; fixed thresholds

7. Implement scoring + aggregation

   * Combine signals into overall risk
   * Deterministic ordering
   * Stable output

8. Produce final `PrivacyReport` JSON

   * Versioned schema
   * Serializable
   * Used by all consumers

---

## Phase 2 — CLI wrapper

9. Implement CLI command structure

   * `scan wallet <address>`
   * `scan tx <signature>`
   * `scan program <programId>`

10. Add CLI flags

* `--rpc`
* `--json`
* `--max-signatures`
* `--output`

11. Implement human-readable formatter

* Clean, boring text output
* Mirrors report JSON exactly

12. Ensure CLI is thin

* No heuristics
* No RPC logic
* Calls core only

---

## Phase 3 — Labeling support (minimal, honest)

13. Define label provider interface

* `lookup(address) -> Label | null`

14. Implement static JSON label provider

* Small curated list:

  * Major CEX hot wallets
  * Bridges
  * Well-known program IDs

15. Integrate label signals into heuristics

* Flag interaction
* Explain why it matters
* Do not overclaim attribution

---

## Phase 4 — Minimal web UI (education-focused)

16. Implement HTTP server wrapper

* `POST /scan`
* Accept target + options
* Return `PrivacyReport`

17. Implement minimal frontend

* Single page
* Address input
* Scan button
* Results view

18. Render results as:

* Overall exposure score
* Evidence cards (signals)
* "Why this matters" explanations
* Mitigation guidance

19. Add educational copy

* Wallets are not anonymous
* Public activity is permanently linkable
* Selective privacy reduces exposure

---

## Phase 5 — Packaging and delivery

20. Package core as npm library

* ESM + CJS
* Typed exports
* No CLI assumptions

21. Package CLI as executable

* `npx solana-privacy-scanner`
* Reads from env or flags

22. Write README

* What it is
* What it is not
* How surveillance works
* CLI usage
* Library usage

23. Add examples

* CLI example
* Library import example
* JSON report example

---

## Phase 6 — Final sanity checks

24. Determinism test

* Same input → same output

25. Performance caps

* Signature limits enforced
* RPC concurrency controlled

26. Language audit

* No claims of deanonymization
* Always framed as risk signals
