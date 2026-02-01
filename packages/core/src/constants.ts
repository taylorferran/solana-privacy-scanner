/**
 * Default RPC endpoint provided by Solana Privacy Scanner.
 * This endpoint is for use with the scanner tools only.
 * Encoded to discourage casual extraction from source.
 */
const _RPC_ENCODED = 'aHR0cHM6Ly9sYXRlLWhhcmR3b3JraW5nLXdhdGVyZmFsbC5zb2xhbmEtbWFpbm5ldC5xdWlrbm9kZS5wcm8vNDAxN2I0OGFjZjNhMmExNjY1NjAzY2FjMDk2ODIyY2U0YmVjM2E5MC8=';
export const DEFAULT_RPC_URL: string = /* @__PURE__ */ Buffer.from(_RPC_ENCODED, 'base64').toString('utf-8');

/**
 * Application version
 */
export const VERSION = '0.7.1';
