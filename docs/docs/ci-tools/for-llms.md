# For LLMs - CI/CD Tools

Copy the text below and paste it into your AI coding assistant (Claude, Cursor, ChatGPT, etc.) to get help integrating privacy testing into your development workflow.

---

## Prompt for AI Assistants

```
I want to integrate privacy testing into my Solana development workflow using the Solana Privacy Scanner CI/CD Tools.

PACKAGE: solana-privacy-scanner-ci-tools
VERSION: 0.1.0
DOCUMENTATION: https://sps.guide/ci-tools/overview

WHAT IT DOES:
Brings privacy analysis into your development workflow with:
- Transaction simulator (test privacy before sending to chain)
- Testing matchers (privacy assertions in test suites)
- GitHub Actions integration (automated CI checks)
- Pre-commit hooks (local validation)
- Configuration system (.privacyrc for privacy policies)
- Docker support (works with any CI/CD platform)

INSTALLATION:
npm install --save-dev solana-privacy-scanner-ci-tools

QUICK SETUP:
npx privacy-scanner-init
# Interactive wizard that creates .privacyrc, sets up GitHub Actions, hooks, etc.

CORE FEATURES:

1. TRANSACTION SIMULATOR
   Test privacy BEFORE sending transactions to mainnet
   
   Functions:
   - simulateTransactionPrivacy(tx, connection) - Analyze single transaction
   - simulateTransactionFlow(txArray, connection) - Analyze multi-step flows
   - compareImplementations(txA, txB, connection) - Compare two approaches
   
   Example:
   ```typescript
   import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';
   
   const tx = await buildTransaction();
   const report = await simulateTransactionPrivacy(tx, connection);
   
   if (report.overallRisk === 'HIGH') {
     throw new Error('Privacy policy violated');
   }
   ```

2. TESTING MATCHERS
   Privacy assertions in Vitest/Jest test suites
   
   Available Matchers:
   - toHavePrivacyRisk(level) - Assert 'LOW' | 'MEDIUM' | 'HIGH'
   - toNotLeakUserRelationships() - No counterparty/signer linkage
   - toHaveNoHighRiskSignals() - No HIGH severity signals
   - toNotHaveSignal(type) - Specific signal not present
   - toHavePrivacyScore(min) - Minimum score (0-100)
   - toHaveAtMostSignals(max) - Max number of signals
   - Plus more...
   
   Example:
   ```typescript
   import 'solana-privacy-scanner-ci-tools/matchers';
   
   test('swap maintains privacy', async () => {
     const tx = await program.methods.swap(amount).transaction();
     const report = await simulateTransactionPrivacy(tx, connection);
     
     expect(report).toHavePrivacyRisk('LOW');
     expect(report).toNotLeakUserRelationships();
     expect(report).toNotHaveSignal('fee-payer-reuse');
   });
   ```

3. CONFIGURATION SYSTEM
   Project-level privacy policies via .privacyrc
   
   Example .privacyrc:
   ```json
   {
     "maxRiskLevel": "MEDIUM",
     "enforceInCI": true,
     "blockOnFailure": true,
     "devnetWallet": "YOUR_TEST_WALLET",
     "thresholds": {
       "maxHighSeverity": 0,
       "maxMediumSeverity": 3,
       "minPrivacyScore": 70
     },
     "excludePatterns": ["test/**", "scripts/**"]
   }
   ```
   
   Load config in code:
   ```typescript
   import { loadConfig } from 'solana-privacy-scanner-ci-tools/config';
   const config = loadConfig(); // Finds and validates .privacyrc
   ```

4. GITHUB ACTIONS
   Automated privacy checks on every PR
   
   Setup with wizard or manually create .github/workflows/privacy-check.yml:
   ```yaml
   name: Privacy Check
   on: [pull_request]
   jobs:
     privacy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: npm ci
         - run: npm test  # Includes privacy matchers
   ```

5. PRE-COMMIT HOOKS
   Local validation before commits
   
   Wizard installs .husky/pre-commit automatically:
   ```bash
   #!/bin/sh
   npm test -- --run  # Runs privacy tests before commit
   ```

6. DOCKER SUPPORT
   Containerized scanning for any CI platform
   
   Dockerfile included in package:
   ```dockerfile
   FROM node:20-alpine
   RUN npm install -g solana-privacy-scanner-ci-tools
   ENTRYPOINT ["privacy-scanner-init"]
   ```

TYPESCRIPT TYPES:
- PrivacyReport - Report from simulator
- FlowAnalysisReport - Multi-transaction flow report
- PrivacyConfig - .privacyrc configuration
- SimulationResult - Transaction simulation result

COMMON WORKFLOWS:

1. Test-Driven Privacy Development:
   ```typescript
   describe('DeFi Protocol', () => {
     it('deposit maintains privacy', async () => {
       const tx = await program.methods.deposit(amount).transaction();
       const report = await simulateTransactionPrivacy(tx, connection);
       expect(report).toHavePrivacyRisk('LOW');
     });
   });
   ```

2. Pre-deployment Validation:
   ```typescript
   const tx = buildTransaction();
   const report = await simulateTransactionPrivacy(tx, connection);
   
   if (report.overallRisk !== 'LOW') {
     console.warn('Privacy risk detected, aborting deployment');
     process.exit(1);
   }
   ```

3. Flow Analysis:
   ```typescript
   const flow = [depositTx, swapTx, withdrawTx];
   const flowReport = await simulateTransactionFlow(flow, connection);
   
   console.log(`Cumulative Risk: ${flowReport.cumulativeRisk}`);
   for (const pattern of flowReport.emergentPatterns) {
     console.log(`Pattern: ${pattern.type} - ${pattern.description}`);
   }
   ```

4. Implementation Comparison:
   ```typescript
   const directTransfer = createDirectTransfer(user, recipient, amount);
   const routedTransfer = createRoutedTransfer(user, recipient, amount);
   
   const comparison = await compareImplementations(
     directTransfer,
     routedTransfer,
     connection
   );
   
   console.log(`Winner: ${comparison.winner} (${comparison.difference} points better)`);
   ```

5. Config-Based Testing:
   ```typescript
   const config = loadConfig();
   
   test('meets project privacy standards', async () => {
     const report = await simulateTransactionPrivacy(tx, connection);
     const highSignals = report.signals.filter(s => s.severity === 'HIGH').length;
     expect(highSignals).toBeLessThanOrEqual(config.thresholds.maxHighSeverity);
   });
   ```

TEST SETUP (Vitest):

1. Create tests/setup.ts:
   ```typescript
   import 'solana-privacy-scanner-ci-tools/matchers';
   ```

2. Update vitest.config.ts:
   ```typescript
   export default {
     setupFilesAfterEnv: ['./tests/setup.ts'],
   };
   ```

3. Write tests:
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { Connection } from '@solana/web3.js';
   import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';
   
   describe('Privacy Tests', () => {
     const connection = new Connection('https://api.devnet.solana.com');
     
     it('transaction is private', async () => {
       const tx = await createTransaction();
       const report = await simulateTransactionPrivacy(tx, connection);
       expect(report).toHavePrivacyRisk('LOW');
     });
   });
   ```

