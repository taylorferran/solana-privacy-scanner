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
      - run: npm test
```

## Example

See working implementation: [Example Repository](https://github.com/taylorferran/solana-privacy-scanner-example)
