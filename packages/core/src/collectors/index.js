/**
 * Collects raw wallet data from Solana RPC
 */
export async function collectWalletData(client, address, options = {}) {
    const maxSignatures = options.maxSignatures ?? 100;
    const includeTokenAccounts = options.includeTokenAccounts ?? true;
    // Fetch recent signatures (bounded)
    const signatures = await client.getSignaturesForAddress(address, {
        limit: maxSignatures,
    });
    // Fetch transactions for all signatures
    const transactions = [];
    // Process in batches to avoid overwhelming the RPC
    const BATCH_SIZE = 10;
    for (let i = 0; i < signatures.length; i += BATCH_SIZE) {
        const batch = signatures.slice(i, i + BATCH_SIZE);
        const batchSignatures = batch.map((sig) => sig.signature);
        const txs = await client.getTransactions(batchSignatures, {
            maxSupportedTransactionVersion: 0,
        });
        for (let j = 0; j < batch.length; j++) {
            transactions.push({
                signature: batch[j].signature,
                transaction: txs[j],
                blockTime: batch[j].blockTime,
            });
        }
    }
    // Fetch token accounts
    let tokenAccounts = [];
    if (includeTokenAccounts) {
        try {
            const response = await client.getTokenAccountsByOwner(address);
            tokenAccounts = response.value;
        }
        catch (error) {
            // Token accounts might not exist or query might fail - that's okay
            console.warn(`Failed to fetch token accounts for ${address}:`, error);
        }
    }
    return {
        address,
        signatures,
        transactions,
        tokenAccounts,
    };
}
/**
 * Collects raw transaction data from Solana RPC
 */
export async function collectTransactionData(client, signature) {
    // Fetch full transaction with metadata
    const transaction = await client.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
    });
    return {
        signature,
        transaction: transaction,
        blockTime: transaction?.blockTime ?? null,
    };
}
/**
 * Collects raw program data from Solana RPC
 */
export async function collectProgramData(client, programId, options = {}) {
    const maxAccounts = options.maxAccounts ?? 100;
    const maxTransactions = options.maxTransactions ?? 50;
    // Fetch program accounts (limited)
    let accounts = [];
    try {
        const response = await client.getProgramAccounts(programId, {
            encoding: 'jsonParsed',
            dataSlice: { offset: 0, length: 0 }, // Don't fetch full account data
        });
        accounts = response.slice(0, maxAccounts).map((acc) => ({
            pubkey: acc.pubkey.toString(),
            account: acc.account,
        }));
    }
    catch (error) {
        console.warn(`Failed to fetch program accounts for ${programId}:`, error);
    }
    // Fetch recent signatures for the program
    let signatures = [];
    try {
        signatures = await client.getSignaturesForAddress(programId, {
            limit: maxTransactions,
        });
    }
    catch (error) {
        console.warn(`Failed to fetch signatures for program ${programId}:`, error);
    }
    // Fetch transactions for those signatures
    const relatedTransactions = [];
    const BATCH_SIZE = 10;
    for (let i = 0; i < Math.min(signatures.length, maxTransactions); i += BATCH_SIZE) {
        const batch = signatures.slice(i, i + BATCH_SIZE);
        const batchSignatures = batch.map((sig) => sig.signature);
        try {
            const txs = await client.getTransactions(batchSignatures, {
                maxSupportedTransactionVersion: 0,
            });
            for (let j = 0; j < batch.length; j++) {
                relatedTransactions.push({
                    signature: batch[j].signature,
                    transaction: txs[j],
                    blockTime: batch[j].blockTime,
                });
            }
        }
        catch (error) {
            console.warn(`Failed to fetch transaction batch for program ${programId}:`, error);
        }
    }
    return {
        programId,
        accounts,
        relatedTransactions,
    };
}
//# sourceMappingURL=index.js.map