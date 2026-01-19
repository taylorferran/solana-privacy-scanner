import React, { useState, useEffect } from 'react';
import styles from './PrivacyScanner.module.css';
import { BrowserRPCClient } from '../../utils/browser-rpc';

// Use default RPC endpoint
const DEFAULT_RPC = 'https://late-hardworking-waterfall.solana-mainnet.quiknode.pro/4017b48acf3a2a1665603cac096822ce4bec3a90/';

// Import known addresses - we'll need to handle this differently
// For now, we'll use a placeholder
const knownAddresses = { labels: [] };

// Create a browser-compatible label provider
const labelProvider = {
  lookup(address: string) {
    return knownAddresses.labels.find((label: any) => label.address === address) || null;
  },
  lookupMany(addresses: string[]) {
    const results = new Map();
    for (const address of addresses) {
      const label = this.lookup(address);
      if (label) {
        results.set(address, label);
      }
    }
    return results;
  }
};

interface Report {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: {
    transactionsAnalyzed: number;
  };
  signals: Signal[];
  knownEntities: KnownEntity[];
  mitigations: string[];
}

interface Signal {
  name: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: string;
  evidence: Evidence[];
  mitigation: string;
  confidence: number;
}

interface Evidence {
  description: string;
}

interface KnownEntity {
  address: string;
  type: string;
  name: string;
  description: string;
}

