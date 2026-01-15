interface WalletOptions {
    rpc?: string;
    json?: boolean;
    maxSignatures?: string;
    output?: string;
}
export declare function scanWallet(address: string, options: WalletOptions): Promise<void>;
export {};
//# sourceMappingURL=wallet.d.ts.map