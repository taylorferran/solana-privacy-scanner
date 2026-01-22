#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { analyze } from './analyzer.js';
import type { AnalyzerResult, Issue } from './types.js';
import { groupIssuesByFile } from './utils.js';
import * as path from 'path';

const program = new Command();

program
  .name('solana-privacy-analyzer')
  .description('Static code analyzer for Solana privacy vulnerabilities')
  .version('0.1.0');

program
  .command('scan')
  .description('Scan TypeScript/JavaScript files for privacy issues')
  .argument('<paths...>', 'Files or directories to scan')
  .option('--json', 'Output results as JSON')
  .option('--no-low', 'Exclude low severity issues')
  .option('--quiet', 'Only show summary')
  .action(async (paths: string[], options) => {
    try {
      console.log(chalk.blue('🔒 Running Solana Privacy Analyzer...\n'));

      const result = await analyze(paths, {
        includeLow: options.low
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        printResults(result, options.quiet);
      }

      // Exit with error code if critical or high issues found
      if (result.summary.critical > 0 || result.summary.high > 0) {
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('❌ Analysis failed:'), error);
      process.exit(1);
    }
  });

program.parse();

/**
 * Print formatted results to console
 */
function printResults(result: AnalyzerResult, quiet: boolean = false): void {
  const { issues, summary, filesAnalyzed } = result;

  // Summary
  console.log(chalk.bold('📊 Scan Summary\n'));
  console.log(`Files analyzed: ${filesAnalyzed}`);
  console.log(`Total issues: ${summary.total}\n`);

  if (summary.total === 0) {
    console.log(chalk.green('✅ No privacy issues detected!\n'));
    console.log('Your code follows privacy best practices.');
    return;
  }

  // Severity breakdown
  if (summary.critical > 0) {
    console.log(chalk.red(`  🔴 CRITICAL: ${summary.critical}`));
  }
  if (summary.high > 0) {
    console.log(chalk.yellow(`  🟡 HIGH: ${summary.high}`));
  }
  if (summary.medium > 0) {
    console.log(chalk.blue(`  🔵 MEDIUM: ${summary.medium}`));
  }
  if (summary.low > 0) {
    console.log(chalk.gray(`  ⚪ LOW: ${summary.low}`));
  }

  console.log('');

  if (quiet) {
    console.log('\nRun without --quiet to see detailed issues');
    return;
  }

  // Group issues by file
  const issuesByFile = groupIssuesByFile(issues);

  // Print detailed issues
  console.log(chalk.bold('📋 Detailed Issues\n'));

  for (const [file, fileIssues] of issuesByFile) {
    const relPath = path.relative(process.cwd(), file);
    console.log(chalk.bold(`📁 ${relPath}`));
    console.log('━'.repeat(process.stdout.columns || 80));

    fileIssues.forEach((issue, idx) => {
      printIssue(issue, idx + 1);
      if (idx < fileIssues.length - 1) {
        console.log('');
      }
    });

    console.log('');
  }

  // Recommendations
  if (summary.critical > 0 || summary.high > 0) {
    console.log(chalk.bold('💡 Recommendations\n'));
    console.log('Critical and high severity issues should be fixed before deployment.');
    console.log('Run with --json to get machine-readable output for CI/CD integration.\n');
  }
}

/**
 * Print a single issue with formatting
 */
function printIssue(issue: Issue, number: number): void {
  // Severity icon and color
  const severityDisplay = getSeverityDisplay(issue.severity);

  console.log(`${number}. ${severityDisplay} ${chalk.bold(issue.message)}`);
  console.log(`   ${chalk.gray(`Line ${issue.line}:${issue.column}`)}`);

  if (issue.identifier) {
    console.log(`   ${chalk.cyan(`Identifier: ${issue.identifier}`)}`);
  }

  if (issue.occurrences && issue.occurrences > 1) {
    console.log(`   ${chalk.cyan(`Occurrences: ${issue.occurrences}`)}`);
  }

  console.log(`   ${chalk.gray('Suggestion:')} ${issue.suggestion}`);

  if (issue.codeSnippet) {
    console.log('\n   Code:');
    const lines = issue.codeSnippet.split('\n');
    lines.forEach(line => {
      if (line.startsWith('>')) {
        console.log(`   ${chalk.yellow(line)}`);
      } else {
        console.log(`   ${chalk.gray(line)}`);
      }
    });
  }
}

/**
 * Get severity display with color and icon
 */
function getSeverityDisplay(severity: Issue['severity']): string {
  switch (severity) {
    case 'CRITICAL':
      return chalk.red('🔴 CRITICAL');
    case 'HIGH':
      return chalk.yellow('🟡 HIGH');
    case 'MEDIUM':
      return chalk.blue('🔵 MEDIUM');
    case 'LOW':
      return chalk.gray('⚪ LOW');
  }
}
