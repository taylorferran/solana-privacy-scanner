import type {
  Transfer,
  NormalizedInstruction,
  InstructionCategory,
  ScanContext,
  LabelProvider,
} from '../types/index.js';
import type {
  RawWalletData,
  RawTransactionData,
  RawProgramData,
} from '../collectors/index.js';
import type { ParsedTransactionWithMeta, PartiallyDecodedInstruction, ParsedInstruction } from '@solana/web3.js';

/**
 * Known program IDs for instruction categorization
 */
const PROGRAM_IDS = {
  SYSTEM: '11111111111111111111111111111111',
  TOKEN: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  ASSOCIATED_TOKEN: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  STAKE: 'Stake11111111111111111111111111111111111111',
  VOTE: 'Vote111111111111111111111111111111111111111',
  MEMO: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
  MEMO_V1: 'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo',
};

/**
 * Extract SOL transfers from a parsed transaction
 */
function extractSOLTransfers(
  tx: ParsedTransactionWithMeta,
  signature: string
): Transfer[] {
  const transfers: Transfer[] = [];

  if (!tx.meta || !tx.transaction) {
    return transfers;
  }

  const preBalances = tx.meta.preBalances;
  const postBalances = tx.meta.postBalances;
  const accountKeys = tx.transaction.message.accountKeys;

  // Defensive checks
  if (!accountKeys || !Array.isArray(accountKeys) || accountKeys.length === 0) {
    return transfers;
  }

  if (!preBalances || !postBalances) {
    return transfers;
  }

  // Compare pre and post balances to find transfers
  for (let i = 0; i < accountKeys.length; i++) {
    const pre = preBalances[i];
    const post = postBalances[i];
    
    // Skip if balances are undefined
    if (pre === undefined || post === undefined) {
      continue;
    }
    
    const diff = post - pre;

    // Skip if no change or if it's fee-related (usually account 0)
    if (diff === 0) continue;

    const account = accountKeys[i];
    if (!account) continue;
    
    const address = typeof account === 'string' ? account : account.pubkey?.toString();
    if (!address) continue;

    // If balance increased, this account received SOL
    if (diff > 0) {
      // Find who sent it (simple heuristic: first account with decreased balance)
      for (let j = 0; j < accountKeys.length; j++) {
        const preSender = preBalances[j];
        const postSender = postBalances[j];
        
        if (preSender === undefined || postSender === undefined) {
          continue;
        }
        
        if (postSender < preSender) {
          const sender = accountKeys[j];
          if (!sender) continue;
          
          const senderAddress = typeof sender === 'string' ? sender : sender.pubkey?.toString();
          if (!senderAddress) continue;
          
          transfers.push({
            from: senderAddress,
            to: address,
            amount: diff / 1e9, // Convert lamports to SOL
            token: undefined,
            signature,
            blockTime: tx.blockTime,
          });
          break;
        }
      }
    }
  }

  return transfers;
}

/**
 * Extract SPL token transfers from a parsed transaction
 */
function extractSPLTransfers(
  tx: ParsedTransactionWithMeta,
  signature: string
): Transfer[] {
  const transfers: Transfer[] = [];

  if (!tx.meta || !tx.meta.postTokenBalances || !tx.meta.preTokenBalances) {
    return transfers;
  }

  const preTokenBalances = tx.meta.preTokenBalances;
  const postTokenBalances = tx.meta.postTokenBalances;

  // Create a map of account index to token balance changes
  const balanceChanges = new Map<number, { mint: string; change: number; decimals: number }>();

  // Calculate changes
  for (const post of postTokenBalances) {
    const pre = preTokenBalances.find(
      (p) => p.accountIndex === post.accountIndex && p.mint === post.mint
    );

    const preAmount = pre?.uiTokenAmount.uiAmount ?? 0;
    const postAmount = post.uiTokenAmount.uiAmount ?? 0;
    const change = postAmount - preAmount;

    if (change !== 0) {
      balanceChanges.set(post.accountIndex, {
        mint: post.mint,
        change,
        decimals: post.uiTokenAmount.decimals,
      });
    }
  }

  // Match senders and receivers
  const accountKeys = tx.transaction.message.accountKeys;
  
  if (!accountKeys || !Array.isArray(accountKeys)) {
    return transfers;
  }
  
  balanceChanges.forEach((info, accountIndex) => {
    if (accountIndex >= accountKeys.length) {
      return; // Skip if index out of bounds
    }
    
    const account = accountKeys[accountIndex];
    if (!account) return;
    
    const address = typeof account === 'string' ? account : account.pubkey?.toString();
    if (!address) return;

    if (info.change > 0) {
      // This account received tokens - find sender
      balanceChanges.forEach((senderInfo, senderIndex) => {
        if (
          senderInfo.mint === info.mint &&
          senderInfo.change < 0 &&
          senderIndex !== accountIndex &&
          senderIndex < accountKeys.length
        ) {
          const sender = accountKeys[senderIndex];
          if (!sender) return;
          
          const senderAddress = typeof sender === 'string' ? sender : sender.pubkey?.toString();
          if (!senderAddress) return;

          transfers.push({
            from: senderAddress,
            to: address,
            amount: info.change,
            token: info.mint,
            signature,
            blockTime: tx.blockTime,
          });
        }
      });
    }
  });

  return transfers;
}

