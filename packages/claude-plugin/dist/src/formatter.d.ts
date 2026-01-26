/**
 * Output formatting utilities for Claude Code plugin
 */
import type { AnalyzerResult, PrivacyReport, FormattedAnalysisResult, FormattedPrivacyReport, FormattedIssue, FormattedSignal } from './types.js';
/**
 * Format analyzer results for display in Claude Code
 */
export declare function formatAnalyzerResult(result: AnalyzerResult): FormattedAnalysisResult;
/**
 * Format privacy report for display in Claude Code
 */
export declare function formatPrivacyReport(report: PrivacyReport): FormattedPrivacyReport;
/**
 * Format issue for display with location
 */
export declare function formatIssueWithLocation(issue: FormattedIssue): string;
/**
 * Format signal for display
 */
export declare function formatSignalWithDetails(signal: FormattedSignal): string;
//# sourceMappingURL=formatter.d.ts.map