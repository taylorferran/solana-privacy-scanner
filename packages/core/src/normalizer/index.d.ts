import type { ScanContext, LabelProvider } from '../types/index.js';
import type { RawWalletData, RawTransactionData, RawProgramData } from '../collectors/index.js';
/**
 * Normalize wallet data into a ScanContext
 */
export declare function normalizeWalletData(rawData: RawWalletData, labelProvider?: LabelProvider): ScanContext;
/**
 * Normalize transaction data into a ScanContext
 */
export declare function normalizeTransactionData(rawData: RawTransactionData, labelProvider?: LabelProvider): ScanContext;
/**
 * Normalize program data into a ScanContext
 */
export declare function normalizeProgramData(rawData: RawProgramData, labelProvider?: LabelProvider): ScanContext;
//# sourceMappingURL=index.d.ts.map