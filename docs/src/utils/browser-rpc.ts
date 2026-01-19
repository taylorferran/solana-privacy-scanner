// Default RPC endpoint
const DEFAULT_RPC_URL = 'https://late-hardworking-waterfall.solana-mainnet.quiknode.pro/4017b48acf3a2a1665603cac096822ce4bec3a90/';

// Browser-compatible RPC client
export class BrowserRPCClient {
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || DEFAULT_RPC_URL;
  }

  async call(method: string, params: any[] = []) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    })

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`)
    }

    return data.result
  }

  async getSignaturesForAddress(address: string, options: any = {}) {
    return this.call('getSignaturesForAddress', [address, options])
  }

  async getTransaction(signature: string) {
    return this.call('getTransaction', [signature, { maxSupportedTransactionVersion: 0 }])
  }

  async getMultipleAccountsInfo(pubkeys: string[]) {
    return this.call('getMultipleAccountsInfo', [pubkeys, { encoding: 'jsonParsed' }])
  }
}
