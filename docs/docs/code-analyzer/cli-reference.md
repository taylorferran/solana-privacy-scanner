---
sidebar_position: 4
---

# CLI Reference

Complete command-line interface documentation for the Solana Privacy Analyzer.

## Commands

### `scan`

Analyze TypeScript/JavaScript files for privacy issues.

```bash
solana-privacy-analyzer scan <paths...> [options]
```

#### Arguments

- `<paths...>` - One or more files, directories, or glob patterns to scan

**Examples:**

```bash
# Single directory
solana-privacy-analyzer scan src/

# Multiple files
solana-privacy-analyzer scan src/transfer.ts src/batch.ts

# Glob patterns (use quotes!)
solana-privacy-analyzer scan 'src/**/*.ts'
solana-privacy-analyzer scan 'src/**/*.{ts,js}'
solana-privacy-analyzer scan 'src/transfers/*.ts'

# Multiple directories
solana-privacy-analyzer scan src/ lib/ utils/
```

#### Options

##### `--json`

Output results as JSON instead of human-readable format.

```bash
solana-privacy-analyzer scan src/ --json
```

**Use cases:**
- CI/CD pipelines
- Automated processing
- Integrations with other tools

**JSON Schema:**

```json
{
  "issues": [
    {
      "type": "fee-payer-reuse" | "memo-pii",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "file": "string",
      "line": number,
      "column": number,
      "message": "string",
      "suggestion": "string",
      "codeSnippet": "string",
      "identifier": "string (optional)",
      "occurrences": number (optional)
    }
  ],
  "summary": {
    "critical": number,
    "high": number,
    "medium": number,
    "low": number,
    "total": number
  },
  "filesAnalyzed": number,
  "timestamp": number
}
```

##### `--no-low`

Exclude low severity issues from output.

```bash
solana-privacy-analyzer scan src/ --no-low
```

**Use cases:**
- Focus on critical and high-priority issues
- Reduce noise in large codebases
- Pre-commit hooks where you only care about serious issues

##### `--quiet`

Show summary only, hide detailed issue listings.

```bash
solana-privacy-analyzer scan src/ --quiet
```

**Output example:**

```
🔒 Running Solana Privacy Analyzer...

📊 Scan Summary
Files analyzed: 12
Total issues: 5

  🔴 CRITICAL: 2
  🟡 HIGH: 1
  🔵 MEDIUM: 2
```

**Use cases:**
- Quick overview
- CI/CD summary logs
- Checking if any issues exist without seeing details

##### `--help`

Display help information.

```bash
solana-privacy-analyzer scan --help
```

##### `--version`

Show version number.

```bash
solana-privacy-analyzer --version
```

#### Combining Options

Options can be combined:

```bash
# JSON output without low severity issues
solana-privacy-analyzer scan src/ --json --no-low

# Quiet summary in JSON format
solana-privacy-analyzer scan src/ --quiet --json

# All filters combined
solana-privacy-analyzer scan 'src/**/*.ts' --json --no-low --quiet
```

## Exit Codes

The analyzer uses exit codes to indicate results:

| Exit Code | Meaning |
|-----------|---------|
| `0` | Success - No critical or high severity issues |
| `1` | Failure - Critical/high issues found OR analysis error |

**Examples:**

```bash
# Exit 0 - Safe to deploy
solana-privacy-analyzer scan src/
echo $?  # 0

# Exit 1 - Critical issues found
solana-privacy-analyzer scan src/
echo $?  # 1
```

**In CI/CD:**

```bash
#!/bin/bash
solana-privacy-analyzer scan src/ --json > report.json

if [ $? -ne 0 ]; then
  echo "❌ Privacy issues detected"
  exit 1
fi

echo "✅ Privacy check passed"
```

## File Matching

### Included File Types

The analyzer automatically scans:

- `.ts` - TypeScript files
- `.tsx` - TypeScript with JSX
- `.js` - JavaScript files
- `.jsx` - JavaScript with JSX

### Excluded Directories

Automatically skipped:

- `node_modules/`
- `dist/`
- `build/`
- `.git/`
- `coverage/`
- `.next/`
- `.cache/`

### Glob Pattern Rules

When using glob patterns, **always use quotes** to prevent shell expansion:

```bash
# ✅ Correct - Shell won't expand the glob
solana-privacy-analyzer scan 'src/**/*.ts'

# ❌ Wrong - Shell expands before passing to CLI
solana-privacy-analyzer scan src/**/*.ts
```

