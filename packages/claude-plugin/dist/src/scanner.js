/**
 * On-chain scanner integration
 *
 * High-level API for wallet privacy analysis
 */
import { scanWallet } from '../skills/scan-wallet/handler.js';
/**
 * Scan a wallet for privacy issues
 */
export async function scanWalletPrivacy(options) {
    return scanWallet({
        address: options.address,
        maxSignatures: options.maxSignatures,
        rpcUrl: options.rpcUrl,
        json: false,
        verbose: options.verbose,
    });
}
/**
 * Scan a wallet and return raw JSON
 */
export async function scanWalletPrivacyJSON(options) {
    return scanWallet({
        address: options.address,
        maxSignatures: options.maxSignatures,
        rpcUrl: options.rpcUrl,
        json: true,
        verbose: options.verbose,
    });
}
//# sourceMappingURL=scanner.js.map