---
sidebar_position: 2
---

# Installation

Set up the Solana Privacy Scanner plugin for Claude Code.

## Prerequisites

### 1. Claude Code CLI

Install Claude Code globally:

```bash
npm install -g claude-code
```

Verify installation:

```bash
claude --version
```

### 2. Solana Privacy Analyzer

Install the analyzer in your Solana project:

```bash
cd your-solana-project
npm install --save-dev solana-privacy-analyzer
```

Or globally:

```bash
npm install -g solana-privacy-analyzer
```

**Note:** The plugin runs `npx solana-privacy-analyzer`, so either installation method works.

## Plugin Installation

### Method 1: Clone Repository (Recommended)

Clone the full repository and point Claude Code to the plugin:

```bash
# Clone repo
git clone https://github.com/taylorferran/solana-privacy-scanner
cd solana-privacy-scanner

# Load plugin when starting Claude Code
claude --plugin-dir packages/claude-plugin
```

**Pros:**
- Get latest updates with `git pull`
- See full source code and examples
- Easy to contribute back

### Method 2: Download Plugin Only

Download just the plugin directory using sparse checkout:

```bash
# Create plugins directory
mkdir -p ~/claude-plugins
cd ~/claude-plugins

# Sparse clone
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/taylorferran/solana-privacy-scanner
cd solana-privacy-scanner
git sparse-checkout set packages/claude-plugin

# Load plugin
claude --plugin-dir ~/claude-plugins/solana-privacy-scanner/packages/claude-plugin
```

**Pros:**
- Smaller download
- Dedicated plugins directory
- Faster updates

### Method 3: Set Default Plugin Directory

Make the plugin load automatically every time you use Claude Code.

**For Bash** (`~/.bashrc`):

```bash
export CLAUDE_PLUGIN_DIR=/path/to/solana-privacy-scanner/packages/claude-plugin
```

**For Zsh** (`~/.zshrc`):

```bash
export CLAUDE_PLUGIN_DIR=/path/to/solana-privacy-scanner/packages/claude-plugin
```

**For Fish** (`~/.config/fish/config.fish`):

```fish
set -x CLAUDE_PLUGIN_DIR /path/to/solana-privacy-scanner/packages/claude-plugin
```

Then reload your shell:

```bash
source ~/.bashrc  # or ~/.zshrc
```

Now just run `claude` and the plugin loads automatically!

**Pros:**
- No need to specify `--plugin-dir` every time
- Always available
- Clean workflow

## Verify Installation

### Check Plugin is Loaded

Start Claude Code:

```bash
claude
```

Or with explicit plugin directory:

```bash
claude --plugin-dir /path/to/packages/claude-plugin
```

Then check available skills:

```
/help
```

You should see `solana-privacy-scan` in the list of skills.

### Test the Skill

Create a test file with a privacy issue:

**test.ts:**
```typescript
import { Keypair } from '@solana/web3.js';

async function badExample(recipients: string[]) {
  const feePayer = Keypair.generate();  // Outside loop

  for (const recipient of recipients) {
    // Use feePayer here...
  }
}
```

Run the scan:

```
/solana-privacy-scan test.ts
```

Claude should detect the fee payer reuse issue.

## Plugin Structure

The plugin directory structure:

```
packages/claude-plugin/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── skills/
│   └── solana-privacy-scan/
│       ├── SKILL.md          # Skill instructions for Claude
│       └── examples/
│           ├── bad-code.ts   # Examples of privacy issues
│           └── good-code.ts  # Examples of safe patterns
└── README.md
```

## Troubleshooting

### "Unknown skill: solana-privacy-scan"

**Problem:** Claude doesn't recognize the skill.

**Solutions:**

1. **Verify plugin directory structure:**
   ```bash
   ls packages/claude-plugin/.claude-plugin/plugin.json
   ls packages/claude-plugin/skills/solana-privacy-scan/SKILL.md
   ```

   Both files must exist.

2. **Use absolute path:**
   ```bash
   claude --plugin-dir $(pwd)/packages/claude-plugin
   ```

3. **Check environment variable:**
   ```bash
   echo $CLAUDE_PLUGIN_DIR
   ```

   Should show the correct path if set.

4. **Restart Claude Code:**
   Exit and restart to reload plugins.

### "Analyzer not found" or "npx: command not found"

**Problem:** The static analyzer isn't installed or accessible.

**Solutions:**

1. **Install in your project:**
   ```bash
   cd your-solana-project
   npm install --save-dev solana-privacy-analyzer
   ```

2. **Or install globally:**
   ```bash
   npm install -g solana-privacy-analyzer
   ```

3. **Verify installation:**
   ```bash
   npx solana-privacy-analyzer --version
   ```

   Should output version number.

4. **Check you're in the right directory:**
   ```bash
   pwd
   ls package.json
   ```

   Make sure you're in your Solana project directory.

### "No files found to scan"

**Problem:** The analyzer can't find TypeScript/JavaScript files.

**Solutions:**

1. **Specify correct path:**
   ```
   /solana-privacy-scan src/
   ```

2. **Check files exist:**
   ```bash
   ls src/*.ts
   ```

3. **Try specific file:**
   ```
   /solana-privacy-scan src/transfer.ts
   ```

### Plugin loads but scan produces no results

**Problem:** Scan runs but finds 0 issues even when issues exist.

**Solutions:**

1. **Check file contains Solana code:**
   - File must be `.ts`, `.tsx`, `.js`, or `.jsx`
   - Must contain actual Solana transaction code

2. **Verify analyzer works standalone:**
   ```bash
   npx solana-privacy-analyzer scan src/
   ```

   If this finds issues but the plugin doesn't, report a bug.

3. **Check Claude's output:**
   Claude should show the JSON output from the analyzer. If it's empty, the analyzer isn't finding files.

## Updating the Plugin

### Pull Latest Changes

If you cloned the repository:

```bash
cd /path/to/solana-privacy-scanner
git pull origin main
```

Changes take effect next time you start Claude Code.

### Update Analyzer

Update the npm package separately:

```bash
npm install --save-dev solana-privacy-analyzer@latest
```

Or globally:

```bash
npm update -g solana-privacy-analyzer
```

## Uninstalling

### Remove Plugin

Simply stop using the `--plugin-dir` flag or remove the environment variable.

**For environment variable:**

Edit `~/.bashrc` or `~/.zshrc` and remove:

```bash
export CLAUDE_PLUGIN_DIR=...
```

Then reload:

```bash
source ~/.bashrc
```

### Remove Analyzer

```bash
npm uninstall solana-privacy-analyzer
```

Or globally:

```bash
npm uninstall -g solana-privacy-analyzer
```

### Remove Repository

```bash
rm -rf /path/to/solana-privacy-scanner
```

## Next Steps

- [Usage Guide](./usage) - Learn to use `/solana-privacy-scan`
- [Examples](./examples) - See real workflows
- [Code Analyzer CLI](../code-analyzer/overview) - Standalone tool docs