/**
 * Categorize an instruction based on program ID and instruction type
 */
function categorizeInstruction(
  instruction: ParsedInstruction | PartiallyDecodedInstruction
): InstructionCategory {
  const programId = instruction.programId.toString();

  // System program instructions
  if (programId === PROGRAM_IDS.SYSTEM) {
    if ('parsed' in instruction && instruction.parsed.type) {
      const type = instruction.parsed.type;
      if (type === 'transfer' || type === 'transferWithSeed') {
        return 'transfer';
      }
    }
    return 'transfer';
  }

  // Token program instructions
  if (programId === PROGRAM_IDS.TOKEN || programId === PROGRAM_IDS.ASSOCIATED_TOKEN) {
    if ('parsed' in instruction && instruction.parsed.type) {
      const type = instruction.parsed.type;
      if (type === 'transfer' || type === 'transferChecked') {
        return 'transfer';
      }
      return 'token_operation';
    }
    return 'token_operation';
  }

  // Stake program
  if (programId === PROGRAM_IDS.STAKE) {
    return 'stake';
  }

  // Vote program
  if (programId === PROGRAM_IDS.VOTE) {
    return 'vote';
  }

  // Check for common swap programs (simplified heuristic)
  if (
    programId.includes('Swap') ||
    programId.includes('swap') ||
    programId === 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4' || // Jupiter
    programId === 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc' // Orca Whirlpool
  ) {
    return 'swap';
  }

  // Default to program interaction
  return 'program_interaction';
}

/**
 * Extract normalized instructions from a transaction
 */
function extractInstructions(
  tx: ParsedTransactionWithMeta,
  signature: string
): NormalizedInstruction[] {
  const instructions: NormalizedInstruction[] = [];

  if (!tx.transaction || !tx.transaction.message) {
    return instructions;
  }

  const message = tx.transaction.message;
  const allInstructions = message.instructions;

  // Defensive check
  if (!allInstructions || !Array.isArray(allInstructions)) {
    return instructions;
  }

  for (const instruction of allInstructions) {
    // Defensive check for programId
    if (!instruction || !instruction.programId) {
      continue;
    }
    
    const programId = instruction.programId.toString();
    const category = categorizeInstruction(instruction);

    let data: Record<string, unknown> | undefined;
    if ('parsed' in instruction) {
      data = instruction.parsed as Record<string, unknown>;
    }

    instructions.push({
      programId,
      category,
      signature,
      blockTime: tx.blockTime,
      data,
    });
  }

  return instructions;
}

/**
 * Extract unique counterparties from transfers
 */
function extractCounterparties(transfers: Transfer[], targetAddress: string): Set<string> {
  const counterparties = new Set<string>();

  for (const transfer of transfers) {
    // Add the other party in the transfer
    if (transfer.from === targetAddress) {
      counterparties.add(transfer.to);
    } else if (transfer.to === targetAddress) {
      counterparties.add(transfer.from);
    }
  }

  return counterparties;
}

/**
 * Calculate time range from transactions
 */
function calculateTimeRange(transactions: RawTransactionData[]): {
  earliest: number | null;
  latest: number | null;
} {
  let earliest: number | null = null;
  let latest: number | null = null;

  for (const tx of transactions) {
    if (tx.blockTime) {
      if (earliest === null || tx.blockTime < earliest) {
        earliest = tx.blockTime;
      }
      if (latest === null || tx.blockTime > latest) {
        latest = tx.blockTime;
      }
    }
  }

  return { earliest, latest };
}

/**
 * Normalize wallet data into a ScanContext
 */
