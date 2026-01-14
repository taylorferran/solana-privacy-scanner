import type { Evidence } from './evidence.js';
import type { RiskLevel } from './report.js';

/**
 * A single privacy risk signal detected during analysis
 */
export interface RiskSignal {
  /**
   * Unique identifier for this type of signal
   */
  id: string;

  /**
   * Human-readable name of the risk signal
   */
  name: string;

  /**
   * Risk severity level
   */
  severity: RiskLevel;

  /**
   * Why this signal was triggered
   */
  reason: string;

  /**
   * What this signal means for privacy
   */
  impact: string;

  /**
   * Concrete evidence supporting this signal
   */
  evidence: Evidence[];

  /**
   * Recommended actions to mitigate this risk
   */
  mitigation: string;

  /**
   * Confidence level in this signal (0-1)
   * Lower values indicate more speculative heuristics
   */
  confidence: number;
}
