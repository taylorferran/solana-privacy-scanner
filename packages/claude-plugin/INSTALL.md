# Installing the Solana Privacy Scanner Plugin for Claude Code

## Prerequisites

1. **Claude Code CLI** installed:
   ```bash
   npm install -g claude-code
   ```

2. **Solana Privacy Analyzer** installed in your project:
   ```bash
   npm install --save-dev solana-privacy-analyzer
   ```

## Installation

### Method 1: Clone the Repository (Recommended)

```bash
# Clone the repo
git clone https://github.com/taylorferran/solana-privacy-scanner
cd solana-privacy-scanner

# Load the plugin in Claude Code
claude --plugin-dir packages/claude-plugin
```

### Method 2: Download Plugin Only

```bash
# Download just the plugin directory
mkdir -p ~/claude-plugins
cd ~/claude-plugins
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/taylorferran/solana-privacy-scanner
cd solana-privacy-scanner
git sparse-checkout set packages/claude-plugin

# Load plugin
claude --plugin-dir ~/claude-plugins/solana-privacy-scanner/packages/claude-plugin
```

### Method 3: Set as Default Plugin Directory

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
export CLAUDE_PLUGIN_DIR=/path/to/solana-privacy-scanner/packages/claude-plugin
```

Then just run `claude` and the plugin will be loaded automatically.

## Verify Installation

In Claude Code, check that the plugin is loaded:

```
/help
```

You should see `solana-privacy-scan` in the list of available skills.

## Usage

```
/solana-privacy-scan [path]
```

Example:
```
/solana-privacy-scan src/
```

## Troubleshooting

### "Unknown skill: solana-privacy-scan"

- Verify plugin directory structure:
  ```bash
  ls packages/claude-plugin/.claude-plugin/plugin.json
  ls packages/claude-plugin/skills/solana-privacy-scan/SKILL.md
  ```

- Try with absolute path:
  ```bash
  claude --plugin-dir $(pwd)/packages/claude-plugin
  ```

### "Analyzer not found"

Install the analyzer in your project:
```bash
npm install --save-dev solana-privacy-analyzer
```

### Plugin loads but scan fails

Make sure you're in a directory with TypeScript/JavaScript files:
```bash
# Check current directory
pwd
ls *.ts *.js

# Or specify path explicitly
/solana-privacy-scan /path/to/your/code
```

## Updating

```bash
cd /path/to/solana-privacy-scanner
git pull origin main
```

The plugin will automatically use the latest version next time you load it.

## Support

- [Full Documentation](https://sps.guide)
- [GitHub Issues](https://github.com/taylorferran/solana-privacy-scanner/issues)
- [Example Repository](https://github.com/taylorferran/solana-privacy-scanner-example)
