import { writeFileSync } from 'fs';
import {
  RPCClient,
  collectProgramData,
  normalizeProgramData,
  generateReport,
  createDefaultLabelProvider,
  type PrivacyReport,
} from '@solana-privacy-scanner/core';
import { formatReport } from '../formatter.js';

interface ProgramOptions {
  rpc?: string;
  json?: boolean;
  maxAccounts?: string;
  maxTransactions?: string;
  output?: string;
}

export async function scanProgram(programId: string, options: ProgramOptions) {
  try {
    // Validate RPC URL
    if (!options.rpc) {
      console.error('Error: RPC URL is required. Set SOLANA_RPC env var or use --rpc flag.');
      process.exit(1);
    }

    console.error(`Scanning program: ${programId}`);
    console.error(`Using RPC: ${options.rpc.substring(0, 30)}...`);
    console.error('');

    // Create RPC client
    const client = new RPCClient({
      rpcUrl: options.rpc,
      maxConcurrency: 5,
      maxRetries: 3,
    });

    // Collect program data
    console.error('Collecting program data...');
    const maxAccounts = parseInt(options.maxAccounts || '100', 10);
    const maxTxs = parseInt(options.maxTransactions || '50', 10);
    
    const rawData = await collectProgramData(client, programId, {
      maxAccounts,
      maxTransactions: maxTxs,
    });

    console.error(`Found ${rawData.accounts.length} accounts, ${rawData.relatedTransactions.length} transactions`);
    console.error('');

    // Normalize data
    console.error('Analyzing program activity...');
    const labelProvider = createDefaultLabelProvider();
    const context = normalizeProgramData(rawData, labelProvider);

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
    console.error('Error scanning program:', error);
    process.exit(1);
  }
}
