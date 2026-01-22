# GitHub Actions

## Workflow File

```yaml
# .github/workflows/privacy-check.yml
name: Privacy Check

on: [pull_request]

jobs:
  privacy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm install

      # Static code analysis
      - name: Analyze code for privacy issues
        run: npx solana-privacy-devtools analyze src/

      # Runtime testing
      - name: Run privacy tests
        run: npm test
```

## Example

See working implementation: [Example Repository](https://github.com/taylorferran/solana-privacy-scanner-example)
