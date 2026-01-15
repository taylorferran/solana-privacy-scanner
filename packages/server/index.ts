import express from 'express';
import cors from 'cors';
import { scan, RPCClient } from '@solana-privacy-scanner/core';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize RPC client
const rpc = new RPCClient(process.env.SOLANA_RPC || '');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Scan endpoint
app.post('/api/scan', async (req, res) => {
  try {
    const { address, maxSignatures = 50 } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Validate address format (basic check)
    if (address.length < 32 || address.length > 44) {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }

    const report = await scan({
      target: address,
      targetType: 'wallet',
      rpcClient: rpc,
      maxSignatures: Math.min(maxSignatures, 100), // Cap at 100
    });

    res.json(report);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      error: 'Failed to scan address',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Privacy Scanner API running on port ${PORT}`);
});
