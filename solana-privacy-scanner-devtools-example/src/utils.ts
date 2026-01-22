/**
 * Utility functions for privacy-preserving operations
 */

import { Keypair } from '@solana/web3.js';
import { randomUUID } from 'crypto';

/**
 * Generate a unique fee payer for each transaction
 * This prevents transaction linkability via fee payer analysis
 */
export function generateFeePayer(): Keypair {
  return Keypair.generate();
}

/**
 * Create a safe, opaque reference ID for memos
 * Uses UUID to avoid leaking any user information
 */
export function generateSafeReference(): string {
  return `ref:${randomUUID()}`;
}

/**
 * Validate that a memo doesn't contain PII
 * Returns true if memo is safe, false if it contains sensitive data
 */
export function isMemoSafe(memo: string): boolean {
  // Email pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (emailPattern.test(memo)) {
    return false;
  }

  // Phone pattern (simple check)
  const phonePattern = /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  if (phonePattern.test(memo)) {
    return false;
  }

  // Names (very simple heuristic)
  const namePattern = /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/;
  if (namePattern.test(memo)) {
    return false;
  }

  return true;
}

/**
 * Create a privacy-safe memo
 * Replaces any potential PII with generic placeholders
 */
export function createSafeMemo(reference?: string): string {
  if (!reference) {
    return 'Payment';
  }

  // If reference looks like a UUID or hash, use it
  if (/^[a-f0-9-]{36}$/.test(reference) || /^[a-f0-9]{64}$/.test(reference)) {
    return `ref:${reference}`;
  }

  // Otherwise, generate a new safe reference
  return generateSafeReference();
}
