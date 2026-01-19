# GitHub Actions

Automate privacy checks on every PR.

## Quick Setup

```bash
npx privacy-scanner-init
```

Select "GitHub Actions" to create `.github/workflows/privacy-check.yml`.

## Basic Workflow

```yaml
name: Privacy Check
on: [pull_request]

jobs:
  privacy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test  # Includes privacy matchers
```

## Scan Test Wallet

```yaml
- name: Scan Test Wallet
  run: |
    npm install -g solana-privacy-scanner
    solana-privacy-scanner scan-wallet ${{ secrets.TEST_WALLET }} \
      --json --output privacy-report.json

- name: Upload Report
  uses: actions/upload-artifact@v3
  with:
    name: privacy-report
    path: privacy-report.json
```

## Fail on High Risk

```yaml
- name: Check Privacy Policy
  run: |
    RISK=$(node -e "console.log(require('./privacy-report.json').overallRisk)")
    if [ "$RISK" = "HIGH" ]; then
      echo "Privacy policy violated!"
      exit 1
    fi
```

## PR Comments

```yaml
- name: Comment PR
  uses: actions/github-script@v6
  with:
    script: |
      const report = require('./privacy-report.json');
      const comment = `## Privacy Analysis
      
      **Risk**: ${report.overallRisk}
      **Signals**: ${report.signals.length}
      
      ${report.overallRisk === 'HIGH' ? '⚠️ High risk!' : '✅ Acceptable'}`;
      
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: comment
      });
```

## Matrix Testing

```yaml
strategy:
  matrix:
    wallet: [devnet, testnet]
steps:
  - name: Scan ${{ matrix.wallet }}
    run: solana-privacy-scanner scan-wallet ${{ matrix.wallet }}
```

## Configuration

`.privacyrc`:

```json
{
  "maxRiskLevel": "MEDIUM",
  "enforceInCI": true,
  "blockOnFailure": true,
  "testWallets": {
    "devnet": "..."
  }
}
```

## Best Practices

1. **Required Checks**: Make privacy checks required for merge
2. **Upload Artifacts**: Save reports for debugging
3. **Scheduled Scans**: Run weekly with `schedule: [cron: '0 0 * * 0']`
4. **Separate Jobs**: Run privacy tests after unit tests pass

## Next Steps

- **[Testing Guide](./testing)** - Write privacy tests
- **[Overview](./overview)** - All CI/CD features
- **[For LLMs](./for-llms)** - Get AI help
