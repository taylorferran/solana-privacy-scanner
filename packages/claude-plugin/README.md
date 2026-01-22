# Solana Privacy Scanner - Claude Code Plugin

AI-powered privacy analysis for Solana code. Automatically detects and helps fix privacy vulnerabilities in your TypeScript/JavaScript.

## What It Does

This Claude Code plugin:
- **Scans** your Solana code for privacy vulnerabilities
- **Explains** why issues matter and their impact
- **Fixes** problems automatically with your approval
- **Educates** you about Solana privacy best practices

## Installation

### Prerequisites

1. **Install Claude Code CLI** (if you haven't):
   ```bash
   npm install -g claude-code
   ```

2. **Install the analyzer tool**:
   ```bash
   cd your-solana-project
   npm install --save-dev solana-privacy-analyzer
   ```

### Load the Plugin

```bash
# Clone the repository (or download)
git clone https://github.com/taylorferran/solana-privacy-scanner
cd solana-privacy-scanner

# Load plugin in Claude Code
claude --plugin-dir packages/claude-plugin
```

## Usage

### Basic Scan

```
/solana-privacy-scan
```

Scans your current directory for privacy issues.

### Scan Specific Path

```
/solana-privacy-scan src/transfers/
```

### Example Session

```
You: /solana-privacy-scan src/

Claude: 🔒 Running privacy analyzer...

Found 2 critical issues in src/batch-transfer.ts:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 🔴 CRITICAL: Fee Payer Reused in Loop
   Line 45

   Current code:
   ```typescript
   const feePayer = Keypair.generate();  // ← Outside loop

   for (const recipient of recipients) {
     await sendTransaction(tx, [wallet, feePayer]);  // ← Reused
   }
   ```

   ⚠️  Privacy Impact:
   All transfers are linkable on-chain. Anyone can see they came
   from the same source.

   ✅ Fix:
   ```typescript
   for (const recipient of recipients) {
     const feePayer = Keypair.generate();  // ← Inside loop
     await sendTransaction(tx, [wallet, feePayer]);
   }
   ```

   Type 'fix 1' to apply automatically

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Privacy Score: 3/10 (High Risk)

Commands:
• 'fix all' - Apply all fixes
• 'fix 1' - Fix specific issue
• 'explain fee-payer' - Learn more

You: fix all

Claude: ✅ Applied fixes for issues #1, #2

Re-running scan...
✅ All critical issues resolved!

Your code now follows privacy best practices.
```

## What It Detects

### Fee Payer Reuse (CRITICAL)

**Problem**: Same fee payer used across multiple transactions

**Impact**: Creates linkable transaction graph - complete privacy compromise

**Example**:
```typescript
// ❌ BAD
const feePayer = Keypair.generate();
for (const r of recipients) {
  await send(tx, [wallet, feePayer]);  // Linked!
}

// ✅ GOOD
for (const r of recipients) {
  await send(tx, [wallet, Keypair.generate()]);  // Unique
}
```

### PII in Memos (CRITICAL/HIGH)

**Problem**: Personal information in transaction memos

**Impact**: Permanently public and searchable on-chain

**Example**:
```typescript
// ❌ BAD
createMemoInstruction("Payment to john@example.com")

// ✅ GOOD
createMemoInstruction("Payment")  // Generic
```

## Commands

| Command | Description |
|---------|-------------|
| `/solana-privacy-scan` | Scan current directory |
| `/solana-privacy-scan [path]` | Scan specific path |
| `fix all` | Apply all automatic fixes |
| `fix 1,2,3` | Fix specific issues |
| `explain [type]` | Learn about vulnerability type |

## How It Works

```
┌─────────────────────────────────────┐
│  1. You run /solana-privacy-scan    │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│  2. Plugin runs static analyzer     │
│     (solana-privacy-analyzer)       │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│  3. Claude parses JSON results      │
│     and formats for you             │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│  4. You review issues and ask       │
│     Claude to fix them              │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│  5. Claude applies fixes using      │
│     Edit tool + re-runs scan        │
└─────────────────────────────────────┘
```

## Architecture

**Two-tier system:**

1. **Static Analyzer** (`solana-privacy-analyzer`)
   - Deterministic pattern detection
   - AST parsing for accurate results
   - Fast (<5 seconds for typical projects)

2. **AI Orchestrator** (Claude Code Skill)
   - Runs analyzer
   - Presents results clearly
   - Applies intelligent fixes
   - Provides educational context

## Benefits

### ✅ Reliable

Uses deterministic static analysis - no false negatives on supported patterns.

### ✅ Fast

Typical scan completes in <5 seconds.

### ✅ Educational

Claude explains WHY issues matter and helps you learn.

### ✅ Safe

All fixes require your approval before being applied.

### ✅ Integrated

Works directly in your development workflow via Claude Code.

## Limitations

- Only analyzes code patterns (not runtime behavior)
- Requires valid TypeScript/JavaScript syntax
- Focused on two main vulnerability types (more coming)
- Cannot analyze deployed on-chain transactions (use the main scanner for that)

## Troubleshooting

### "Analyzer not found"

Install it in your project:
```bash
npm install --save-dev solana-privacy-analyzer
```

### "No issues found" but you expect some

1. Check file patterns match (`.ts`, `.js`, `.tsx`, `.jsx`)
2. Ensure code has actual Solana imports (`@solana/web3.js`)
3. Try scanning specific files to debug

### Plugin not loading

```bash
# Verify plugin directory structure
ls packages/claude-plugin/.claude-plugin/plugin.json

# Check Claude Code can see it
claude --plugin-dir packages/claude-plugin --list-plugins
```

## Development

Want to extend the plugin?

**Add new detectors:**
1. Add detector to `packages/code-analyzer/src/detectors/`
2. Update analyzer to run it
3. Update skill SKILL.md with new issue type
4. Test and rebuild

**Improve fix logic:**
1. Edit `skills/solana-privacy-scan/SKILL.md`
2. Update fix instructions for your use case
3. Test with sample code

## Examples

See `skills/solana-privacy-scan/examples/` for:
- `bad-code.ts` - Privacy-violating patterns
- `good-code.ts` - Privacy-safe patterns

## Related Tools

- **[solana-privacy-scanner-core](https://www.npmjs.com/package/solana-privacy-scanner-core)** - On-chain analysis
- **[solana-privacy-analyzer](https://www.npmjs.com/package/solana-privacy-analyzer)** - Static analyzer (this plugin uses it)
- **[Documentation](https://sps.guide)** - Full guides and API reference

## License

MIT

## Support

- [Documentation](https://sps.guide)
- [GitHub Issues](https://github.com/taylorferran/solana-privacy-scanner/issues)
- [Example Repo](https://github.com/taylorferran/solana-privacy-scanner-example)

## Contributing

We welcome contributions! To add new detectors or improve the plugin:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a PR

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

---

**Made with ❤️ for the Solana privacy community**