**Common patterns:**

```bash
# All TypeScript files in src/
'src/**/*.ts'

# Both TypeScript and JavaScript
'src/**/*.{ts,js}'

# Specific subdirectory
'src/transfers/**/*.ts'

# Multiple patterns (pass separately)
solana-privacy-analyzer scan 'src/**/*.ts' 'lib/**/*.ts'
```

## Output Formats

### Human-Readable (Default)

Colorized, formatted output for terminal viewing:

```
🔒 Running Solana Privacy Analyzer...

📊 Scan Summary
Files analyzed: 5
Total issues: 3

  🔴 CRITICAL: 2
  🔵 MEDIUM: 1

📋 Detailed Issues

📁 src/transfer.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer 'feePayer' declared outside loop
   Line 45:8
   Suggestion: Move fee payer generation inside the loop

   Code:
      43 |
      44 |   // Declared outside
   >  45 |   const feePayer = Keypair.generate();
      46 |
      47 |   for (let i = 0; i < recipients.length; i++) {
```

### JSON Output

Structured data for programmatic use:

```json
{
  "issues": [
    {
      "type": "fee-payer-reuse",
      "severity": "CRITICAL",
      "file": "src/transfer.ts",
      "line": 45,
      "column": 8,
      "message": "Fee payer 'feePayer' declared outside loop but reused inside",
      "suggestion": "Move fee payer generation inside the loop",
      "codeSnippet": "   const feePayer = Keypair.generate();",
      "identifier": "feePayer",
      "occurrences": 5
    }
  ],
  "summary": {
    "critical": 2,
    "high": 0,
    "medium": 1,
    "low": 0,
    "total": 3
  },
  "filesAnalyzed": 5,
  "timestamp": 1705881234567
}
```

## Environment Variables

### `NO_COLOR`

Disable colored output:

```bash
NO_COLOR=1 solana-privacy-analyzer scan src/
```

### `DEBUG`

Enable debug logging:

```bash
DEBUG=solana-privacy* solana-privacy-analyzer scan src/
```

## Common Workflows

### Quick Local Check

```bash
npx solana-privacy-analyzer scan src/
```

### Pre-Commit Hook

```bash
npx solana-privacy-analyzer scan --staged --no-low --quiet
```

### CI/CD Pipeline

```bash
npx solana-privacy-analyzer scan src/ --json --no-low > privacy-report.json
CRITICAL=$(jq '.summary.critical' privacy-report.json)
[ "$CRITICAL" -eq 0 ] || exit 1
```

### Development Script

Add to `package.json`:

```json
{
  "scripts": {
    "privacy": "solana-privacy-analyzer scan src/",
    "privacy:ci": "solana-privacy-analyzer scan src/ --json --no-low"
  }
}
```

Then run:

```bash
npm run privacy
```

## Troubleshooting

### "No files found"

**Problem:** The analyzer reports 0 files scanned.

**Solutions:**

1. Check your glob pattern uses quotes:
   ```bash
   # ✅ Correct
   solana-privacy-analyzer scan 'src/**/*.ts'

   # ❌ Wrong
   solana-privacy-analyzer scan src/**/*.ts
   ```

2. Verify files exist:
   ```bash
   ls src/**/*.ts
   ```

3. Use explicit file paths:
   ```bash
   solana-privacy-analyzer scan src/file1.ts src/file2.ts
   ```

### "Parse error"

**Problem:** Syntax error in TypeScript/JavaScript file.

**Solution:** Fix syntax errors first:

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for JavaScript errors
npx eslint src/
```

### "Command not found"

**Problem:** CLI not in PATH.

**Solutions:**

1. Use npx:
   ```bash
   npx solana-privacy-analyzer scan src/
   ```

2. Install globally:
   ```bash
   npm install -g solana-privacy-analyzer
   ```

3. Use npm script:
   ```json
   {
     "scripts": {
       "scan": "solana-privacy-analyzer scan src/"
     }
   }
   ```

### False Positives

If you believe an issue is incorrectly flagged:

1. Review the specific pattern and severity
2. Consider if there's a safer way to write the code
3. Report it on [GitHub Issues](https://github.com/taylorferran/solana-privacy-scanner/issues)

## Next Steps

- [CI/CD Integration](./ci-cd) - Automate privacy checks
- [Installation & Usage](./installation) - Setup guide
- [Claude Code Plugin](../claude-plugin/overview) - AI-powered fixing
