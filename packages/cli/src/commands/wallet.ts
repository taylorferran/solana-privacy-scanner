import { writeFileSync } from 'fs';
import {
  RPCClient,
  collectWalletData,
  normalizeWalletData,
  generateReport,
  createDefaultLabelProvider,
  type PrivacyReport,
} from 'solana-privacy-scanner-core';
import { formatReport } from '../formatter.js';

interface WalletOptions {
  rpc?: string;
  json?: boolean;
  maxSignatures?: string;
  output?: string;
}

export async function scanWallet(address: string, options: WalletOptions) {
  try {
    console.error(`Scanning wallet: ${address}`);
    console.error('');

    // Create RPC client (uses default RPC if not provided)
    const client = new RPCClient(
      options.rpc ? {
        rpcUrl: options.rpc,
        maxConcurrency: 5,
        maxRetries: 3,
      } : {
        maxConcurrency: 5,
        maxRetries: 3,
      }
    );

    // Collect raw data
    console.error('Collecting transaction data...');
    const maxSigs = parseInt(options.maxSignatures || '100', 10);
    const rawData = await collectWalletData(client, address, {
      maxSignatures: maxSigs,
      includeTokenAccounts: true,
    });

    console.error(`Found ${rawData.signatures.length} transactions`);
    console.error('');

    // Normalize data
    console.error('Analyzing privacy patterns...');
    const labelProvider = createDefaultLabelProvider();
    const context = normalizeWalletData(rawData, labelProvider);

    // Generate report
    const report: PrivacyReport = generateReport(context);

    // Output
    if (options.json) {
      const output = JSON.stringify(report, null, 2);
      if (options.output) {
        writeFileSync(options.output, output);
        console.error(`Report written to: ${options.output}`);
      } else {
        console.log(output);
      }
    } else {
      // Disable colors when writing to file
      const formatted = formatReport(report, !!options.output);
      if (options.output) {
        writeFileSync(options.output, formatted);
        console.error(`Report written to: ${options.output}`);
      } else {
        console.log(formatted);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error scanning wallet:', error);
    process.exit(1);
  }
}
