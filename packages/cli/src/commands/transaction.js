import { writeFileSync } from 'fs';
import { RPCClient, collectTransactionData, normalizeTransactionData, generateReport, createDefaultLabelProvider, } from '@solana-privacy-scanner/core';
import { formatReport } from '../formatter.js';
export async function scanTransaction(signature, options) {
    try {
        // Validate RPC URL
        if (!options.rpc) {
            console.error('Error: RPC URL is required. Set SOLANA_RPC env var or use --rpc flag.');
            process.exit(1);
        }
        console.error(`Scanning transaction: ${signature}`);
        console.error(`Using RPC: ${options.rpc.substring(0, 30)}...`);
        console.error('');
        // Create RPC client
        const client = new RPCClient({
            rpcUrl: options.rpc,
            maxConcurrency: 5,
            maxRetries: 3,
        });
        // Collect transaction data
        console.error('Fetching transaction...');
        const rawData = await collectTransactionData(client, signature);
        if (!rawData.transaction) {
            console.error('Error: Transaction not found or failed to fetch');
            process.exit(1);
        }
        console.error('Analyzing transaction...');
        console.error('');
        // Normalize data
        const labelProvider = createDefaultLabelProvider();
        const context = normalizeTransactionData(rawData, labelProvider);
        // Generate report
        const report = generateReport(context);
        // Output
        if (options.json) {
            const output = JSON.stringify(report, null, 2);
            if (options.output) {
                writeFileSync(options.output, output);
                console.error(`Report written to: ${options.output}`);
            }
            else {
                console.log(output);
            }
        }
        else {
            // Disable colors when writing to file
            const formatted = formatReport(report, !!options.output);
            if (options.output) {
                writeFileSync(options.output, formatted);
                console.error(`Report written to: ${options.output}`);
            }
            else {
                console.log(formatted);
            }
        }
        process.exit(0);
    }
    catch (error) {
        console.error('Error scanning transaction:', error);
        process.exit(1);
    }
}
//# sourceMappingURL=transaction.js.map