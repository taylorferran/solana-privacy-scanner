---
sidebar_position: 2
---

# Installation & Usage

## Installation

### As Dev Dependency (Recommended)

```bash
npm install --save-dev solana-privacy-analyzer
```

### Global Installation

```bash
npm install -g solana-privacy-analyzer
```

### Using npx (No Installation)

```bash
npx solana-privacy-analyzer scan src/
```

## Basic Usage

### Scan a Directory

```bash
npx solana-privacy-analyzer scan src/
```

### Scan Specific Files

```bash
npx solana-privacy-analyzer scan src/transfer.ts src/batch.ts
```

### Scan with Glob Patterns

```bash
npx solana-privacy-analyzer scan 'src/**/*.ts'
npx solana-privacy-analyzer scan 'src/transfers/*.{ts,js}'
```

## Command Options

### `--json`

Output results as JSON for programmatic parsing:

```bash
npx solana-privacy-analyzer scan src/ --json
```

Use this for CI/CD integration and automated processing.

### `--no-low`

Exclude low severity issues from results:

```bash
npx solana-privacy-analyzer scan src/ --no-low
```

Useful for focusing on critical and high-priority issues.

### `--quiet`

Show summary only, no detailed issues:

```bash
npx solana-privacy-analyzer scan src/ --quiet
```

Quick overview without verbose output.

## Programmatic API

Use the analyzer in your Node.js scripts:

### Basic Usage

```typescript
import { analyze } from 'solana-privacy-analyzer';

const result = await analyze(['src/**/*.ts']);

console.log(`Found ${result.summary.total} issues`);
console.log(`Critical: ${result.summary.critical}`);

for (const issue of result.issues) {
  console.log(`${issue.severity}: ${issue.message}`);
  console.log(`  File: ${issue.file}:${issue.line}`);
}
```

### With Options

```typescript
import { analyze } from 'solana-privacy-analyzer';

const result = await analyze(['src/**/*.ts'], {
  includeLow: false,  // Exclude low severity
});

// Check if critical issues exist
if (result.summary.critical > 0) {
  console.error('Critical privacy issues found!');
  process.exit(1);
}
```

### Custom Processing

```typescript
import {
  analyze,
  groupIssuesByFile,
  sortIssues
} from 'solana-privacy-analyzer';

const result = await analyze(['src/**/*.ts']);

// Group issues by file
const byFile = groupIssuesByFile(result.issues);

for (const [file, issues] of byFile) {
  console.log(`\n${file}:`);
  issues.forEach(issue => {
    console.log(`  - ${issue.message} (line ${issue.line})`);
  });
}
```

## Package Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "privacy:check": "solana-privacy-analyzer scan src/",
    "privacy:ci": "solana-privacy-analyzer scan src/ --json --no-low",
    "precommit": "solana-privacy-analyzer scan --staged",
    "test": "npm run privacy:check && vitest"
  }
}
```

Then run:

```bash
npm run privacy:check
```

## File Patterns

The analyzer automatically scans these file types:

- `.ts` - TypeScript
- `.tsx` - TypeScript with JSX
- `.js` - JavaScript
- `.jsx` - JavaScript with JSX

And automatically excludes:

- `node_modules/`
- `dist/`
- `build/`
- `.git/`

## Troubleshooting

### "No files found"

Make sure you're using quotes around glob patterns:

```bash
# ✅ Good
npx solana-privacy-analyzer scan 'src/**/*.ts'

# ❌ Bad (shell expands glob)
npx solana-privacy-analyzer scan src/**/*.ts
```

### "Parse error"

The analyzer requires valid TypeScript/JavaScript syntax:

```bash
# Check for syntax errors first
npx tsc --noEmit
```

### False Positives

Some patterns may be flagged incorrectly. If you believe an issue is a false positive:

1. Review the specific pattern
2. Consider if there's a better way to write the code
3. Report it as an issue on GitHub

## Next Steps

- [CI/CD Integration](./ci-cd) - Automate privacy checks
- [CLI Reference](./cli-reference) - Complete command documentation
- [Claude Code Plugin](../claude-plugin/overview) - AI-powered fixing
