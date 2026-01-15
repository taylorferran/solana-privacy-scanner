import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Label, LabelProvider } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Static JSON label provider
 * Loads labels from a curated JSON file
 */
export class StaticLabelProvider implements LabelProvider {
  private labels: Map<string, Label>;

  constructor(labelsPath?: string) {
    this.labels = new Map();
    this.loadLabels(labelsPath);
  }

  /**
   * Load labels from JSON file
   */
  private loadLabels(customPath?: string): void {
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
    } catch (error) {
      console.warn('Failed to load labels file:', error);
    }
  }

  /**
   * Look up a label for an address
   */
  lookup(address: string): Label | null {
    return this.labels.get(address) || null;
  }

  /**
   * Look up multiple addresses at once
   */
  lookupMany(addresses: string[]): Map<string, Label> {
    const results = new Map<string, Label>();

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
  getAllLabels(): Label[] {
    return Array.from(this.labels.values());
  }

  /**
   * Get count of loaded labels
   */
  getCount(): number {
    return this.labels.size;
  }
}

/**
 * Create a default label provider instance
 */
export function createDefaultLabelProvider(): StaticLabelProvider {
  return new StaticLabelProvider();
}