export default function PrivacyScanner() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [normalizeWalletData, setNormalizeWalletData] = useState<any>(null);
  const [generateReport, setGenerateReport] = useState<any>(null);

  useEffect(() => {
    // Dynamically import the scanner modules
    import('solana-privacy-scanner-core/normalizer')
      .then(module => setNormalizeWalletData(() => module.normalizeWalletData))
      .catch(err => console.error('Failed to load normalizer:', err));
    
    import('solana-privacy-scanner-core/scanner')
      .then(module => setGenerateReport(() => module.generateReport))
      .catch(err => console.error('Failed to load scanner:', err));
  }, []);

  const isValidAddress = address.length >= 32 && address.length <= 44;
  const canScan = isValidAddress && !loading && normalizeWalletData && generateReport;

  async function scanAddress() {
    if (!canScan) return;
    
    setLoading(true);
    setError(null);
    setReport(null);
    
    try {
      const rpc = new BrowserRPCClient(DEFAULT_RPC);
      const addr = address.trim();
      
      // Collect signatures (limit to 20 to avoid rate limits)
      const signaturesData = await rpc.getSignaturesForAddress(addr, { limit: 20 });
      const signatures = Array.isArray(signaturesData) ? signaturesData : [];
      
      // Collect transactions with rate limiting (one at a time)
      const transactions = [];
      for (let i = 0; i < Math.min(signatures.length, 20); i++) {
        const sig = signatures[i];
        try {
          const tx = await rpc.getTransaction(sig.signature);
          if (tx) {
            // Format as RawTransaction
            transactions.push({
              signature: sig.signature,
              transaction: tx,
              blockTime: tx.blockTime || null
            });
          }
          // Add delay to avoid rate limits
          if (i < signatures.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (err) {
          console.warn(`Failed to fetch transaction ${sig.signature}:`, err);
        }
      }
      
      console.log('Successfully collected:', transactions.length, 'transactions');
      
      // Create the RawWalletData structure
      const rawData = JSON.parse(JSON.stringify({
        address: addr,
        signatures: signatures,
        transactions: transactions,
        tokenAccounts: [],
      }));
      
      // Normalize data
      const context = normalizeWalletData(rawData, labelProvider);
      
      // Generate report
      const result = generateReport(context);
      
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan address');
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
    }
  }

  const getRiskColor = (risk: string) => {
    return risk === 'HIGH' ? '#ff3b30' 
      : risk === 'MEDIUM' ? '#ff9500'
      : '#34c759';
  };

  const getSeverityColor = (severity: string) => {
    return severity === 'HIGH' ? '#ff3b30'
      : severity === 'MEDIUM' ? '#ff9500'
      : '#86868b';
  };

  return (
    <div className={styles.scannerUI}>
      <div className={styles.scannerHeader}>
        <h1>Solana Privacy Scanner</h1>
        <p className={styles.tagline}>Measure your on-chain privacy exposure</p>
        <p className={styles.description}>
          Enter a Solana wallet address to analyze privacy risks.
          All analysis happens in your browser using public blockchain data.
        </p>
      </div>

      <div className={styles.scannerInputs}>
        <div className={styles.inputGroup}>
          <label>Wallet Address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            type="text"
            placeholder="e.g., CG2j5yV6XokVsDBgGdgxUSi6jSAq6oq8J83LPivwJwwb"
            onKeyUp={(e) => e.key === 'Enter' && scanAddress()}
            disabled={loading}
          />
          <span className={styles.inputHint}>Enter any Solana wallet address to scan</span>
        </div>

        <button 
          onClick={scanAddress} 
          disabled={!canScan}
          className={loading ? styles.loading : ''}
        >
          {loading ? 'Scanning...' : 'Scan Address'}
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {report && (
        <div className={styles.results}>
          <div className={styles.riskScore}>
            <div className={styles.riskBadge} style={{ backgroundColor: getRiskColor(report.overallRisk) }}>
              {report.overallRisk} RISK
            </div>
            <p className={styles.riskSummary}>
              {report.summary.transactionsAnalyzed} transactions analyzed •
              {' '}{report.signals.length} {report.signals.length === 1 ? 'risk' : 'risks'} detected
            </p>
          </div>

          {report.knownEntities.length > 0 && (
            <div className={styles.knownEntities}>
              <h3>Known Entities Detected</h3>
              <div className={styles.entityList}>
                {report.knownEntities.map((entity) => (
                  <div key={entity.address} className={styles.entityCard}>
                    <div className={styles.entityType}>{entity.type}</div>
                    <div className={styles.entityName}>{entity.name}</div>
                    <div className={styles.entityDesc}>{entity.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.signals.length > 0 ? (
            <div className={styles.signals}>
              <h3>Privacy Risks</h3>
              {report.signals.map((signal, i) => (
                <div key={i} className={styles.signalCard}>
                  <div className={styles.signalHeader}>
                    <h4>{signal.name}</h4>
                    <span className={styles.severityBadge} style={{ color: getSeverityColor(signal.severity) }}>
                      {signal.severity}
                    </span>
                  </div>
                  <p className={styles.signalReason}>{signal.reason}</p>
                  
                  <div className={styles.signalSection}>
                    <h5>Why This Matters</h5>
                    <p>{signal.impact}</p>
                  </div>

                  {signal.evidence.length > 0 && (
                    <div className={styles.signalSection}>
                      <h5>Evidence</h5>
                      <ul>
                        {signal.evidence.map((ev, j) => (
                          <li key={j}>{ev.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={styles.signalSection}>
                    <h5>What You Can Do</h5>
                    <p>{signal.mitigation}</p>
                  </div>

                  <div className={styles.confidence}>
                    Confidence: {(signal.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noRisks}>
              <div className={styles.checkmark}>✓</div>
              <h3>No significant privacy risks detected</h3>
              <p>This wallet shows good privacy hygiene based on the analyzed transactions.</p>
            </div>
          )}

          <div className={styles.recommendations}>
            <h3>Recommendations</h3>
            <ul>
              {report.mitigations.map((mitigation, i) => (
                <li key={i}>{mitigation}</li>
              ))}
            </ul>
          </div>

          <div className={styles.educational}>
            <h3>Understanding Blockchain Privacy</h3>
            <div className={styles.eduGrid}>
              <div className={styles.eduCard}>
                <h4>Wallets Are Not Anonymous</h4>
                <p>Solana addresses are pseudonymous, not anonymous. All transactions are public and permanent.</p>
              </div>
              <div className={styles.eduCard}>
                <h4>Public Activity Is Linkable</h4>
                <p>Transaction patterns, amounts, timing, and counterparties can be analyzed to link addresses.</p>
              </div>
              <div className={styles.eduCard}>
                <h4>Selective Privacy Helps</h4>
                <p>Using multiple wallets, varying patterns, and avoiding CEXs can significantly reduce exposure.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.privacyNote}>
        <p><strong>Privacy:</strong> All scanning happens in your browser. Your addresses are never sent to our servers. We use a public RPC endpoint for blockchain data.</p>
      </div>
    </div>
  );
}
