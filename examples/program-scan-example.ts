/**
 * Program Scan Example
 * 
 * This example demonstrates how to analyze a Solana program's activity
 * for privacy patterns using the published npm package.
 */

import { 
  RPCClient, 
  collectProgramData, 
  normalizeProgramData, 
  generateReport,
  createDefaultLabelProvider 
} from 'solana-privacy-scanner-core';

// Configuration
const RPC_URL = 'https://late-hardworking-waterfall.solana-mainnet.quiknode.pro/4017b48acf3a2a1665603cac096822ce4bec3a90/';
const PROGRAM_ID = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'; // Jupiter Aggregator

async function main() {
  console.log('🔍 Solana Privacy Scanner - Program Scan Example\n');
  console.log(`Scanning program: ${PROGRAM_ID}`);
  console.log(`Using RPC: ${RPC_URL.split('quiknode.pro')[0]}quiknode.pro/***\n`);

  try {
    // Initialize RPC client
    const rpc = new RPCClient(RPC_URL);
    
    // Initialize label provider (for known entity detection)
    const labelProvider = createDefaultLabelProvider();

    // Step 1: Collect program data (limited for example)
    console.log('⏳ Fetching program data...');
    const rawData = await collectProgramData(
      rpc,
      PROGRAM_ID,
      {
        maxAccounts: 5,      // Limit accounts for faster scanning
        maxTransactions: 10   // Limit transactions for faster scanning
      }
    );
    
    console.log(`   Fetched ${rawData.accounts.length} accounts`);
    console.log(`   Fetched ${rawData.relatedTransactions.length} transactions`);

    // Step 2: Normalize data into facts
    console.log('⏳ Normalizing program data...');
    const context = normalizeProgramData(rawData, labelProvider);

    // Step 3: Generate privacy report
    console.log('⏳ Analyzing privacy patterns...');
    const report = generateReport(context);

    // Display results
    console.log('\n✅ Scan complete!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  PRIVACY RISK SCORE: ${report.overallRisk}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Program details
    console.log('📋 PROGRAM DETAILS:');
    console.log(`  Program ID: ${PROGRAM_ID}`);
    console.log(`  Accounts analyzed: ${rawData.accounts.length}`);
    console.log(`  Transactions analyzed: ${context.transactionCount}`);
    console.log(`  Transfers found: ${context.transfers.length}`);
    console.log(`  Unique counterparties: ${context.counterparties.size}`);
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
    console.log('\n📄 Full JSON report saved to: program-report.json');
    const fs = await import('fs');
    fs.writeFileSync('program-report.json', JSON.stringify(report, null, 2));

  } catch (error) {
    console.error('\n❌ Error scanning program:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the example
main();
