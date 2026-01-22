/**
 * Static Analyzer Integration Tests
 * These tests verify that the static analyzer correctly identifies privacy issues in source code
 */

import { describe, it, expect } from 'vitest';
import { analyzeCode } from 'solana-privacy-devtools/analyzer';

describe('Static Analyzer', () => {
  it('should find no issues in current implementation', async () => {
    // Analyze the current source code
    const result = await analyzeCode(['src/**/*.ts']);

    // Current implementation should be privacy-safe
    expect(result.issues).toHaveLength(0);
    expect(result.summary.totalIssues).toBe(0);
    expect(result.summary.criticalIssues).toBe(0);
    expect(result.summary.highIssues).toBe(0);
  });

  it('should analyze TypeScript files', async () => {
    const result = await analyzeCode(['src/transfer.ts']);

    // Should successfully analyze the file
    expect(result.summary.filesScanned).toBeGreaterThan(0);
  });

  it('should analyze all source files', async () => {
    const result = await analyzeCode(['src/**/*.ts']);

    // Should scan both transfer.ts and utils.ts
    expect(result.summary.filesScanned).toBeGreaterThanOrEqual(2);
  });
});
