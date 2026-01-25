/**
 * explain-risk skill handler (simplified version)
 *
 * Provides brief explanations of privacy risks
 */

import type { SkillResult } from '../../src/types.js';

export interface ExplainRiskOptions {
  riskId?: string;
  list?: boolean;
  verbose?: boolean;
}

interface RiskBrief {
  id: string;
  name: string;
  severity: string;
  overview: string;
  why: string;
  fix: string[];
}

/**
 * Concise risk explanations (lightweight)
 */
const RISKS: Record<string, RiskBrief> = {
  'fee-payer-reuse': {
    id: 'fee-payer-reuse',
    name: 'Fee Payer Reuse',
    severity: 'CRITICAL',
    overview:
      'One wallet pays transaction fees for multiple different accounts, creating a cryptographic link between them.',
    why: 'This is the #1 privacy risk on Solana. When a single fee payer funds multiple accounts, it proves they are controlled by the same entity. This creates an on-chain graph linking all accounts together, enabling powerful deanonymization.',
    fix: [
      'Have each account pay its own fees',
      'If external fee payer needed, use one unique payer per user/account',
      'Rotate fee payers - don\'t reuse the same wallet',
      'Fund user wallets with small SOL amounts for fee independence',
    ],
  },

  'fee-payer-never-self': {
    id: 'fee-payer-never-self',
    name: 'Never Self-Pays Fees',
    severity: 'HIGH',
    overview:
      'Account never pays its own fees, always relying on external fee payers.',
    why: 'Reveals the account is funded and controlled by an external entity. Common for custodial wallets or gasless apps, but exposes the relationship between the account and its operator.',
    fix: [
      'Fund accounts with SOL so they can pay their own fees',
      'If offering gasless UX, clearly communicate privacy trade-off',
      'Use per-user fee payer delegation instead of shared payer',
    ],
  },

  'signer-overlap': {
    id: 'signer-overlap',
    name: 'Signer Overlap',
    severity: 'HIGH',
    overview:
      'Same combination of signers appears across multiple transactions, linking accounts.',
    why: 'Repeated signer patterns prove accounts are controlled by the same entities. Common with multi-sig wallets or automated systems that use the same authority keys.',
    fix: [
      'Rotate signer keys for different operations',
      'Use unique authority keys per account',
      'Avoid reusing the same multi-sig combination',
    ],
  },

  'memo-pii': {
    id: 'memo-pii',
    name: 'PII in Transaction Memos',
    severity: 'CRITICAL',
    overview:
      'Transaction memos contain personally identifiable information like emails, names, or phone numbers.',
    why: 'Memos are permanently stored on-chain and publicly visible. PII in memos directly links real-world identities to wallet addresses, completely destroying privacy.',
    fix: [
      'Never put PII in transaction memos',
      'Use reference IDs or hashes instead of names/emails',
      'Store sensitive data off-chain',
      'Validate memo content before sending transactions',
    ],
  },

  'address-reuse': {
    id: 'address-reuse',
    name: 'Address Reuse',
    severity: 'MEDIUM',
    overview: 'Same address used for multiple transactions instead of rotating.',
    why: 'Reusing addresses makes transaction history linkable and enables tracking of user behavior patterns over time.',
    fix: [
      'Generate new addresses for each transaction',
      'Implement address rotation policies',
      'Use HD wallets with derivation paths',
    ],
  },

  'known-entity-cex': {
    id: 'known-entity-cex',
    name: 'CEX Interaction',
    severity: 'HIGH',
    overview: 'Wallet directly interacts with centralized exchange addresses.',
    why: 'CEXs have KYC data. Transactions to/from CEX addresses link your wallet to your real identity, and CEXs can share this data with authorities or leak it.',
    fix: [
      'Use privacy-preserving intermediary wallets',
      'Avoid direct CEX ↔ personal wallet transfers',
      'Mix coins through decentralized protocols first',
    ],
  },

  'counterparty-reuse': {
    id: 'counterparty-reuse',
    name: 'Counterparty Reuse',
    severity: 'MEDIUM',
    overview:
      'Wallet repeatedly transacts with the same counterparty addresses.',
    why: 'Repeated interactions with the same addresses reveal relationships and behavioral patterns, making it easier to identify account ownership.',
    fix: [
      'Diversify counterparties when possible',
      'Use fresh addresses for different relationships',
      'Avoid creating obvious repeated patterns',
    ],
  },

  'instruction-fingerprint': {
    id: 'instruction-fingerprint',
    name: 'Instruction Fingerprinting',
    severity: 'MEDIUM',
    overview:
      'Unique program call patterns create a fingerprint that identifies the user.',
    why: 'Specific sequences of program calls can be as identifying as a signature. If you always use programs in the same order, it creates a trackable pattern.',
    fix: [
      'Vary the order of operations when possible',
      'Use common program call patterns',
      'Avoid creating unique transaction templates',
    ],
  },

  'token-account-lifecycle': {
    id: 'token-account-lifecycle',
    name: 'Token Account Lifecycle Tracking',
    severity: 'MEDIUM',
    overview:
      'Token account creation and closure events link accounts through rent refunds.',
    why: 'When closing token accounts, rent refunds go to a specified address. If the same address receives multiple refunds, it links all those token accounts together.',
    fix: [
      'Use different refund destinations for different accounts',
      'Rotate rent refund recipient addresses',
      'Be aware that account closure creates linkage',
    ],
  },

  'timing-patterns': {
    id: 'timing-patterns',
    name: 'Timing Patterns',
    severity: 'MEDIUM',
    overview: 'Transactions occur in predictable time patterns or bursts.',
    why: 'Behavioral timing patterns can identify users. Regular schedules, time zones, or burst patterns create unique fingerprints.',
    fix: [
      'Add random delays between transactions',
      'Avoid predictable schedules',
      'Batch unrelated transactions at different times',
    ],
  },

  'amount-reuse': {
    id: 'amount-reuse',
    name: 'Amount Reuse',
    severity: 'LOW',
    overview: 'Same transaction amounts used repeatedly.',
    why: 'While less critical on Solana than Bitcoin, repeated amounts can still help link transactions and identify behavioral patterns.',
    fix: [
      'Use random or varied amounts when possible',
      'Avoid round numbers',
      'Add small random variations to transfers',
    ],
  },

  'balance-traceability': {
    id: 'balance-traceability',
    name: 'Balance Traceability',
    severity: 'MEDIUM',
    overview:
      'Account balance changes create a traceable flow of funds between accounts.',
    why: 'Following balance changes across accounts can reveal ownership relationships and fund flows, especially when combined with other heuristics.',
    fix: [
      'Break transaction chains with mixing',
      'Use multiple intermediate accounts',
      'Vary timing and amounts to obscure flows',
    ],
  },
};

