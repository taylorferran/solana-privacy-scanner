import { defineConfig } from 'vitepress'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  title: 'Solana Privacy Scanner',
  description: 'Measure on-chain privacy exposure',
  base: '/',
  
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap', rel: 'stylesheet' }],
    ['link', { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕵🏻‍♂️</text></svg>' }],
  ],
  
  vite: {
    plugins: [
      nodePolyfills({
        include: ['buffer'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    resolve: {
      alias: {
        'solana-privacy-scanner-core': resolve(__dirname, '../../packages/core/src'),
      },
    },
    optimizeDeps: {
      include: ['@solana/web3.js'],
      exclude: ['solana-privacy-scanner-core'],
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    },
    define: {
      'process.env': {},
      global: 'globalThis',
    },
  },
  
  themeConfig: {
    nav: [
      { text: 'Docs', link: '/guide/what-is-this' },
      { text: 'Library', link: '/library/usage' },
      { text: 'CLI', link: '/cli/quickstart' },
      { text: 'GitHub', link: 'https://github.com/taylorferran/solana-privacy-scanner' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Overview', link: '/guide/what-is-this' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Core Concepts', link: '/guide/concepts' }
        ]
      },
      {
        text: 'Library',
        items: [
          { text: 'API Reference', link: '/library/usage' },
          { text: 'Integration Examples', link: '/library/examples' }
        ]
      },
      {
        text: 'CLI',
        items: [
          { text: 'Quickstart', link: '/cli/quickstart' },
          { text: 'Commands', link: '/cli/user-guide' },
          { text: 'Examples', link: '/cli/examples' }
        ]
      },
      {
        text: 'Understanding Reports',
        items: [
          { text: 'Risk Levels', link: '/reports/risk-levels' },
          { text: 'Heuristics', link: '/reports/heuristics' },
          { text: 'Known Entities', link: '/reports/known-entities' }
        ]
      },
      {
        text: 'Contributing',
        items: [
          { text: 'Adding Addresses', link: '/contributing/addresses' },
          { text: 'Development', link: '/contributing/development' }
        ]
      },
      {
        text: 'Project',
        items: [
          { text: 'Changelog', link: '/changelog' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/taylorferran/solana-privacy-scanner' }
    ],

    footer: {
      message: 'Built for privacy awareness. Not surveillance.',
      copyright: 'MIT Licensed'
    },

  }
})
