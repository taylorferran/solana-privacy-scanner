import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Static JSON label provider
 * Loads labels from a curated JSON file
 */
export class StaticLabelProvider {
    labels;
    constructor(labelsPath) {
        this.labels = new Map();
        this.loadLabels(labelsPath);
    }
    /**
     * Load labels from JSON file
     */
    loadLabels(customPath) {
        try {
            const path = customPath || join(__dirname, 'known-addresses.json');
            const data = readFileSync(path, 'utf-8');
            const parsed = JSON.parse(data);
            if (!parsed.labels || !Array.isArray(parsed.labels)) {
                console.warn('Invalid labels file format');
                return;
            }
            for (const label of parsed.labels) {
                if (label.address && label.name && label.type) {
                    this.labels.set(label.address, {
                        address: label.address,
                        name: label.name,
                        type: label.type,
                        description: label.description,
                        relatedAddresses: label.relatedAddresses,
                    });
                }
            }
            console.debug(`Loaded ${this.labels.size} address labels`);
        }
        catch (error) {
            console.warn('Failed to load labels file:', error);
        }
    }
    /**
     * Look up a label for an address
     */
    lookup(address) {
        return this.labels.get(address) || null;
    }
    /**
     * Look up multiple addresses at once
     */
    lookupMany(addresses) {
        const results = new Map();
        for (const address of addresses) {
            const label = this.lookup(address);
            if (label) {
                results.set(address, label);
            }
        }
        return results;
    }
    /**
     * Get all loaded labels
     */
    getAllLabels() {
        return Array.from(this.labels.values());
    }
    /**
     * Get count of loaded labels
     */
    getCount() {
        return this.labels.size;
    }
}
/**
 * Create a default label provider instance
 */
export function createDefaultLabelProvider() {
    return new StaticLabelProvider();
}
//# sourceMappingURL=provider.js.map