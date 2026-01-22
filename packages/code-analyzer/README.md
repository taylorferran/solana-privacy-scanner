# Solana Privacy Analyzer

Static code analyzer for detecting privacy vulnerabilities in Solana TypeScript/JavaScript code.

## Installation

```bash
npm install --save-dev solana-privacy-analyzer
```

## Usage

### CLI

```bash
# Scan all TypeScript files in src/
npx solana-privacy-analyzer scan 'src/**/*.ts'

# Scan specific files
npx solana-privacy-analyzer scan src/transfer.ts src/batch.ts

# Output as JSON for CI/CD
npx solana-privacy-analyzer scan src/ --json

# Exclude low severity issues
npx solana-privacy-analyzer scan src/ --no-low

# Quiet mode (summary only)
npx solana-privacy-analyzer scan src/ --quiet
```

### Programmatic API

```typescript
import { analyze } from 'solana-privacy-analyzer';

const result = await analyze(['src/**/*.ts'], {
  includeLow: false  // Exclude low severity issues
});

console.log(`Found ${result.summary.total} issues`);
console.log(`Critical: ${result.summary.critical}`);

for (const issue of result.issues) {
  console.log(`${issue.severity}: ${issue.message} at ${issue.file}:${issue.line}`);
}
```

## What It Detects

### Fee Payer Reuse (CRITICAL)

Detects when a fee payer is declared outside a loop and reused across multiple transactions:

**Bad:**
```typescript
const feePayer = Keypair.generate();
for (const recipient of recipients) {
  await sendTransaction(tx, [wallet, feePayer]);  // REUSED - linkable
}
```

**Good:**
```typescript
for (const recipient of recipients) {
  const feePayer = Keypair.generate();  // Unique per transaction
  await sendTransaction(tx, [wallet, feePayer]);
}
```

### PII in Memos (CRITICAL/HIGH/MEDIUM)

Detects personally identifiable information in transaction memos:

- **CRITICAL**: Emails, phone numbers, SSNs, credit cards
- **HIGH**: Personal names, URLs with sensitive params
- **MEDIUM**: Descriptive content that may reveal identity

**Bad:**
```typescript
createMemoInstruction("Payment to john@example.com")  // Email exposed
createMemoInstruction("User: John Smith")             // Name exposed
```

**Good:**
```typescript
createMemoInstruction("Payment")  // Generic
// Or omit memo entirely
```

## Output Format

### Human-Readable (Default)

```
🔒 Running Solana Privacy Analyzer...

📊 Scan Summary
Files analyzed: 5
Total issues: 3

  🔴 CRITICAL: 2
  🔵 MEDIUM: 1

📋 Detailed Issues

📁 src/transfer.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer 'feePayer' declared outside loop but reused inside
   Line 45:8
   Suggestion: Move fee payer generation inside the loop
   ...
```

### JSON (for CI/CD)

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
  "timestamp": 1234567890
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Privacy Check

on: [pull_request]

jobs:
  privacy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx solana-privacy-analyzer scan src/ --json > report.json
      - name: Check for critical issues
        run: |
          CRITICAL=$(jq '.summary.critical' report.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "❌ Found $CRITICAL critical privacy issues"
            jq '.issues' report.json
            exit 1
          fi
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running privacy scan..."
npx solana-privacy-analyzer scan --staged --no-low

if [ $? -ne 0 ]; then
  echo "❌ Privacy issues detected. Fix before committing."
  exit 1
fi
```

## Exit Codes

- `0` - No critical or high severity issues
- `1` - Critical or high severity issues found or analysis failed

## Configuration

No configuration file needed. The analyzer uses sensible defaults:

- Scans: `**/*.ts`, `**/*.tsx`, `**/*.js`, `**/*.jsx`
- Excludes: `node_modules/`, `dist/`, `build/`, `.git/`

## How It Works

1. **AST Parsing**: Uses TypeScript ESTree to parse code into an abstract syntax tree
2. **Pattern Detection**: Traverses AST looking for problematic patterns
3. **Issue Reporting**: Generates detailed reports with line numbers and suggestions

## Limitations

- Only analyzes static code patterns (not runtime behavior)
- Requires valid TypeScript/JavaScript syntax
- May have false positives for complex code patterns
- Does not analyze on-chain data (use `solana-privacy-scanner-core` for that)

## Related Tools

- **[solana-privacy-scanner-core](https://www.npmjs.com/package/solana-privacy-scanner-core)** - On-chain wallet analysis
- **[solana-privacy-scanner](https://www.npmjs.com/package/solana-privacy-scanner)** - CLI for on-chain scanning
- **[Claude Code Plugin](../claude-plugin/)** - AI-assisted privacy fixing

## License

MIT

## Contributing

Issues and PRs welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Support

- [Documentation](https://sps.guide)
- [GitHub Issues](https://github.com/taylorferran/solana-privacy-scanner/issues)