GITHUB ACTIONS ADVANCED:

1. PR Comments:
   ```yaml
   - name: Comment PR
     uses: actions/github-script@v6
     with:
       script: |
         const report = require('./privacy-report.json');
         const comment = `## Privacy Analysis
         **Risk**: ${report.overallRisk}
         **Score**: ${report.summary.privacyScore}/100`;
         github.rest.issues.createComment({...});
   ```

2. Fail on Policy Violation:
   ```yaml
   - name: Check Policy
     run: |
       RISK=$(node -e "console.log(require('./report.json').overallRisk)")
       if [ "$RISK" = "HIGH" ]; then exit 1; fi
   ```

3. Matrix Testing:
   ```yaml
   strategy:
     matrix:
       wallet: [devnet, testnet, mainnet]
   steps:
     - name: Scan ${{ matrix.wallet }}
       run: scan-wallet ${{ matrix.wallet }}
   ```

BEST PRACTICES:

1. Test Privacy Early - Write privacy tests alongside functional tests
2. Use Flow Analysis - Don't just test individual transactions
3. Document Requirements - Make privacy expectations explicit in test descriptions
4. Enforce in CI - Make privacy checks required for merges
5. Track Over Time - Monitor privacy score trends
6. Simulate Before Deploy - Always test transactions before sending to mainnet

