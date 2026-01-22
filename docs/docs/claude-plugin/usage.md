---
sidebar_position: 3
---

# Usage Guide

Learn how to use the `/solana-privacy-scan` skill in Claude Code.

## Basic Usage

### Scan Current Directory

```
/solana-privacy-scan
```

Scans all TypeScript/JavaScript files in the current working directory.

### Scan Specific Directory

```
/solana-privacy-scan src/
```

Scans all files in the `src/` directory.

### Scan Specific File

```
/solana-privacy-scan src/transfer.ts
```

Scans a single file.

### Scan Multiple Paths

```
/solana-privacy-scan src/ lib/ utils/
```

Scans multiple directories.

## What Happens

When you invoke `/solana-privacy-scan`, Claude:

1. **Runs the Analyzer**
   - Executes `npx solana-privacy-analyzer scan [path] --json`
   - Gets structured results with all issues

2. **Parses Results**
   - Reads the JSON output
   - Categorizes issues by severity
   - Groups by file

3. **Reports Findings**
   - Shows summary (files scanned, issue counts)
   - Lists each issue with:
     - Severity level (CRITICAL, HIGH, MEDIUM, LOW)
     - File path and line number
     - Detailed explanation
     - Code snippet
     - Fix suggestion

4. **Offers to Fix**
   - For each issue, Claude can:
     - Explain why it's a problem
     - Show the privacy impact
     - Propose a fix
     - Apply the fix with your approval

## Interactive Workflow

### Typical Session

```
You: /solana-privacy-scan src/

Claude: I found 3 privacy issues in your code:

📁 src/batch-transfer.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer 'feePayer' declared outside loop
   Line 15:8

   This fee payer is generated once but reused across all transactions
   in the loop. This makes all transactions linkable on-chain.

   Would you like me to fix this?

You: Yes, please fix it

Claude: I'll move the fee payer generation inside the loop...
        [Shows diff of proposed changes]

        Shall I apply this fix?

You: Yes

Claude: ✅ Fixed! The fee payer is now generated uniquely for each transaction.
```

### Reviewing Fixes

Claude always shows you:

- **What's wrong** - Clear explanation of the privacy issue
- **Why it matters** - Real-world impact on privacy
- **Proposed fix** - Exact code changes
- **Trade-offs** - Any performance or cost implications

You decide whether to accept the fix.

## Output Format

### Summary

Claude starts with a high-level summary:

```
🔒 Privacy Scan Results

Files analyzed: 5
Total issues: 3

  🔴 CRITICAL: 2
  🔵 MEDIUM: 1
```

### Issue Details

For each issue, Claude provides:

```
📁 src/transfer.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🔴 CRITICAL Fee payer reuse detected
   Line 45:8

   The fee payer 'feePayer' is declared outside the loop but used
   inside, making all 10 transactions linkable on-chain.

   Code:
      43 |
      44 |   // Declared outside
   >  45 |   const feePayer = Keypair.generate();
      46 |
      47 |   for (let i = 0; i < recipients.length; i++) {

   Impact: Complete loss of transaction privacy
   Fix: Move fee payer generation inside the loop
```

### Clean Results

If no issues found:

```
✅ No privacy issues detected!

All 12 files passed privacy checks.
```

## Common Scenarios

### Before Committing Code

Run a quick scan before committing:

```
/solana-privacy-scan
```

Fix any issues Claude finds, then commit with confidence.

### During Code Review

When reviewing a pull request:

```
/solana-privacy-scan src/new-feature.ts
```

Check that new code doesn't introduce privacy issues.

### Learning Mode

Scan example code to understand privacy patterns:

```
/solana-privacy-scan examples/
```

Ask Claude to explain why certain patterns are problematic:

```
You: Why is reusing fee payers bad?

Claude: When you reuse the same fee payer across multiple transactions...
        [detailed explanation with examples]
```

### Refactoring for Privacy

When improving existing code:

```
/solana-privacy-scan src/legacy/
```

Get a comprehensive list of all privacy issues, then work through them systematically.

### Checking Dependencies

Scan third-party code or examples:

```
/solana-privacy-scan node_modules/some-library/
```

Verify that dependencies don't have privacy issues.

## Working with Results

### Filtering by Severity

Ask Claude to focus on critical issues:

