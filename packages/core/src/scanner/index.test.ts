import { describe, it, expect } from 'vitest';
import type { ScanContext, Label } from '../types/index.js';
import { evaluateHeuristics, generateReport } from './index.js';

describe('Scanner - Report Generation', () => {
  describe('evaluateHeuristics', () => {
    it('should evaluate all heuristics and return signals', () => {
      const context: ScanContext = {
        target: 'test-wallet',
        targetType: 'wallet',
        transfers: [
          { from: 'test-wallet', to: 'wallet2', amount: 10, signature: 'sig1', blockTime: 1000 },
          { from: 'test-wallet', to: 'wallet2', amount: 10, signature: 'sig2', blockTime: 1100 },
          { from: 'test-wallet', to: 'wallet2', amount: 10, signature: 'sig3', blockTime: 1200 },
          { from: 'test-wallet', to: 'cex-wallet', amount: 100, signature: 'sig4', blockTime: 1300 },
        ],
        instructions: [],
        counterparties: new Set(['wallet2', 'cex-wallet']),
        labels: new Map<string, Label>([
          ['cex-wallet', { address: 'cex-wallet', name: 'Binance', type: 'exchange' }],
        ]),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 1300 },
        transactionCount: 4,
      };

      const signals = evaluateHeuristics(context);

      expect(signals).toBeDefined();
      expect(Array.isArray(signals)).toBe(true);
      expect(signals.length).toBeGreaterThan(0);
      
      // Should be sorted by severity (HIGH first)
      for (let i = 0; i < signals.length - 1; i++) {
        const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        expect(severityOrder[signals[i].severity]).toBeLessThanOrEqual(
          severityOrder[signals[i + 1].severity]
        );
      }

      console.log(`✓ Evaluated heuristics: ${signals.length} signals detected`);
      for (const signal of signals) {
        console.log(`  - [${signal.severity}] ${signal.name}`);
      }
    });

    it('should return empty array for clean wallet', () => {
      const context: ScanContext = {
        target: 'clean-wallet',
        targetType: 'wallet',
        transfers: [
          { from: 'clean-wallet', to: 'wallet1', amount: 1.234, signature: 'sig1', blockTime: 1000 },
          { from: 'clean-wallet', to: 'wallet2', amount: 5.678, signature: 'sig2', blockTime: 100000 },
        ],
        instructions: [],
        counterparties: new Set(['wallet1', 'wallet2']),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 100000 },
        transactionCount: 2,
      };

      const signals = evaluateHeuristics(context);

      expect(signals).toBeDefined();
      expect(signals.length).toBe(0);
      console.log('✓ Clean wallet detected: 0 risk signals');
    });
  });

  describe('generateReport', () => {
    it('should generate complete privacy report', () => {
      const context: ScanContext = {
        target: 'risky-wallet',
        targetType: 'wallet',
        transfers: [
          { from: 'risky-wallet', to: 'wallet2', amount: 10, signature: 'sig1', blockTime: 1000 },
          { from: 'risky-wallet', to: 'wallet2', amount: 10, signature: 'sig2', blockTime: 1100 },
          { from: 'risky-wallet', to: 'wallet2', amount: 10, signature: 'sig3', blockTime: 1200 },
          { from: 'risky-wallet', to: 'wallet2', amount: 10, signature: 'sig4', blockTime: 1300 },
          { from: 'risky-wallet', to: 'cex', amount: 100, signature: 'sig5', blockTime: 1400 },
        ],
        instructions: [],
        counterparties: new Set(['wallet2', 'cex']),
        labels: new Map<string, Label>([
          ['cex', { address: 'cex', name: 'Coinbase', type: 'exchange' }],
        ]),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 1400 },
        transactionCount: 5,
      };

      const report = generateReport(context);

      // Verify report structure
      expect(report.version).toBeDefined();
      expect(report.timestamp).toBeGreaterThan(0);
      expect(report.targetType).toBe('wallet');
      expect(report.target).toBe('risky-wallet');
      expect(report.overallRisk).toBeDefined();
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(report.overallRisk);
      
      expect(Array.isArray(report.signals)).toBe(true);
      expect(report.signals.length).toBeGreaterThan(0);
      
      expect(report.summary).toBeDefined();
      expect(report.summary.totalSignals).toBe(report.signals.length);
      expect(report.summary.transactionsAnalyzed).toBe(5);
      
      expect(Array.isArray(report.mitigations)).toBe(true);
      expect(report.mitigations.length).toBeGreaterThan(0);

      console.log(`\n✓ Generated privacy report:`);
      console.log(`  Overall Risk: ${report.overallRisk}`);
      console.log(`  Signals: ${report.summary.totalSignals} (${report.summary.highRiskSignals} HIGH, ${report.summary.mediumRiskSignals} MEDIUM, ${report.summary.lowRiskSignals} LOW)`);
      console.log(`  Mitigations: ${report.mitigations.length} recommendations`);
    });

    it('should generate LOW risk report for clean wallet', () => {
      const context: ScanContext = {
        target: 'clean-wallet',
        targetType: 'wallet',
        transfers: [
          { from: 'clean-wallet', to: 'wallet1', amount: 1.234, signature: 'sig1', blockTime: 1000 },
          { from: 'clean-wallet', to: 'wallet2', amount: 5.678, signature: 'sig2', blockTime: 100000 },
        ],
        instructions: [],
        counterparties: new Set(['wallet1', 'wallet2']),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 100000 },
        transactionCount: 2,
      };

      const report = generateReport(context);

      expect(report.overallRisk).toBe('LOW');
      expect(report.signals.length).toBe(0);
      expect(report.mitigations.length).toBeGreaterThan(0);
      
      console.log(`\n✓ Clean wallet report: ${report.overallRisk} risk, ${report.mitigations.length} general recommendations`);
    });

    it('should generate HIGH risk report for problematic wallet', () => {
      const now = Math.floor(Date.now() / 1000);
      
      const context: ScanContext = {
        target: 'problematic-wallet',
        targetType: 'wallet',
        transfers: Array(10).fill(null).map((_, i) => ({
          from: 'problematic-wallet',
          to: i < 7 ? 'repeated-counterparty' : `wallet${i}`,
          amount: 10, // Round numbers
          signature: `sig${i}`,
          blockTime: now + i * 30, // Burst (10 txs in 5 minutes)
        })),
        instructions: [],
        counterparties: new Set(['repeated-counterparty', 'wallet7', 'wallet8', 'wallet9']),
        labels: new Map<string, Label>([
          ['repeated-counterparty', { address: 'repeated-counterparty', name: 'Binance', type: 'exchange' }],
        ]),
        tokenAccounts: [],
        timeRange: { earliest: now, latest: now + 270 },
        transactionCount: 10,
      };

      const report = generateReport(context);

      expect(report.overallRisk).toBe('HIGH');
      expect(report.signals.length).toBeGreaterThan(2);
      expect(report.summary.highRiskSignals).toBeGreaterThan(0);
      
      console.log(`\n✓ Problematic wallet report: ${report.overallRisk} risk`);
      console.log(`  Detected signals:`);
      for (const signal of report.signals) {
        console.log(`    - [${signal.severity}] ${signal.name}`);
      }
    });

    it('should produce deterministic output', () => {
      const context: ScanContext = {
        target: 'test-wallet',
        targetType: 'wallet',
        transfers: [
          { from: 'test-wallet', to: 'wallet2', amount: 5, signature: 'sig1', blockTime: 1000 },
          { from: 'test-wallet', to: 'wallet2', amount: 5, signature: 'sig2', blockTime: 1100 },
          { from: 'test-wallet', to: 'wallet2', amount: 5, signature: 'sig3', blockTime: 1200 },
        ],
        instructions: [],
        counterparties: new Set(['wallet2']),
        labels: new Map(),
        tokenAccounts: [],
        timeRange: { earliest: 1000, latest: 1200 },
        transactionCount: 3,
      };

      const report1 = generateReport(context);
      const report2 = generateReport(context);

      // Same input should produce same risk level and signal count
      expect(report1.overallRisk).toBe(report2.overallRisk);
      expect(report1.signals.length).toBe(report2.signals.length);
      expect(report1.summary).toEqual(report2.summary);
      
      console.log('✓ Report generation is deterministic');
    });
  });
});
