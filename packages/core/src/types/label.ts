/**
 * Types of known entities
 */
export type LabelType = 
  | 'exchange'
  | 'bridge'
  | 'protocol'
  | 'program'
  | 'mixer'
  | 'other';

/**
 * A label for a known entity on Solana
 */
export interface Label {
  /**
   * The address or program ID
   */
  address: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Type of entity
   */
  type: LabelType;

  /**
   * Additional context or description
   */
  description?: string;

  /**
   * Known associated addresses
   */
  relatedAddresses?: string[];
}

/**
 * Interface for label lookup providers
 */
export interface LabelProvider {
  /**
   * Look up a label for an address
   */
  lookup(address: string): Label | null;

  /**
   * Look up multiple addresses at once
   */
  lookupMany(addresses: string[]): Map<string, Label>;
}
