import type { Label, LabelProvider } from '../types/index.js';
/**
 * Static JSON label provider
 * Loads labels from a curated JSON file
 */
export declare class StaticLabelProvider implements LabelProvider {
    private labels;
    constructor(labelsPath?: string);
    /**
     * Load labels from JSON file
     */
    private loadLabels;
    /**
     * Look up a label for an address
     */
    lookup(address: string): Label | null;
    /**
     * Look up multiple addresses at once
     */
    lookupMany(addresses: string[]): Map<string, Label>;
    /**
     * Get all loaded labels
     */
    getAllLabels(): Label[];
    /**
     * Get count of loaded labels
     */
    getCount(): number;
}
/**
 * Create a default label provider instance
 */
export declare function createDefaultLabelProvider(): StaticLabelProvider;
//# sourceMappingURL=provider.d.ts.map