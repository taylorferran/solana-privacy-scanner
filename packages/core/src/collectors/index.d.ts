import type { RPCClient } from '../rpc/client.js';
import type { ConfirmedSignatureInfo, ParsedTransactionWithMeta, TokenAccountBalancePair } from '@solana/web3.js';
/**
 * Raw transaction data fetched from RPC
 */
export interface RawTransaction {
    signature: string;
    transaction: ParsedTransactionWithMeta | null;
    blockTime: number | null;
}
/**
 * Raw wallet data collection result
 */
export interface RawWalletData {
    address: string;
    signatures: ConfirmedSignatureInfo[];
    transactions: RawTransaction[];
    tokenAccounts: TokenAccountBalancePair[];
}
/**
 * Raw transaction scan result
 */
export interface RawTransactionData {
    signature: string;
    transaction: ParsedTransactionWithMeta | null;
    blockTime: number | null;
}
/**
 * Raw program data collection result
 */
export interface RawProgramData {
    programId: string;
    accounts: Array<{
        pubkey: string;
        account: any;
    }>;
    relatedTransactions: RawTransaction[];
}
/**
 * Options for wallet data collection
 */
export interface WalletCollectionOptions {
    /**
     * Maximum number of signatures to fetch
     * @default 100
     */
    maxSignatures?: number;
    /**
     * Fetch token accounts
     * @default true
     */
    includeTokenAccounts?: boolean;
}
/**
 * Options for program data collection
 */
export interface ProgramCollectionOptions {
    /**
     * Maximum number of accounts to fetch
     * @default 100
     */
    maxAccounts?: number;
    /**
     * Maximum number of related transactions to fetch
     * @default 50
     */
    maxTransactions?: number;
}
/**
 * Collects raw wallet data from Solana RPC
 */
export declare function collectWalletData(client: RPCClient, address: string, options?: WalletCollectionOptions): Promise<RawWalletData>;
/**
 * Collects raw transaction data from Solana RPC
 */
export declare function collectTransactionData(client: RPCClient, signature: string): Promise<RawTransactionData>;
/**
 * Collects raw program data from Solana RPC
 */
export declare function collectProgramData(client: RPCClient, programId: string, options?: ProgramCollectionOptions): Promise<RawProgramData>;
//# sourceMappingURL=index.d.ts.map