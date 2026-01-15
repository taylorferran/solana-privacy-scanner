# Quick Start - Testing the CLI

## Test the CLI is working:

```bash
# Check version
node packages/cli/dist/index.js --version

# Show help
node packages/cli/dist/index.js --help

# Show wallet command help
node packages/cli/dist/index.js wallet --help
```

## Run a real scan:

**Make sure your `.env.local` file has `SOLANA_RPC=<your-helius-url>`**

```bash
# Scan your test wallet (limit to 10 txs for speed)
node packages/cli/dist/index.js wallet CG2j5yV6XokVsDBgGdgxUSi6jSAq6oq8J83LPivwJwwb --max-signatures 10

# Get JSON output
node packages/cli/dist/index.js wallet zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE --max-signatures 10 --json

# Save to file
node packages/cli/dist/index.js wallet zPauEPCD25bLSvQT9gkZ3t2x563bMQz6J1buystRERE --max-signatures 10 --output report.txt
```

## Expected Output:

The CLI will show:
1. Scanning progress (on stderr)
2. Formatted privacy report (on stdout)
3. Color-coded severity levels
4. Evidence for each risk signal
5. Mitigation recommendations

## Full documentation:

See `CLI_USER_GUIDE.md` for complete usage instructions.
