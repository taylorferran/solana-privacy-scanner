/**
 * scan-wallet skill handler
 *
 * Performs on-chain wallet privacy analysis using the core library
 */
import type { SkillResult } from '../../src/types.js';
export interface ScanWalletOptions {
    address: string;
    maxSignatures?: number;
    rpcUrl?: string;
    json?: boolean;
    verbose?: boolean;
}
/**
 * Execute on-chain wallet privacy analysis
 */
export declare function scanWallet(options: ScanWalletOptions): Promise<SkillResult>;
/**
 * CLI entry point for testing
 */
export declare function main(): Promise<void>;
//# sourceMappingURL=handler.d.ts.map