```
You: /solana-privacy-scan src/

Claude: [Shows all issues]

You: Let's focus on just the CRITICAL issues first

Claude: I'll address the 2 CRITICAL issues...
```

### Batch Fixing

Fix all issues at once:

```
You: /solana-privacy-scan src/

Claude: [Shows 5 issues]

You: Fix all of these

Claude: I'll fix all 5 issues. Here are the changes...
```

### Selective Fixing

Choose which issues to fix:

```
You: Fix issues 1 and 3, but leave 2 for now

Claude: I'll fix the fee payer reuse (issue 1) and the memo PII (issue 3)...
```

## Advanced Usage

### Understanding Context

Claude can explain issues in context:

```
You: Why is issue #2 flagged as CRITICAL?

Claude: Issue #2 is CRITICAL because it exposes an email address in
        a transaction memo. This email will be:

        1. Permanently stored on-chain
        2. Indexed by block explorers
        3. Searchable forever
        4. Linkable to the wallet address

        Anyone can see that wallet abc123... belongs to user@example.com.
```

### Performance Trade-offs

Discuss privacy vs. performance:

```
You: Will generating a new fee payer for each transaction make it slower?

Claude: Yes, there's a small performance impact:

        - Each Keypair.generate() takes ~1ms
        - For 100 transactions, that's +100ms total

        However, the privacy benefit is significant. Alternative
        approaches that maintain privacy include...
```

### Custom Patterns

Ask about code not flagged:

```
You: Is this pattern safe? [paste code]

Claude: Let me analyze that...

        While not flagged by the analyzer, this pattern could leak
        privacy because...
```

## Best Practices

### 1. Scan Early and Often

Run scans during development, not just before deployment:

```
/solana-privacy-scan
```

Catch issues while they're easy to fix.

### 2. Understand, Don't Just Fix

Ask Claude to explain issues:

```
You: Why is this a problem?
You: What's the privacy impact?
You: Are there alternative approaches?
```

Learn privacy patterns to avoid issues in future code.

### 3. Review All Fixes

Always review Claude's proposed changes:

- Check the diff
- Understand what changed
- Verify functionality is preserved
- Test after applying

### 4. Combine with Testing

After Claude fixes issues, run your tests:

```bash
npm test
```

Ensure privacy fixes didn't break functionality.

### 5. Use with CI/CD

Use the plugin during development, CLI in CI/CD:

- **Plugin**: Interactive development and fixing
- **CLI**: Automated checks in pipelines

## Limitations

### Detection Coverage

The analyzer detects specific patterns:

- ✅ Fee payer reuse in loops
- ✅ PII in memos
- ❌ Complex privacy patterns (not yet implemented)
- ❌ Custom/novel patterns

For undetected patterns, ask Claude for manual review.

### Static Analysis Only

The analyzer can't detect:

- Runtime behavior
- External API calls that leak data
- Network-level privacy issues

Use the analyzer as one layer of privacy defense.

### Context Boundaries

Claude sees your code but may not know:

- Your deployment environment
- Your threat model
- Your specific privacy requirements

Provide context when needed:

```
You: We're deploying to mainnet with strict privacy requirements

Claude: Given mainnet deployment, I'd recommend...
```

## Troubleshooting

### "No issues found" but I know there are issues

**Possible causes:**

1. **Pattern not yet detected:**
   - Analyzer currently detects fee payer reuse and memo PII
   - Other patterns coming soon

2. **Code pattern variation:**
   - Ask Claude to manually review

3. **File not scanned:**
   - Check file extension is `.ts`, `.tsx`, `.js`, or `.jsx`

### Scan is slow

**Solutions:**

1. **Scan specific directories:**
   ```
   /solana-privacy-scan src/
   ```

2. **Skip node_modules:**
   - Automatically excluded, but check path doesn't include it

3. **Scan specific files:**
   ```
   /solana-privacy-scan src/transfer.ts
   ```

### False positives

If an issue is incorrectly flagged:

1. Ask Claude to review:
   ```
   You: Is issue #2 really a problem? The variable is actually scoped correctly.
   ```

2. Report on [GitHub](https://github.com/taylorferran/solana-privacy-scanner/issues)

## Next Steps

- [Examples](./examples) - See real-world usage
- [Code Analyzer CLI](../code-analyzer/overview) - Use standalone
- [CI/CD Integration](../code-analyzer/ci-cd) - Automate checks
