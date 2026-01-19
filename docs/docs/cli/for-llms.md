# For LLMs - CLI Usage

Copy the text below and paste it into your AI coding assistant (Claude, Cursor, ChatGPT, etc.) to get help using the Solana Privacy Scanner CLI.

---

## Prompt for AI Assistants

```
I want to use the Solana Privacy Scanner CLI tool.

PACKAGE: solana-privacy-scanner
VERSION: 0.3.0
DOCUMENTATION: https://sps.guide/cli/quickstart

WHAT IT DOES:
Command-line tool for scanning Solana wallets, transactions, and programs for privacy risks. Provides formatted terminal output with risk assessments, detected signals, and mitigation recommendations.

INSTALLATION:
npm install -g solana-privacy-scanner

INFRASTRUCTURE:
- Uses QuickNode RPC endpoint by default
- No API keys or configuration needed
- Works immediately after installation

AVAILABLE COMMANDS:

1. scan-wallet <ADDRESS>
   Analyze a wallet's transaction history
   
   Options:
   --max-signatures <number>  - Limit number of transactions (default: 100)
   --include-tokens          - Include token account analysis
   --json                    - Output raw JSON report
   --output <file>           - Save report to file
   
   Examples:
   solana-privacy-scanner scan-wallet 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
   solana-privacy-scanner scan-wallet ADDRESS --max-signatures 50
   solana-privacy-scanner scan-wallet ADDRESS --json --output report.json

2. scan-transaction <SIGNATURE>
   Analyze a single transaction
   
   Options:
   --json                    - Output raw JSON report
   --output <file>           - Save report to file
   
   Examples:
   solana-privacy-scanner scan-transaction 5wHu1q...
   solana-privacy-scanner scan-transaction SIG --json --output tx-report.json

3. scan-program <PROGRAM_ID>
   Analyze a program's interactions
   
   Options:
   --max-transactions <number> - Limit transactions analyzed (default: 100)
   --json                      - Output raw JSON report
   --output <file>             - Save report to file
   
   Examples:
   solana-privacy-scanner scan-program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
   solana-privacy-scanner scan-program PROGRAM --max-transactions 50

OUTPUT FORMAT (Terminal):
┌─────────────────────────────────────────────────┐
│ PRIVACY ANALYSIS REPORT                         │
├─────────────────────────────────────────────────┤
│ Address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZR... │
│ Transactions Analyzed: 42                       │
│ Overall Risk: MEDIUM                            │
│ Privacy Score: 65/100                           │
└─────────────────────────────────────────────────┘

DETECTED SIGNALS (2):
  🔴 HIGH: Fee Payer Reuse
     Multiple accounts funded by same fee payer
     → Use separate fee payers for unrelated accounts

  🟡 MEDIUM: Counterparty Reuse
     Repeated interactions with 3 addresses
     → Use multiple wallets or intermediaries

KNOWN ENTITIES (1):
  • Binance Hot Wallet (exchange)
    Address: D8cy77...
    Risk: Direct CEX link

RECOMMENDATIONS:
  • Use separate fee payers for different activities
  • Avoid reusing the same counterparties
  • Consider using privacy-focused protocols
  • Split funds across multiple wallets

JSON OUTPUT FORMAT:
{
  "overallRisk": "MEDIUM",
  "summary": {
    "transactionsAnalyzed": 42,
    "privacyScore": 65,
    "riskBreakdown": { "HIGH": 1, "MEDIUM": 1, "LOW": 0 }
  },
  "signals": [
    {
      "name": "Fee Payer Reuse",
      "severity": "HIGH",
      "reason": "Multiple accounts funded by same fee payer",
      "mitigation": "Use separate fee payers for unrelated accounts",
      "evidence": [...],
      "confidence": 95
    }
  ],
  "knownEntities": [...],
  "mitigations": [...]
}

COMMON WORKFLOWS:

1. Quick Wallet Check:
   solana-privacy-scanner scan-wallet ADDRESS

2. Export Report for Analysis:
   solana-privacy-scanner scan-wallet ADDRESS --json --output report.json

3. Batch Analysis Script:
   for addr in $(cat wallets.txt); do
     solana-privacy-scanner scan-wallet $addr --json --output "reports/$addr.json"
   done

4. CI/CD Integration:
   solana-privacy-scanner scan-wallet $TEST_WALLET --json | jq '.overallRisk'

5. Filter High-Risk Only:
   solana-privacy-scanner scan-wallet ADDRESS --json | \
     jq '.signals[] | select(.severity == "HIGH")'

INTERPRETING RESULTS:

Risk Levels:
- LOW: Good privacy practices, minimal exposure
- MEDIUM: Some privacy leaks, improvement recommended
- HIGH: Significant privacy risks, action needed

Signal Severity:
- CRITICAL: Fee payer reuse (strongest linkage)
- HIGH: Signer overlap, known entity interaction
- MEDIUM: Counterparty reuse, instruction fingerprinting, token lifecycle
- LOW: Timing patterns, amount reuse, balance traceability

Privacy Score:
- 80-100: Excellent privacy hygiene
- 60-79: Acceptable with some risks
- 40-59: Moderate privacy exposure
- 0-39: Poor privacy, significant risks

ERROR HANDLING:
- Invalid addresses: "Error: Invalid Solana address"
- Network issues: Retries with exponential backoff
- No transactions: Returns LOW risk with note
- RPC failures: Graceful degradation with warnings

ADVANCED USAGE:

1. Compare Two Wallets:
   diff <(solana-privacy-scanner scan-wallet ADDR1 --json) \
        <(solana-privacy-scanner scan-wallet ADDR2 --json)

2. Track Privacy Over Time:
   solana-privacy-scanner scan-wallet ADDRESS --json --output "reports/$(date +%Y%m%d).json"

3. Alert on High Risk:
   RISK=$(solana-privacy-scanner scan-wallet ADDRESS --json | jq -r '.overallRisk')
   if [ "$RISK" = "HIGH" ]; then
     echo "High risk detected!" | mail -s "Privacy Alert" admin@example.com
   fi

4. Integration with jq:
   # Get all HIGH severity signals
   solana-privacy-scanner scan-wallet ADDRESS --json | \
     jq '.signals[] | select(.severity == "HIGH") | .name'
   
   # Count known entities
   solana-privacy-scanner scan-wallet ADDRESS --json | \
     jq '.knownEntities | length'
   
   # Get privacy score
   solana-privacy-scanner scan-wallet ADDRESS --json | \
     jq '.summary.privacyScore'

SHELL ALIASES (add to .bashrc or .zshrc):
alias spw='solana-privacy-scanner scan-wallet'
alias spt='solana-privacy-scanner scan-transaction'
alias spp='solana-privacy-scanner scan-program'
alias spwj='solana-privacy-scanner scan-wallet --json'

TIPS:
- Use --max-signatures for faster scans of active wallets
- JSON output is ideal for automation and integration
- Terminal output is colorized and human-readable
- All reports are deterministic (same input = same output)
- No data is sent to external servers (all analysis local)

MY USE CASE:
[Describe what you want to do - e.g., "Scan multiple wallets and export results", "Integrate into deployment scripts", "Build automated alerts", etc.]

WHAT I NEED HELP WITH:
[Describe specifically what you need - e.g., "Create a bash script to scan 100 wallets", "Parse JSON output to create a CSV", "Set up automated weekly scans", etc.]
```

