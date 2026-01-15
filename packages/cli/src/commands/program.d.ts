interface ProgramOptions {
    rpc?: string;
    json?: boolean;
    maxAccounts?: string;
    maxTransactions?: string;
    output?: string;
}
export declare function scanProgram(programId: string, options: ProgramOptions): Promise<void>;
export {};
//# sourceMappingURL=program.d.ts.map