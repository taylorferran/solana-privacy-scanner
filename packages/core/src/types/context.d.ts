import type { Label } from './label.js';
/**
 * Normalized transfer data
 */
export interface Transfer {
    from: string;
    to: string;
    amount: number;
    token?: string;
    signature: string;
    blockTime: number | null;
}
/**
 * Categorized instruction type
 */
export type InstructionCategory = 'transfer' | 'swap' | 'stake' | 'vote' | 'program_interaction' | 'token_operation' | 'unknown';
/**
 * Normalized instruction data
 */
export interface NormalizedInstruction {
    programId: string;
    category: InstructionCategory;
    signature: string;
    blockTime: number | null;
    data?: Record<string, unknown>;
}
/**
 * Context object containing all normalized data for heuristic evaluation
 */
export interface ScanContext {
    /**
     * The target being scanned
     */
    target: string;
    /**
     * Type of scan
     */
    targetType: 'wallet' | 'transaction' | 'program';
    /**
     * All normalized transfers
     */
    transfers: Transfer[];
    /**
     * All normalized instructions
     */
    instructions: NormalizedInstruction[];
    /**
     * Unique counterparty addresses
     */
    counterparties: Set<string>;
    /**
     * Labeled entities encountered
     */
    labels: Map<string, Label>;
    /**
     * Token accounts (for wallet scans)
     */
    tokenAccounts: Array<{
        mint: string;
        address: string;
        balance: number;
    }>;
    /**
     * Time range of analyzed activity
     */
    timeRange: {
        earliest: number | null;
        latest: number | null;
    };
    /**
     * Total number of transactions analyzed
     */
    transactionCount: number;
}
//# sourceMappingURL=context.d.ts.map