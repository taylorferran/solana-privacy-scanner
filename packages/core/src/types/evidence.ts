/**
 * Types of evidence that can support a risk signal
 */
export type EvidenceType = 
  | 'transaction'
  | 'address'
  | 'amount'
  | 'timing'
  | 'pattern'
  | 'label';

/**
 * Concrete evidence supporting a privacy risk signal
 */
export interface Evidence {
  /**
   * Type of evidence
   */
  type: EvidenceType;

  /**
   * Human-readable description of the evidence
   */
  description: string;

  /**
   * Structured data supporting the evidence
   */
  data: Record<string, unknown>;

  /**
   * Optional reference (transaction signature, address, etc.)
   */
  reference?: string;
}
