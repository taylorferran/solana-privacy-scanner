// Browser-compatible RPC client
export class BrowserRPCClient {
  constructor(private endpoint: string) {}

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
