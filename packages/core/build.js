import * as esbuild from 'esbuild';
import { readFileSync, copyFileSync, mkdirSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];

const watchMode = process.argv.includes('--watch');

const baseConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  external,
  platform: 'node',
  target: 'node25',
  sourcemap: true,
};

async function build() {
  try {
    // Ensure dist directory exists
    mkdirSync('dist', { recursive: true });

    // ESM build
    await esbuild.build({
      ...baseConfig,
      format: 'esm',
      outfile: 'dist/index.js',
    });

    // CJS build
    await esbuild.build({
      ...baseConfig,
      format: 'cjs',
      outfile: 'dist/index.cjs',
    });

    // Copy static assets (JSON label file from repository root)
    // This allows the database to be updated via PRs without package releases
    copyFileSync('../../known-addresses.json', 'dist/known-addresses.json');

    console.log('✓ Build complete');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

if (watchMode) {
  const ctx = await esbuild.context({
    ...baseConfig,
    format: 'esm',
    outfile: 'dist/index.js',
  });
  
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await build();
}
