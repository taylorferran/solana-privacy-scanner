/**
 * On-chain scanner integration
 *
 * High-level API for wallet privacy analysis
 */
import type { SkillResult } from './types.js';
export interface ScanOptions {
    address: string;
    maxSignatures?: number;
    rpcUrl?: string;
    verbose?: boolean;
}
/**
 * Scan a wallet for privacy issues
 */
export declare function scanWalletPrivacy(options: ScanOptions): Promise<SkillResult>;
/**
 * Scan a wallet and return raw JSON
 */
export declare function scanWalletPrivacyJSON(options: ScanOptions): Promise<SkillResult>;
//# sourceMappingURL=scanner.d.ts.map