/**
 * Explain a privacy risk (exported for API use)
 */
export async function explainRisk(
  options: ExplainRiskOptions
): Promise<SkillResult> {
  const riskId = options.riskId;

  if (!riskId) {
    return {
      success: false,
      error: 'Risk ID required. Example: /explain-risk fee-payer-reuse',
    };
  }

  const risk = RISKS[riskId];

  if (!risk) {
    const availableRisks = Object.keys(RISKS).join(', ');
    return {
      success: false,
      error: `Unknown risk: ${riskId}. Available: ${availableRisks}`,
    };
  }

  // Format output (concise, 3 sections only)
  const output = `
# ${risk.name} (${risk.severity})

## Overview
${risk.overview}

## Why It Matters
${risk.why}

## How to Fix
${risk.fix.map((step) => `- ${step}`).join('\n')}

---
For code examples: /suggest-fix ${risk.id}
`.trim();

  return {
    success: true,
    message: output,
    data: {
      riskId: risk.id,
      severity: risk.severity,
    },
  };
}

/**
 * Skill handler (called by Claude Code)
 */
export async function handler(
  args: string[],
  options: ExplainRiskOptions
): Promise<SkillResult> {
  // Get risk ID from options or args
  const riskId = options.riskId || args[0];

  return explainRisk({ ...options, riskId });
}
