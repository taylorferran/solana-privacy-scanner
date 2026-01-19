# Powered by QuickNode

Solana Privacy Scanner uses **[QuickNode](https://www.quicknode.com/)** for reliable Solana RPC access.

## Why QuickNode

- **99.9% uptime SLA**
- **Response times under 100ms**
- **Global edge network**
- **Zero configuration required**

## Performance

**Wallet scanning (with QuickNode):**
- 100 transactions: ~3-5 seconds
- 500 transactions: ~15-20 seconds
- 1000 transactions: ~30-40 seconds

**Wallet scanning (public RPC):**
- 100 transactions: ~10-30 seconds (variable)
- 500 transactions: Often fails
- 1000 transactions: Usually times out

## Default vs Custom RPC

### Default (Included)
Perfect for:
- Personal projects
- Learning and testing
- Development
- Educational use

No setup needed - just install and use.

### Custom RPC (Production)
Get your own [QuickNode endpoint](https://www.quicknode.com/) for:
- Commercial applications
- High-volume scanning (1000+ wallets/day)
- Custom rate limits
- SLA requirements

```typescript
import { RPCClient } from 'solana-privacy-scanner-core';

const rpc = new RPCClient({
  rpcUrl: process.env.QUICKNODE_RPC_URL
});
```

## Technical Details

**RPC calls per scan:**
- Wallet (100 txs): ~101 calls
- Transaction: 1 call
- Program (100 txs): ~101 calls

**Built-in optimizations:**
- Rate limiting: 5 req/s
- Retry logic: 3 retries with exponential backoff
- Graceful degradation on failures