ERROR HANDLING:
- Simulator handles invalid transactions gracefully
- Matchers provide clear failure messages
- Config loader validates .privacyrc with helpful errors
- All functions include TypeScript types

INFRASTRUCTURE:
- Powered by QuickNode for Solana RPC access
- No configuration needed - works out of the box
- Default RPC endpoint included

INTEGRATION EXAMPLES:

DeFi Protocol:
```typescript
test('lending maintains privacy', async () => {
  const borrowTx = await protocol.borrow(amount);
  const report = await simulateTransactionPrivacy(borrowTx, connection);
  expect(report).toNotInteractWith('exchange');
  expect(report).toHaveNoHighRiskSignals();
});
```

NFT Marketplace:
```typescript
test('purchase is private', async () => {
  const purchaseTx = await marketplace.buy(nftMint);
  const report = await simulateTransactionPrivacy(purchaseTx, connection);
  expect(report).toHavePrivacyScore(70);
  expect(report).toNotLeakUserRelationships();
});
```

Gaming:
```typescript
test('game actions maintain privacy', async () => {
  const actions = [login(), playMove(), claim()];
  const flow = await simulateTransactionFlow(actions, connection);
  expect(flow.cumulativeRisk).not.toBe('HIGH');
  expect(flow.emergentPatterns).toHaveLength(0);
});
```

MY PROJECT CONTEXT:
[Describe your project - what you're building, current test setup, CI/CD platform, goals, etc.]

WHAT I NEED HELP WITH:
[Be specific - e.g., "Integrate privacy matchers into my existing Vitest tests", "Set up GitHub Actions with PR comments", "Create privacy tests for my DeFi protocol", etc.]
```

---

## Example Prompts for Specific Use Cases

### For Existing Test Suite

```
I have an existing Vitest test suite for my Solana program. Using solana-privacy-scanner-ci-tools, help me:
1. Add privacy matchers to my tests
2. Create privacy tests for all my main user flows
3. Set up a configuration that enforces MEDIUM or lower risk
4. Make privacy tests run alongside my existing tests
```

### For GitHub Actions

```
Using solana-privacy-scanner-ci-tools, help me set up GitHub Actions that:
1. Runs privacy tests on every PR
2. Comments the privacy report on the PR
3. Fails if any HIGH severity signals are detected
4. Uploads the full JSON report as an artifact
5. Runs a weekly scan of our mainnet wallet
```

### For Transaction Development

```
I'm developing a new transaction type for my Solana protocol. Using solana-privacy-scanner-ci-tools, help me:
1. Simulate the transaction to see privacy implications
2. Compare it against an alternative implementation
3. Write tests that ensure it maintains LOW risk
4. Create a pre-commit hook that validates privacy before I push
```

### For Privacy Policy Enforcement

```
Using solana-privacy-scanner-ci-tools, help me enforce a privacy policy that:
1. No transactions can have HIGH severity signals
2. Maximum of 2 MEDIUM severity signals per transaction
3. Privacy score must be at least 75
4. No interactions with known exchanges
5. This policy is enforced in CI and blocks merges if violated
```

---

## Quick Reference

### Install
```bash
npm install --save-dev solana-privacy-scanner-ci-tools
```

### Setup
```bash
npx privacy-scanner-init
```

### Test with Matchers
```typescript
import 'solana-privacy-scanner-ci-tools/matchers';

test('private', async () => {
  const report = await simulateTransactionPrivacy(tx, connection);
  expect(report).toHavePrivacyRisk('LOW');
});
```

### Simulate Transaction
```typescript
import { simulateTransactionPrivacy } from 'solana-privacy-scanner-ci-tools/simulator';
const report = await simulateTransactionPrivacy(tx, connection);
```

### Load Config
```typescript
import { loadConfig } from 'solana-privacy-scanner-ci-tools/config';
const config = loadConfig();
```

### Links
- **Full Documentation:** https://sps.guide/ci-tools/overview
- **Testing Guide:** https://sps.guide/ci-tools/testing
- **GitHub Actions:** https://sps.guide/ci-tools/github-actions
- **npm Package:** https://www.npmjs.com/package/solana-privacy-scanner-ci-tools
- **GitHub:** https://github.com/taylorferran/solana-privacy-scanner