export function normalizeWalletData(
  rawData: RawWalletData,
  labelProvider?: LabelProvider
): ScanContext {
  const allTransfers: Transfer[] = [];
  const allInstructions: NormalizedInstruction[] = [];

  // Ensure transactions exists and is an array
  const transactions = rawData.transactions || [];

  // Process each transaction
  for (const rawTx of transactions) {
    if (!rawTx.transaction) continue;

    try {
      // Extract transfers
      const solTransfers = extractSOLTransfers(rawTx.transaction, rawTx.signature);
      const splTransfers = extractSPLTransfers(rawTx.transaction, rawTx.signature);
      allTransfers.push(...solTransfers, ...splTransfers);

      // Extract instructions
      const instructions = extractInstructions(rawTx.transaction, rawTx.signature);
      allInstructions.push(...instructions);
    } catch (error) {
      // Skip problematic transactions but continue processing
      console.warn(`Failed to normalize transaction ${rawTx.signature}:`, error);
      continue;
    }
  }

  // Extract counterparties
  const counterparties = extractCounterparties(allTransfers, rawData.address);

  // Look up labels for counterparties if provider is available
  const labels = labelProvider 
    ? labelProvider.lookupMany(Array.from(counterparties))
    : new Map();

  // Calculate time range
  const timeRange = calculateTimeRange(transactions);

  // Normalize token accounts
  const tokenAccounts = rawData.tokenAccounts.map((ta) => {
    try {
      return {
        mint: ta.account.data.parsed.info.mint,
        address: ta.pubkey.toString(),
        balance: ta.account.data.parsed.info.tokenAmount.uiAmount ?? 0,
      };
    } catch (error) {
      // Skip malformed token accounts
      return null;
    }
  }).filter((ta): ta is NonNullable<typeof ta> => ta !== null);

  return {
    target: rawData.address,
    targetType: 'wallet',
    transfers: allTransfers,
    instructions: allInstructions,
    counterparties,
    labels: new Map(),
    tokenAccounts,
    timeRange,
    transactionCount: transactions.length,
  };
}

/**
 * Normalize transaction data into a ScanContext
 */
export function normalizeTransactionData(
  rawData: RawTransactionData,
  labelProvider?: LabelProvider
): ScanContext {
  const allTransfers: Transfer[] = [];
  const allInstructions: NormalizedInstruction[] = [];
  const counterparties = new Set<string>();

  if (rawData.transaction) {
    try {
      // Extract transfers
      const solTransfers = extractSOLTransfers(rawData.transaction, rawData.signature);
      const splTransfers = extractSPLTransfers(rawData.transaction, rawData.signature);
      allTransfers.push(...solTransfers, ...splTransfers);

      // Extract instructions
      const instructions = extractInstructions(rawData.transaction, rawData.signature);
      allInstructions.push(...instructions);

      // Extract all unique addresses involved
      const accountKeys = rawData.transaction.transaction.message.accountKeys;
      if (accountKeys && Array.isArray(accountKeys)) {
        for (const key of accountKeys) {
          const address = typeof key === 'string' ? key : key.pubkey.toString();
          counterparties.add(address);
        }
      }
    } catch (error) {
      console.warn(`Failed to normalize transaction ${rawData.signature}:`, error);
    }
  }

  return {
    target: rawData.signature,
    targetType: 'transaction',
    transfers: allTransfers,
    instructions: allInstructions,
    counterparties,
    labels: new Map(),
    tokenAccounts: [],
    timeRange: {
      earliest: rawData.transaction ? rawData.blockTime : null,
      latest: rawData.transaction ? rawData.blockTime : null,
    },
    transactionCount: rawData.transaction ? 1 : 0,
  };
}

/**
 * Normalize program data into a ScanContext
 */
export function normalizeProgramData(
  rawData: RawProgramData,
  labelProvider?: LabelProvider
): ScanContext {
  const allTransfers: Transfer[] = [];
  const allInstructions: NormalizedInstruction[] = [];
  const counterparties = new Set<string>();

  // Ensure relatedTransactions exists and is an array
  const transactions = rawData.relatedTransactions || [];

  // Process related transactions
  for (const rawTx of transactions) {
    if (!rawTx.transaction) continue;

    try {
      // Extract transfers
      const solTransfers = extractSOLTransfers(rawTx.transaction, rawTx.signature);
      const splTransfers = extractSPLTransfers(rawTx.transaction, rawTx.signature);
      allTransfers.push(...solTransfers, ...splTransfers);

      // Extract instructions
      const instructions = extractInstructions(rawTx.transaction, rawTx.signature);
      allInstructions.push(...instructions);

      // Extract counterparties
      const accountKeys = rawTx.transaction.transaction.message.accountKeys;
      if (accountKeys && Array.isArray(accountKeys)) {
        for (const key of accountKeys) {
          const address = typeof key === 'string' ? key : key.pubkey.toString();
          counterparties.add(address);
        }
      }
    } catch (error) {
      console.warn(`Failed to normalize program transaction ${rawTx.signature}:`, error);
      continue;
    }
  }

  // Calculate time range
  const timeRange = calculateTimeRange(transactions);

  // Look up labels for counterparties
  const labels = labelProvider
    ? labelProvider.lookupMany(Array.from(counterparties))
    : new Map();

  return {
    target: rawData.programId,
    targetType: 'program',
    transfers: allTransfers,
    instructions: allInstructions,
    counterparties,
    labels: new Map(),
    tokenAccounts: [],
    timeRange,
    transactionCount: transactions.length,
  };
}
