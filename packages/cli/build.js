import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];

const watchMode = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  external,
  platform: 'node',
  target: 'node25',
  format: 'esm',
  outfile: 'dist/index.js',
  sourcemap: true,
};

async function build() {
  try {
    await esbuild.build(config);
    console.log('✓ CLI build complete');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

if (watchMode) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await build();
}
