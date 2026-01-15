import { Connection } from '@solana/web3.js';
/**
 * Rate limiter to control concurrent requests
 */
class RateLimiter {
    maxConcurrency;
    activeRequests = 0;
    queue = [];
    constructor(maxConcurrency) {
        this.maxConcurrency = maxConcurrency;
    }
    async acquire() {
        if (this.activeRequests < this.maxConcurrency) {
            this.activeRequests++;
            return;
        }
        return new Promise((resolve) => {
            this.queue.push(() => {
                this.activeRequests++;
                resolve();
            });
        });
    }
    release() {
        this.activeRequests--;
        const next = this.queue.shift();
        if (next) {
            next();
        }
    }
    getActiveCount() {
        return this.activeRequests;
    }
    getQueueLength() {
        return this.queue.length;
    }
}
/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
export class RPCClient {
    connection;
    config;
    rateLimiter;
    constructor(config) {
        this.config = {
            maxRetries: config.maxRetries ?? 3,
            retryDelay: config.retryDelay ?? 1000,
            timeout: config.timeout ?? 30000,
            maxConcurrency: config.maxConcurrency ?? 10,
            debug: config.debug ?? false,
            rpcUrl: config.rpcUrl,
        };
        const connectionConfig = {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: this.config.timeout,
        };
        this.connection = new Connection(this.config.rpcUrl, connectionConfig);
        this.rateLimiter = new RateLimiter(this.config.maxConcurrency);
        if (this.config.debug) {
            console.log(`[RPCClient] Initialized with URL: ${this.config.rpcUrl}`);
            console.log(`[RPCClient] Max concurrency: ${this.config.maxConcurrency}`);
            console.log(`[RPCClient] Max retries: ${this.config.maxRetries}`);
        }
    }
    /**
     * Execute an RPC call with retry logic and rate limiting
     */
    async executeWithRetry(operation, operationName) {
        await this.rateLimiter.acquire();
        let lastError = null;
        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                if (this.config.debug && attempt > 0) {
                    console.log(`[RPCClient] Retry attempt ${attempt} for ${operationName}`);
                }
                const result = await operation();
                this.rateLimiter.release();
                return result;
            }
            catch (error) {
                lastError = error;
                if (this.config.debug) {
                    console.error(`[RPCClient] Error in ${operationName} (attempt ${attempt + 1}/${this.config.maxRetries + 1}):`, error);
                }
                // Don't retry on last attempt
                if (attempt < this.config.maxRetries) {
                    // Exponential backoff: delay * 2^attempt
                    const delay = this.config.retryDelay * Math.pow(2, attempt);
                    await sleep(delay);
                }
            }
        }
        this.rateLimiter.release();
        throw new Error(`RPC operation ${operationName} failed after ${this.config.maxRetries + 1} attempts: ${lastError?.message}`);
    }
    /**
     * Get the underlying Solana Connection
     * Use this sparingly - prefer the wrapped methods for automatic retry/rate limiting
     */
    getConnection() {
        return this.connection;
    }
    /**
     * Get current rate limiter stats
     */
    getStats() {
        return {
            activeRequests: this.rateLimiter.getActiveCount(),
            queueLength: this.rateLimiter.getQueueLength(),
        };
    }
    /**
     * Get signatures for an address with retry and rate limiting
     */
    async getSignaturesForAddress(address, options) {
        return this.executeWithRetry(async () => {
            const { PublicKey } = await import('@solana/web3.js');
            return this.connection.getSignaturesForAddress(new PublicKey(address), options);
        }, `getSignaturesForAddress(${address})`);
    }
    /**
     * Get transaction details with retry and rate limiting
     */
    async getTransaction(signature, options) {
        return this.executeWithRetry(async () => {
            return this.connection.getTransaction(signature, {
                maxSupportedTransactionVersion: options?.maxSupportedTransactionVersion ?? 0,
            });
        }, `getTransaction(${signature})`);
    }
    /**
     * Get multiple transactions in parallel (respects rate limiting)
     */
    async getTransactions(signatures, options) {
        const promises = signatures.map((sig) => this.getTransaction(sig, options));
        return Promise.all(promises);
    }
    /**
     * Get token accounts by owner with retry and rate limiting
     */
    async getTokenAccountsByOwner(ownerAddress, mintAddress) {
        return this.executeWithRetry(async () => {
            const { PublicKey } = await import('@solana/web3.js');
            const owner = new PublicKey(ownerAddress);
            // SPL Token Program ID
            const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
            if (mintAddress) {
                const mint = new PublicKey(mintAddress);
                return this.connection.getTokenAccountsByOwner(owner, { mint });
            }
            else {
                return this.connection.getTokenAccountsByOwner(owner, {
                    programId: TOKEN_PROGRAM_ID,
                });
            }
        }, `getTokenAccountsByOwner(${ownerAddress})`);
    }
    /**
     * Get program accounts with retry and rate limiting
     */
    async getProgramAccounts(programId, config) {
        return this.executeWithRetry(async () => {
            const { PublicKey } = await import('@solana/web3.js');
            return this.connection.getProgramAccounts(new PublicKey(programId), config);
        }, `getProgramAccounts(${programId})`);
    }
    /**
     * Get account info with retry and rate limiting
     */
    async getAccountInfo(address) {
        return this.executeWithRetry(async () => {
            const { PublicKey } = await import('@solana/web3.js');
            return this.connection.getAccountInfo(new PublicKey(address));
        }, `getAccountInfo(${address})`);
    }
    /**
     * Get multiple account infos in parallel (respects rate limiting)
     */
    async getMultipleAccountsInfo(addresses) {
        return this.executeWithRetry(async () => {
            const { PublicKey } = await import('@solana/web3.js');
            const pubkeys = addresses.map((addr) => new PublicKey(addr));
            return this.connection.getMultipleAccountsInfo(pubkeys);
        }, `getMultipleAccountsInfo(${addresses.length} addresses)`);
    }
    /**
     * Check if the RPC connection is healthy
     */
    async healthCheck() {
        try {
            const version = await this.executeWithRetry(() => this.connection.getVersion(), 'healthCheck');
            return !!version;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=client.js.map