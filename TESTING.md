# Testing Guide

## Setup

1. Make sure you have a `.env.local` file at the root with your Solana RPC:
```bash
SOLANA_RPC=https://your-helius-rpc-url.com
```

2. Install dependencies:
```bash
npm install
```

## Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:ci

# Run tests for core package only
cd packages/core && npm test
```

## What's Being Tested

### Data Collection Layer Tests

The tests verify that our data collection functions actually work with real Solana RPC data:

1. **Wallet Data Collection** (`collectWalletData`)
   - Fetches recent signatures (with limit)
   - Fetches full transactions
   - Fetches token accounts
   - Respects max signature limits

2. **Transaction Data Collection** (`collectTransactionData`)
   - Fetches full transaction with metadata
   - Returns block time and transaction details

3. **Program Data Collection** (`collectProgramData`)
   - Fetches program accounts (limited scan)
   - Fetches recent transactions involving the program
   - Respects account and transaction limits

4. **RPC Client Health**
   - Verifies RPC connection is working
   - Reports statistics (active requests, queue length)

## Test Addresses

Tests use known, active Solana addresses and programs:
- Wallet: `DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK` (Solana Foundation)
- Program: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` (SPL Token Program)

These are public, well-known addresses that will always have activity.
