<script setup>
import { ref, computed } from 'vue'
import { normalizeWalletData } from 'solana-privacy-scanner-core/normalizer'
import { generateReport } from 'solana-privacy-scanner-core/scanner'
import { BrowserRPCClient } from '../utils/browser-rpc'
import knownAddresses from '../../../packages/core/src/labels/known-addresses.json'

const address = ref('')
const rpcUrl = ref('')
const loading = ref(false)
const report = ref(null)
const error = ref(null)

const isValidAddress = computed(() => {
  return address.value.length >= 32 && address.value.length <= 44
})

const isValidRpc = computed(() => {
  const url = rpcUrl.value.trim()
  return url.startsWith('http://') || url.startsWith('https://')
})

const canScan = computed(() => {
  return isValidAddress.value && isValidRpc.value && !loading.value
})

// Create a browser-compatible label provider
const labelProvider = {
  lookup(address) {
    return knownAddresses.labels.find(label => label.address === address) || null
  },
  lookupMany(addresses) {
    const results = new Map()
    for (const address of addresses) {
      const label = this.lookup(address)
      if (label) {
        results.set(address, label)
      }
    }
    return results
  }
}

async function scanAddress() {
  if (!canScan.value) return
  
  loading.value = true
  error.value = null
  report.value = null
  
  try {
    const rpc = new BrowserRPCClient(rpcUrl.value.trim())
    const addr = address.value.trim()
    
    // Collect signatures (limit to 20 to avoid rate limits)
    const signaturesData = await rpc.getSignaturesForAddress(addr, { limit: 20 })
    const signatures = Array.isArray(signaturesData) ? signaturesData : []
    
    // Collect transactions with rate limiting (one at a time)
    const transactions = []
    for (let i = 0; i < Math.min(signatures.length, 20); i++) {
      const sig = signatures[i]
      try {
        const tx = await rpc.getTransaction(sig.signature)
        if (tx) {
          // Format as RawTransaction
          transactions.push({
            signature: sig.signature,
            transaction: tx,
            blockTime: tx.blockTime || null
          })
        }
        // Add delay to avoid rate limits
        if (i < signatures.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (err) {
        console.warn(`Failed to fetch transaction ${sig.signature}:`, err)
      }
    }
    
    console.log('Successfully collected:', transactions.length, 'transactions')
    
    // Create the RawWalletData structure - ensure it's a plain object
    const rawData = JSON.parse(JSON.stringify({
      address: addr,
      signatures: signatures,
      transactions: transactions,
      tokenAccounts: [],
    }))
    
    console.log('Calling normalizeWalletData with:', {
      address: addr,
      transactionsCount: rawData.transactions.length,
      isArray: Array.isArray(rawData.transactions)
    })
    
    // Normalize data - pass rawData first, then labelProvider
    const context = normalizeWalletData(rawData, labelProvider)
    
    // Generate report
    const result = generateReport(context)
    
    report.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to scan address'
    console.error('Scan error:', err)
  } finally {
    loading.value = false
  }
}

function getRiskColor(risk) {
  return risk === 'HIGH' ? '#ff3b30' 
    : risk === 'MEDIUM' ? '#ff9500'
    : '#34c759'
}

function getSeverityColor(severity) {
  return severity === 'HIGH' ? '#ff3b30'
    : severity === 'MEDIUM' ? '#ff9500'
    : '#86868b'
}
</script>

<template>
  <div class="scanner-ui">
    <div class="scanner-header">
      <h1>Solana Privacy Scanner</h1>
      <p class="tagline">Measure your on-chain privacy exposure</p>
      <p class="description">
        Enter a Solana wallet address and your RPC endpoint to analyze privacy risks.
        All analysis happens in your browser using public blockchain data.
      </p>
    </div>

    <div class="scanner-inputs">
      <div class="input-group">
        <label>Solana RPC Endpoint</label>
        <input
          v-model="rpcUrl"
          type="text"
          placeholder="https://api.mainnet-beta.solana.com"
          :disabled="loading"
        />
        <span class="input-hint">Get a free RPC from Helius, QuickNode, or Alchemy</span>
      </div>

      <div class="input-group">
        <label>Wallet Address</label>
        <input
          v-model="address"
          type="text"
          placeholder="Enter Solana wallet address"
          @keyup.enter="scanAddress"
          :disabled="loading"
        />
      </div>

      <button 
        @click="scanAddress" 
        :disabled="!canScan"
        :class="{ loading }"
      >
        {{ loading ? 'Scanning...' : 'Scan Address' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="report" class="results">
      <div class="risk-score">
        <div class="risk-badge" :style="{ backgroundColor: getRiskColor(report.overallRisk) }">
          {{ report.overallRisk }} RISK
        </div>
        <p class="risk-summary">
          {{ report.summary.transactionsAnalyzed }} transactions analyzed •
          {{ report.signals.length }} {{ report.signals.length === 1 ? 'risk' : 'risks' }} detected
        </p>
      </div>

      <div v-if="report.knownEntities.length > 0" class="known-entities">
        <h3>Known Entities Detected</h3>
        <div class="entity-list">
          <div v-for="entity in report.knownEntities" :key="entity.address" class="entity-card">
            <div class="entity-type">{{ entity.type }}</div>
            <div class="entity-name">{{ entity.name }}</div>
            <div class="entity-desc">{{ entity.description }}</div>
          </div>
        </div>
      </div>

      <div v-if="report.signals.length > 0" class="signals">
        <h3>Privacy Risks</h3>
        <div v-for="(signal, i) in report.signals" :key="i" class="signal-card">
          <div class="signal-header">
            <h4>{{ signal.name }}</h4>
            <span class="severity-badge" :style="{ color: getSeverityColor(signal.severity) }">
              {{ signal.severity }}
            </span>
          </div>
          <p class="signal-reason">{{ signal.reason }}</p>
          
          <div class="signal-section">
            <h5>Why This Matters</h5>
            <p>{{ signal.impact }}</p>
          </div>

          <div v-if="signal.evidence.length > 0" class="signal-section">
            <h5>Evidence</h5>
            <ul>
              <li v-for="(ev, j) in signal.evidence" :key="j">{{ ev.description }}</li>
            </ul>
          </div>

          <div class="signal-section">
            <h5>What You Can Do</h5>
            <p>{{ signal.mitigation }}</p>
          </div>

          <div class="confidence">
            Confidence: {{ (signal.confidence * 100).toFixed(0) }}%
          </div>
        </div>
      </div>

      <div v-else class="no-risks">
        <div class="checkmark">✓</div>
        <h3>No significant privacy risks detected</h3>
        <p>This wallet shows good privacy hygiene based on the analyzed transactions.</p>
      </div>

      <div class="recommendations">
        <h3>Recommendations</h3>
        <ul>
          <li v-for="(mitigation, i) in report.mitigations" :key="i">{{ mitigation }}</li>
        </ul>
      </div>

      <div class="educational">
        <h3>Understanding Blockchain Privacy</h3>
        <div class="edu-grid">
          <div class="edu-card">
            <h4>Wallets Are Not Anonymous</h4>
            <p>Solana addresses are pseudonymous, not anonymous. All transactions are public and permanent.</p>
          </div>
          <div class="edu-card">
            <h4>Public Activity Is Linkable</h4>
            <p>Transaction patterns, amounts, timing, and counterparties can be analyzed to link addresses.</p>
          </div>
          <div class="edu-card">
            <h4>Selective Privacy Helps</h4>
            <p>Using multiple wallets, varying patterns, and avoiding CEXs can significantly reduce exposure.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="privacy-note">
      <p><strong>Privacy:</strong> All scanning happens in your browser. Your RPC endpoint and addresses are never sent to our servers.</p>
    </div>
  </div>
</template>

<style scoped>
.scanner-ui {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px 60px;
  overflow: visible;
}

.scanner-header {
  text-align: center;
  margin-bottom: 48px;
  padding-top: 0;
  overflow: visible;
}

.scanner-header h1 {
  font-size: 56px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 16px 0;
  padding: 10px 0;
  background: linear-gradient(135deg, #1a1a1a 0%, #505053 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  overflow: visible;
}

.dark .scanner-header h1 {
  background: linear-gradient(135deg, #f5f5f7 0%, #a1a1a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 24px;
  font-weight: 400;
  color: var(--vp-c-text-2);
  margin: 0 0 24px 0;
}

.description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
  max-width: 600px;
  margin: 0 auto;
}

.scanner-inputs {
  margin-bottom: 32px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.input-group input {
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  transition: all 0.2s;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: var(--vp-c-brand-accent);
  box-shadow: 0 0 0 3px rgba(94, 92, 230, 0.1);
}

.input-hint {
  display: block;
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin-top: 6px;
}

.scanner-inputs button {
  width: 100%;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 500;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 980px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.scanner-inputs button:hover:not(:disabled) {
  background: #2c2c2c;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.scanner-inputs button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dark .scanner-inputs button {
  background: #f5f5f7;
  color: #1a1a1a;
}

.dark .scanner-inputs button:hover:not(:disabled) {
  background: #ffffff;
}

.privacy-note {
  text-align: center;
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  margin-top: 48px;
}

.privacy-note p {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin: 0;
}

.error-message {
  padding: 16px 20px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 12px;
  color: #ff3b30;
  text-align: center;
  margin-bottom: 24px;
}

.results {
  margin-top: 48px;
}

.risk-score {
  text-align: center;
  padding: 40px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  margin-bottom: 32px;
}

.risk-badge {
  display: inline-block;
  padding: 12px 32px;
  border-radius: 980px;
  color: white;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.risk-summary {
  color: var(--vp-c-text-2);
  font-size: 16px;
  margin: 0;
}

.known-entities {
  margin-bottom: 32px;
}

.known-entities h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.entity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.entity-card {
  padding: 20px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.entity-type {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
  margin-bottom: 8px;
}

.entity-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}

.entity-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.signals h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.signal-card {
  padding: 32px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  margin-bottom: 16px;
}

.signal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.signal-header h4 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.severity-badge {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.signal-reason {
  font-size: 16px;
  color: var(--vp-c-text-2);
  margin-bottom: 24px;
}

.signal-section {
  margin-bottom: 20px;
}

.signal-section h5 {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
  margin-bottom: 8px;
}

.signal-section p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0;
}

.signal-section ul {
  margin: 0;
  padding-left: 20px;
}

.signal-section li {
  font-size: 15px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 4px 0;
}

.confidence {
  font-size: 14px;
  color: var(--vp-c-text-3);
  margin-top: 16px;
}

.no-risks {
  text-align: center;
  padding: 60px 40px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  margin-bottom: 32px;
}

.checkmark {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  background: #34c759;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 300;
}

.no-risks h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.no-risks p {
  font-size: 16px;
  color: var(--vp-c-text-2);
  margin: 0;
}

.recommendations {
  margin-bottom: 48px;
}

.recommendations h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.recommendations ul {
  list-style: none;
  padding: 0;
}

.recommendations li {
  padding: 16px 20px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 15px;
  line-height: 1.6;
}

.educational {
  margin-bottom: 48px;
}

.educational h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
}

.edu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.edu-card {
  padding: 28px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
}

.edu-card h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.edu-card p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding-top: 48px;
  border-top: 1px solid var(--vp-c-divider);
}

.footer-links a {
  font-size: 16px;
  font-weight: 500;
  color: var(--vp-c-brand-accent);
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--vp-c-brand-accent-hover);
}

@media (max-width: 768px) {
  .scanner-header h1 {
    font-size: 40px;
  }
  
  .edu-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
