import { Connection } from '@solana/web3.js';
/**
 * Configuration for the RPC client
 */
export interface RPCClientConfig {
    /**
     * RPC endpoint URL (Helius, QuickNode, or any Solana-compatible RPC)
     */
    rpcUrl: string;
    /**
     * Maximum number of retries for failed requests
     * @default 3
     */
    maxRetries?: number;
    /**
     * Initial delay for exponential backoff (ms)
     * @default 1000
     */
    retryDelay?: number;
    /**
     * Request timeout in milliseconds
     * @default 30000
     */
    timeout?: number;
    /**
     * Maximum number of concurrent requests
     * @default 10
     */
    maxConcurrency?: number;
    /**
     * Enable debug logging
     * @default false
     */
    debug?: boolean;
}
/**
 * RPC client wrapper with rate limiting and retry logic
 *
 * This class wraps the Solana Connection and provides:
 * - Automatic retries with exponential backoff
 * - Rate limiting for concurrent requests
 * - Centralized error handling
 * - No CLI or UI logic
 */
export declare class RPCClient {
    private connection;
    private config;
    private rateLimiter;
    constructor(config: RPCClientConfig);
    /**
     * Execute an RPC call with retry logic and rate limiting
     */
    private executeWithRetry;
    /**
     * Get the underlying Solana Connection
     * Use this sparingly - prefer the wrapped methods for automatic retry/rate limiting
     */
    getConnection(): Connection;
    /**
     * Get current rate limiter stats
     */
    getStats(): {
        activeRequests: number;
        queueLength: number;
    };
    /**
     * Get signatures for an address with retry and rate limiting
     */
    getSignaturesForAddress(address: string, options?: {
        limit?: number;
        before?: string;
        until?: string;
    }): Promise<import("@solana/web3.js").ConfirmedSignatureInfo[]>;
    /**
     * Get transaction details with retry and rate limiting
     */
    getTransaction(signature: string, options?: {
        maxSupportedTransactionVersion?: number;
    }): Promise<import("@solana/web3.js").VersionedTransactionResponse | null>;
    /**
     * Get multiple transactions in parallel (respects rate limiting)
     */
    getTransactions(signatures: string[], options?: {
        maxSupportedTransactionVersion?: number;
    }): Promise<Array<any>>;
    /**
     * Get token accounts by owner with retry and rate limiting
     */
    getTokenAccountsByOwner(ownerAddress: string, mintAddress?: string): Promise<import("@solana/web3.js").RpcResponseAndContext<import("@solana/web3.js").GetProgramAccountsResponse>>;
    /**
     * Get program accounts with retry and rate limiting
     */
    getProgramAccounts(programId: string, config?: any): Promise<import("@solana/web3.js").RpcResponseAndContext<import("@solana/web3.js").GetProgramAccountsResponse>>;
    /**
     * Get account info with retry and rate limiting
     */
    getAccountInfo(address: string): Promise<import("@solana/web3.js").AccountInfo<Buffer<ArrayBufferLike>> | null>;
    /**
     * Get multiple account infos in parallel (respects rate limiting)
     */
    getMultipleAccountsInfo(addresses: string[]): Promise<(import("@solana/web3.js").AccountInfo<Buffer<ArrayBufferLike>> | null)[]>;
    /**
     * Check if the RPC connection is healthy
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=client.d.ts.map