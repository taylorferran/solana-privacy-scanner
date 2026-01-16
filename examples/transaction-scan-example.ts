/**
 * Transaction Scan Example
 * 
 * This example demonstrates how to analyze a single Solana transaction
 * for privacy risks using the published npm package.
 */

import { 
  RPCClient, 
  collectTransactionData, 
  normalizeTransactionData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

// Configuration
const RPC_URL = 'https://late-hardworking-waterfall.solana-mainnet.quiknode.pro/4017b48acf3a2a1665603cac096822ce4bec3a90/';
const TRANSACTION_SIGNATURE = '3Jxo3MpgA5wzrsuBbUEpBt6TtFN6g3ewevQ1EUr9mxNvr3CpZEZoePB2PqSFRGF6LaRWtPVN4vxCqzTZXYnE9Sxa';

async function main() {
  console.log('🔍 Solana Privacy Scanner - Transaction Scan Example\n');
  console.log(`Scanning transaction: ${TRANSACTION_SIGNATURE.slice(0, 20)}...`);
  console.log(`Using RPC: ${RPC_URL.split('quiknode.pro')[0]}quiknode.pro/***\n`);

  try {
    // Initialize RPC client
    const rpc = new RPCClient(RPC_URL);
    
    // Initialize label provider (for known entity detection)
    const labelProvider = createDefaultLabelProvider();

    // Step 1: Collect transaction data
    console.log('⏳ Fetching transaction data...');
    const rawData = await collectTransactionData(rpc, TRANSACTION_SIGNATURE);
    
    if (!rawData.transaction) {
      console.error('❌ Transaction not found');
      process.exit(1);
    }

    console.log(`   Transaction found in slot: ${rawData.transaction.slot}`);

    // Step 2: Normalize data into facts
    console.log('⏳ Normalizing transaction data...');
    const context = normalizeTransactionData(rawData, labelProvider);

    // Step 3: Generate privacy report
    console.log('⏳ Analyzing privacy patterns...');
    const report = generateReport(context);

    // Display results
    console.log('\n✅ Scan complete!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  PRIVACY RISK SCORE: ${report.overallRisk}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Transaction details
    console.log('📋 TRANSACTION DETAILS:');
    console.log(`  Signature: ${TRANSACTION_SIGNATURE}`);
    console.log(`  Transfers: ${context.transfers.length}`);
    console.log(`  Instructions: ${context.instructions.length}`);
    console.log(`  Counterparties: ${context.counterparties.size}`);
    console.log('');

    // Known entities
    if (report.knownEntities && report.knownEntities.length > 0) {
      console.log('🏷️  KNOWN ENTITIES DETECTED:');
      report.knownEntities.forEach(entity => {
        console.log(`  • ${entity.name} (${entity.type})`);
        if (entity.description) {
          console.log(`    ${entity.description}`);
        }
      });
      console.log('');
    } else {
      console.log('✓ No known entities detected\n');
    }

    // Privacy signals
    if (report.signals && report.signals.length > 0) {
      console.log(`📊 PRIVACY SIGNALS (${report.signals.length} detected):\n`);
      
      report.signals.forEach((signal, index) => {
        const severityEmoji = signal.severity === 'HIGH' ? '🔴' 
          : signal.severity === 'MEDIUM' ? '🟡' 
          : '🟢';
        
        console.log(`${index + 1}. ${severityEmoji} ${signal.type} [${signal.severity}]`);
        console.log(`   ${signal.description}`);
        
        if (signal.evidence && signal.evidence.length > 0) {
          console.log(`   Evidence:`);
          signal.evidence.slice(0, 3).forEach(ev => {
            console.log(`   • ${ev}`);
          });
          if (signal.evidence.length > 3) {
            console.log(`   • ... and ${signal.evidence.length - 3} more`);
          }
        }
        
        if (signal.mitigation) {
          console.log(`   💡 Mitigation: ${signal.mitigation}`);
        }
        console.log('');
      });
    } else {
      console.log('✓ No significant privacy signals detected\n');
    }

    // Recommendations
    if (report.mitigations && report.mitigations.length > 0) {
      console.log('💡 RECOMMENDATIONS:\n');
      report.mitigations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
      console.log('');
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Generated: ${new Date(report.timestamp).toLocaleString()}`);
    console.log('═══════════════════════════════════════════════════════');

    // Output full report as JSON (optional)
    console.log('\n📄 Full JSON report saved to: transaction-report.json');
    const fs = await import('fs');
    fs.writeFileSync('transaction-report.json', JSON.stringify(report, null, 2));

  } catch (error) {
    console.error('\n❌ Error scanning transaction:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the example
main();