---

## Example Prompts for Specific Use Cases

### For Automated Scanning

```
Using the solana-privacy-scanner CLI, help me create a bash script that:
1. Reads wallet addresses from wallets.txt (one per line)
2. Scans each wallet
3. Saves JSON reports to a reports/ directory
4. Creates a summary CSV with: address, risk_level, signals_count, privacy_score
5. Sends an email alert if any wallet has HIGH risk
```

### For CI/CD Integration

```
Using the solana-privacy-scanner CLI, help me integrate privacy checks into my GitHub Actions workflow. I want to:
1. Scan my test wallet after deployment
2. Fail the build if risk is HIGH
3. Upload the JSON report as an artifact
4. Post a summary comment on the PR
```

### For Data Analysis

```
Using the solana-privacy-scanner CLI, I've scanned 500 wallets and have JSON reports in a directory. Help me write a script that:
1. Loads all JSON reports
2. Calculates average privacy score
3. Groups wallets by risk level
4. Identifies the most common signals
5. Exports findings to a report
```

### For Monitoring

```
Using the solana-privacy-scanner CLI, help me set up a cron job that:
1. Scans my organization's wallets daily
2. Tracks privacy score trends over time
3. Alerts if any wallet's risk level increases
4. Generates a weekly summary report
```

---

## Quick Reference

### Install
```bash
npm install -g solana-privacy-scanner
```

### Basic Commands
```bash
# Scan wallet
solana-privacy-scanner scan-wallet ADDRESS

# Scan transaction
solana-privacy-scanner scan-transaction SIGNATURE

# Scan program
solana-privacy-scanner scan-program PROGRAM_ID

# Get JSON output
solana-privacy-scanner scan-wallet ADDRESS --json

# Save to file
solana-privacy-scanner scan-wallet ADDRESS --output report.json
```

### Parse JSON with jq
```bash
# Get risk level
solana-privacy-scanner scan-wallet ADDRESS --json | jq '.overallRisk'

# List signals
solana-privacy-scanner scan-wallet ADDRESS --json | jq '.signals[].name'

# Get privacy score
solana-privacy-scanner scan-wallet ADDRESS --json | jq '.summary.privacyScore'
```

### Links
- **Full Documentation:** https://sps.guide/cli/quickstart
- **Examples:** https://sps.guide/cli/examples
- **npm Package:** https://www.npmjs.com/package/solana-privacy-scanner
- **GitHub:** https://github.com/taylorferran/solana-privacy-scanner
