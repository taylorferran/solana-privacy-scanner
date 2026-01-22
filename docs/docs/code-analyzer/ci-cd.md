---
sidebar_position: 3
---

# CI/CD Integration

Automate privacy checks in your development workflow.

## GitHub Actions

### Basic Setup

Create `.github/workflows/privacy-check.yml`:

```yaml
name: Privacy Check

on:
  pull_request:
  push:
    branches: [main]

jobs:
  privacy-scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run privacy scan
        run: npx solana-privacy-analyzer scan src/ --json > report.json

      - name: Check for critical issues
        run: |
          CRITICAL=$(jq '.summary.critical' report.json)
          HIGH=$(jq '.summary.high' report.json)

          if [ "$CRITICAL" -gt 0 ]; then
            echo "❌ Found $CRITICAL critical privacy issues"
            jq '.issues[] | select(.severity == "CRITICAL")' report.json
            exit 1
          fi

          if [ "$HIGH" -gt 0 ]; then
            echo "⚠️  Found $HIGH high severity issues"
            jq '.issues[] | select(.severity == "HIGH")' report.json
          fi

          echo "✅ Privacy scan passed"
```

### With PR Comments

Post scan results as PR comments:

```yaml
- name: Run privacy scan
  id: scan
  run: |
    npx solana-privacy-analyzer scan src/ --json > report.json
    echo "report<<EOF" >> $GITHUB_OUTPUT
    cat report.json >> $GITHUB_OUTPUT
    echo "EOF" >> $GITHUB_OUTPUT

- name: Comment on PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v6
  with:
    script: |
      const report = JSON.parse('${{ steps.scan.outputs.report }}');

      let comment = '## 🔒 Privacy Scan Results\n\n';
      comment += `Files analyzed: ${report.filesAnalyzed}\n`;
      comment += `Total issues: ${report.summary.total}\n\n`;

      if (report.summary.critical > 0) {
        comment += `🔴 **CRITICAL**: ${report.summary.critical}\n`;
      }
      if (report.summary.high > 0) {
        comment += `🟡 **HIGH**: ${report.summary.high}\n`;
      }

      if (report.summary.total === 0) {
        comment += '\n✅ No privacy issues detected!';
      }

      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: comment
      });
```

## Pre-commit Hook

### Using Husky

Install Husky:

```bash
npm install --save-dev husky
npx husky install
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "Running privacy scan..."
npx solana-privacy-analyzer scan src/ --no-low --quiet

if [ $? -ne 0 ]; then
  echo "❌ Privacy issues detected. Fix before committing."
  exit 1
fi

echo "✅ Privacy check passed"
```

Make it executable:

```bash
chmod +x .husky/pre-commit
```

### Manual Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "🔒 Running privacy scan..."

# Run analyzer on staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx|js|jsx)$')

if [ -z "$STAGED_FILES" ]; then
  echo "No TypeScript/JavaScript files to scan"
  exit 0
fi

# Scan staged files
npx solana-privacy-analyzer scan $STAGED_FILES --no-low

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Privacy issues detected in staged files"
  echo ""
  echo "Fix the issues above or skip this check with:"
  echo "  git commit --no-verify"
  echo ""
  exit 1
fi

echo "✅ Privacy check passed"
exit 0
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

## GitLab CI

Create `.gitlab-ci.yml`:

```yaml
privacy-scan:
  stage: test
  image: node:18

  script:
    - npm install
    - npx solana-privacy-analyzer scan src/ --json > report.json
    - |
      CRITICAL=$(cat report.json | jq '.summary.critical')
      if [ "$CRITICAL" -gt 0 ]; then
        echo "Critical privacy issues found"
        cat report.json | jq '.issues[] | select(.severity == "CRITICAL")'
        exit 1
      fi

  artifacts:
    reports:
      junit: report.json
    paths:
      - report.json
    expire_in: 1 week
```

## CircleCI

Create `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  privacy-check:
    docker:
      - image: cimg/node:18.0

    steps:
      - checkout

      - restore_cache:
          keys:
            - deps-{{ checksum "package-lock.json" }}

      - run:
          name: Install dependencies
          command: npm install

      - save_cache:
          paths:
            - node_modules
          key: deps-{{ checksum "package-lock.json" }}

      - run:
          name: Run privacy scan
          command: |
            npx solana-privacy-analyzer scan src/ --json | tee report.json

            CRITICAL=$(jq '.summary.critical' report.json)
            if [ "$CRITICAL" -gt 0 ]; then
              echo "Critical privacy issues found"
              exit 1
            fi

      - store_artifacts:
          path: report.json

workflows:
  version: 2
  build-and-test:
    jobs:
      - privacy-check
```

## Custom CI Script

Create `scripts/privacy-check.sh`:

```bash
#!/bin/bash

set -e

echo "🔒 Running Solana Privacy Scanner..."

# Run scan and save JSON output
npx solana-privacy-analyzer scan src/ --json > privacy-report.json

# Parse results
TOTAL=$(jq '.summary.total' privacy-report.json)
CRITICAL=$(jq '.summary.critical' privacy-report.json)
HIGH=$(jq '.summary.high' privacy-report.json)

# Display summary
echo ""
echo "📊 Privacy Scan Results:"
echo "  Total issues: $TOTAL"
echo "  Critical: $CRITICAL"
echo "  High: $HIGH"
echo ""

# Fail if critical issues exist
if [ "$CRITICAL" -gt 0 ]; then
  echo "❌ FAILED: Critical privacy issues detected"
  echo ""
  echo "Critical issues:"
  jq -r '.issues[] | select(.severity == "CRITICAL") | "  - \(.message) (\(.file):\(.line))"' privacy-report.json
  echo ""
  exit 1
fi

# Warn if high issues exist
if [ "$HIGH" -gt 0 ]; then
  echo "⚠️  WARNING: High severity issues detected"
  echo ""
  jq -r '.issues[] | select(.severity == "HIGH") | "  - \(.message) (\(.file):\(.line))"' privacy-report.json
  echo ""
fi

echo "✅ Privacy scan passed"
exit 0
```

Make it executable and use in any CI:

```bash
chmod +x scripts/privacy-check.sh
./scripts/privacy-check.sh
```

## Package.json Scripts

Add to your `package.json` for easy access:

```json
{
  "scripts": {
    "privacy:check": "solana-privacy-analyzer scan src/",
    "privacy:ci": "solana-privacy-analyzer scan src/ --json --no-low",
    "test": "npm run privacy:check && vitest",
    "precommit": "npm run privacy:check"
  }
}
```

## Tips

### Focus on Critical Issues

In CI, only fail on critical issues:

```bash
npx solana-privacy-analyzer scan src/ --json > report.json
CRITICAL=$(jq '.summary.critical' report.json)
[ "$CRITICAL" -eq 0 ] || exit 1
```

### Cache for Speed

Cache npm modules to speed up CI:

```yaml
# GitHub Actions
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Separate Job

Run privacy checks in parallel with tests:

```yaml
jobs:
  test:
    # ... run tests

  privacy:
    # ... run privacy scan

  deploy:
    needs: [test, privacy]  # Both must pass
```

## Next Steps

- [CLI Reference](./cli-reference) - All command options
- [Claude Code Plugin](../claude-plugin/overview) - Interactive fixing
- [Example Repository](https://github.com/taylorferran/solana-privacy-scanner-example) - See it in action
