# Development Guide

Contributing to the Solana Privacy Scanner codebase.

## Project Structure

```
solana-privacy-scanner/
├── docs/                    # VitePress documentation (not published to npm)
├── packages/
│   ├── core/               # solana-privacy-scanner-core
│   │   ├── src/
│   │   │   ├── collectors/    # RPC data collection
│   │   │   ├── normalizer/    # Data transformation
│   │   │   ├── heuristics/    # Risk detection logic
│   │   │   ├── scanner/       # Report generation
│   │   │   ├── labels/        # Known entity database
│   │   │   ├── rpc/           # RPC client wrapper
│   │   │   └── types/         # TypeScript definitions
│   │   └── dist/           # Built output (published to npm)
│   │
│   ├── cli/                # @solana-privacy-scanner/cli
│   │   ├── src/
│   │   │   ├── commands/      # CLI command handlers
│   │   │   └── formatter.ts   # Report formatting
│   │   └── dist/           # Built output (published to npm)
│   │
│   ├── server/             # HTTP API (future)
│   └── web/                # Web UI (future)
│
├── package.json            # Root workspace config
└── vitest.config.ts        # Test configuration
```

## Setup

### Prerequisites
- Node.js 20+
- npm 9+
- A Solana RPC endpoint (Helius recommended)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/solana-privacy-scanner
cd solana-privacy-scanner

# Install dependencies
npm install

# Create .env.local
echo "SOLANA_RPC=https://your-rpc-url.com" > .env.local

# Build all packages
npm run build

# Run tests
npm test
```

## Development Workflow

### Make Changes

```bash
# Work on core library
cd packages/core
npm run dev  # Watch mode

# Work on CLI
cd packages/cli
npm run dev  # Watch mode
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests for specific package
cd packages/core
npm test

# Run tests in CI mode (no watch)
npm run test:ci
```

### Build for Production

```bash
# Build all packages
npm run build

# Build specific package
cd packages/core
npm run build
```

## Adding a New Heuristic

1. **Create the heuristic file:**

```typescript
// packages/core/src/heuristics/my-heuristic.ts
import type { ScanContext, RiskSignal } from '../types/index.js';

export function detectMyPattern(context: ScanContext): RiskSignal | null {
  // Your detection logic
  
  if (patternDetected) {
    return {
      id: 'my-pattern-id',
      name: 'My Pattern Name',
      severity: 'HIGH',
      reason: 'Brief explanation of what was detected',
      impact: 'Why this matters for privacy',
      evidence: [...],
      mitigation: 'How to improve',
      confidence: 0.85
    };
  }
  
  return null;
}
```

2. **Export from index:**

```typescript
// packages/core/src/heuristics/index.ts
export { detectMyPattern } from './my-heuristic.js';
```

3. **Add to scanner:**

```typescript
// packages/core/src/scanner/index.ts
import { detectMyPattern } from '../heuristics/index.js';

const HEURISTICS = [
  // ... existing heuristics
  detectMyPattern,
];
```

4. **Write tests:**

```typescript
// packages/core/src/heuristics/index.test.ts
describe('detectMyPattern', () => {
  it('should detect the pattern', () => {
    const context = createMockContext();
    const signal = detectMyPattern(context);
    expect(signal).toBeTruthy();
    expect(signal?.severity).toBe('HIGH');
  });
});
```

## Package Publishing

### What Gets Published

**Core package (`solana-privacy-scanner-core`):**
```json
"files": [
  "dist/**/*",      // Built JS/TS files
  "README.md"       // Package readme
]
```

**CLI package (`@solana-privacy-scanner/cli`):**
```json
"files": [
  "dist/index.js",  // Single bundled CLI file
  "README.md"
]
```

### What Does NOT Get Published

- Source TypeScript files (`src/`)
- Tests (`*.test.ts`)
- Documentation (`docs/`)
- Build scripts (`build.js`)
- Development configs

### Publishing Process

```bash
# 1. Update version in package.json
cd packages/core
npm version patch  # or minor, major

# 2. Build
npm run build

# 3. Test the package
npm pack
# Inspect the .tgz file

# 4. Publish
npm publish --access public

# Repeat for CLI
cd ../cli
npm version patch
npm run build
npm publish --access public
```

## Testing

### Unit Tests

```bash
# Test specific functionality
npm test -- heuristics
```

### Integration Tests

```bash
# Full end-to-end test
./packages/cli/dist/index.js scan-wallet TEST_ADDRESS
```

### Test with Real Data

```bash
# Always test with real Solana data before releasing
export SOLANA_RPC=your-rpc
npm test
```

## Code Style

- **TypeScript strict mode** - No `any` types
- **ESM only** - Use `.js` extensions in imports
- **Descriptive names** - `detectCounterpartyReuse`, not `checkCR`
- **Comments** - Explain "why", not "what"
- **Error handling** - Always handle RPC failures gracefully

## Documentation

### Update Docs

```bash
# Run docs dev server
npm run docs:dev

# Build docs
npm run docs:build

# Preview built docs
npm run docs:preview
```

### Adding Docs Pages

1. Create `.md` file in `docs/`
2. Add to sidebar in `docs/.vitepress/config.ts`
3. Test locally with `npm run docs:dev`

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new heuristic for X"

# Push and create PR
git push origin feature/my-feature
```

### Commit Message Format

```
type(scope): description

feat: new feature
fix: bug fix
docs: documentation changes
test: test additions/changes
chore: maintenance tasks
```

## Troubleshooting

### Build Failures

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Test Failures

```bash
# Check RPC connectivity
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  $SOLANA_RPC
```

### Type Errors

```bash
# Run type checker
cd packages/core
npm run type-check
```

## Resources

- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [VitePress Docs](https://vitepress.dev/)
- [Vitest Docs](https://vitest.dev/)

## Getting Help

- Open an issue on GitHub
- Check existing documentation
- Review test files for examples
