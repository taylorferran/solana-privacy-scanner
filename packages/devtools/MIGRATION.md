# Migration Guide

## Migrating from `solana-privacy-scanner-ci-tools` to `solana-privacy-devtools`

The CI tools package has been renamed and expanded to include static code analysis. This guide will help you migrate.

### What Changed?

**Package Rename:**
- Old: `solana-privacy-scanner-ci-tools`
- New: `solana-privacy-devtools`

**New Features Added:**
- Static code analyzer (merged from `solana-privacy-analyzer`)
- Analyzer CLI: `npx solana-privacy-devtools analyze`

**What Stayed the Same:**
- All existing APIs (simulator, matchers, config)
- All existing functionality works identically
- Same exports and module structure

### Migration Steps

#### 1. Update package.json

```diff
{
  "devDependencies": {
-   "solana-privacy-scanner-ci-tools": "^0.1.0"
+   "solana-privacy-devtools": "^0.1.0"
  }
}
```

#### 2. Update imports

```diff
- import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';
+ import { simulateTransactionPrivacy } from 'solana-privacy-devtools/simulator';

- import 'solana-privacy-scanner-ci-tools/matchers';
+ import 'solana-privacy-devtools/matchers';

- import { loadConfig } from 'solana-privacy-scanner-ci-tools/config';
+ import { loadConfig } from 'solana-privacy-devtools/config';
```

#### 3. Install new package

```bash
npm uninstall solana-privacy-scanner-ci-tools
npm install --save-dev solana-privacy-devtools
```

#### 4. Update GitHub Actions (if applicable)

```diff
# .github/workflows/privacy-check.yml
jobs:
  privacy:
    steps:
      - run: npm install
+     - name: Analyze code
+       run: npx solana-privacy-devtools analyze src/
      - name: Run tests
        run: npm test
```

### Breaking Changes

**None.** This is a backward-compatible rename. All existing code will work without changes after updating the package name.

### New Capabilities

After migrating, you can now use the static analyzer:

```bash
# Analyze your source code
npx solana-privacy-devtools analyze src/

# Analyze specific files
npx solana-privacy-devtools analyze src/transfer.ts

# Fail CI on issues
npx solana-privacy-devtools analyze src/ --fail-on-error
```

Or import in code:

```typescript
import { analyzeCode } from 'solana-privacy-devtools/analyzer';

const issues = await analyzeCode(['src/**/*.ts']);
console.log(`Found ${issues.length} privacy issues`);
```

### Example: Complete Migration

**Before:**
```json
{
  "name": "my-solana-app",
  "devDependencies": {
    "solana-privacy-scanner-ci-tools": "^0.1.0"
  }
}
```

```typescript
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';
import 'solana-privacy-scanner-ci-tools/matchers';

test('transfer maintains privacy', async () => {
  const tx = await createTransfer();
  const report = await simulateTransactionPrivacy(tx, connection);
  expect(report).toHavePrivacyRisk('LOW');
});
```

**After:**
```json
{
  "name": "my-solana-app",
  "devDependencies": {
    "solana-privacy-devtools": "^0.1.0"
  }
}
```

```typescript
import { simulateTransactionPrivacy } from 'solana-privacy-devtools/simulator';
import 'solana-privacy-devtools/matchers';

test('transfer maintains privacy', async () => {
  const tx = await createTransfer();
  const report = await simulateTransactionPrivacy(tx, connection);
  expect(report).toHavePrivacyRisk('LOW');
});

// NEW: Add static analysis
test('code has no privacy anti-patterns', async () => {
  const { analyzeCode } = await import('solana-privacy-devtools/analyzer');
  const issues = await analyzeCode(['src/transfer.ts']);
  expect(issues).toHaveLength(0);
});
```

### Search and Replace

You can use these commands to update your codebase:

```bash
# macOS/Linux
find . -type f -name "*.ts" -o -name "*.js" -o -name "*.json" | \
  xargs sed -i '' 's/solana-privacy-scanner-ci-tools/solana-privacy-devtools/g'

# Or use your IDE's find-and-replace:
# Find: solana-privacy-scanner-ci-tools
# Replace: solana-privacy-devtools
```

### Testing Your Migration

After migrating, verify everything works:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Try the new analyzer
npx solana-privacy-devtools analyze src/
```

### Troubleshooting

**Issue:** `Cannot find module 'solana-privacy-scanner-ci-tools'`
**Solution:** You missed updating an import. Search your codebase for the old package name.

**Issue:** `Command not found: solana-privacy-devtools`
**Solution:** Run `npm install` to install the new package.

**Issue:** Tests fail after migration
**Solution:** Check that all imports are updated. The APIs haven't changed, only the package name.

### Questions?

- **Do I need to migrate immediately?** No, but we recommend it to get access to the static analyzer.
- **Will the old package still work?** Yes, but it won't receive updates.
- **Can I use both packages?** Not recommended - they export the same modules and will conflict.

### Support

If you run into issues during migration:
- **GitHub Issues:** https://github.com/taylorferran/solana-privacy-scanner/issues
- **Documentation:** https://sps.guide

## Migrating from `solana-privacy-analyzer` to `solana-privacy-devtools`

The static analyzer has been merged into the devtools package.

### What Changed?

**Package Merge:**
- Old: `solana-privacy-analyzer` (standalone)
- New: `solana-privacy-devtools/analyzer` (part of devtools)

**CLI Command:**
- Old: `npx solana-privacy-analyzer analyze`
- New: `npx solana-privacy-devtools analyze`

### Migration Steps

#### 1. Update package.json

```diff
{
  "devDependencies": {
-   "solana-privacy-analyzer": "^0.1.0"
+   "solana-privacy-devtools": "^0.1.0"
  }
}
```

#### 2. Update CLI usage

```diff
- npx solana-privacy-analyzer analyze src/
+ npx solana-privacy-devtools analyze src/
```

#### 3. Update imports (if using programmatically)

```diff
- import { analyzeCode } from 'solana-privacy-analyzer';
+ import { analyzeCode } from 'solana-privacy-devtools/analyzer';
```

#### 4. Install new package

```bash
npm uninstall solana-privacy-analyzer
npm install --save-dev solana-privacy-devtools
```

### Breaking Changes

**CLI Command:** The command changed from `solana-privacy-analyzer` to `solana-privacy-devtools`.

**Import Path:** Changed from `'solana-privacy-analyzer'` to `'solana-privacy-devtools/analyzer'`.

### Bonus: New Features

You now have access to all devtools features:
- Transaction simulator
- Test matchers
- CI/CD integration

### Example: Complete Migration

**Before:**
```bash
npx solana-privacy-analyzer analyze src/
```

```typescript
import { analyzeCode } from 'solana-privacy-analyzer';

const issues = await analyzeCode(['src/**/*.ts']);
```

**After:**
```bash
npx solana-privacy-devtools analyze src/
```

```typescript
import { analyzeCode } from 'solana-privacy-devtools/analyzer';

const issues = await analyzeCode(['src/**/*.ts']);

// NEW: Also use simulator and matchers
import { simulateTransactionPrivacy } from 'solana-privacy-devtools/simulator';
import 'solana-privacy-devtools/matchers';
```

---

## Summary

Both packages have been consolidated into `solana-privacy-devtools` for a unified developer experience:

- **Static analysis** (from analyzer)
- **Runtime testing** (from ci-tools)
- **CI/CD integration** (from ci-tools)

One package, complete privacy toolkit.
