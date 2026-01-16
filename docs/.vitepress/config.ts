import { defineConfig } from 'vitepress'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  title: 'Solana Privacy Scanner',
  description: 'Analyze Solana wallets, transactions, and programs for privacy risks. Get transparent risk assessments and actionable guidance.',
  base: '/',
  
  // SEO and Meta Tags
  head: [
    // Favicon and Icons
    ['link', { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕵🏻‍♂️</text></svg>' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    
    // Fonts
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap', rel: 'stylesheet' }],
    
    // Primary Meta Tags
    ['meta', { name: 'title', content: 'Solana Privacy Scanner - Analyze On-Chain Privacy Risks' }],
    ['meta', { name: 'description', content: 'Free tool to scan Solana wallets, transactions, and programs for privacy risks. Get transparent risk assessments with actionable guidance. Open source and privacy-focused.' }],
    ['meta', { name: 'keywords', content: 'solana, privacy, blockchain, scanner, cryptocurrency, on-chain analysis, wallet privacy, transaction privacy, solana privacy, blockchain privacy, crypto privacy' }],
    ['meta', { name: 'author', content: 'Solana Privacy Scanner' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'theme-color', content: '#0d9488' }],
    
    // Open Graph / Facebook
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://sps.guide/' }],
    ['meta', { property: 'og:title', content: 'Solana Privacy Scanner - Analyze On-Chain Privacy Risks' }],
    ['meta', { property: 'og:description', content: 'Free tool to scan Solana wallets, transactions, and programs for privacy risks. Get transparent risk assessments with actionable guidance.' }],
    ['meta', { property: 'og:image', content: 'https://sps.guide/og-image.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:site_name', content: 'Solana Privacy Scanner' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    
    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:url', content: 'https://sps.guide/' }],
    ['meta', { name: 'twitter:title', content: 'Solana Privacy Scanner - Analyze On-Chain Privacy Risks' }],
    ['meta', { name: 'twitter:description', content: 'Free tool to scan Solana wallets, transactions, and programs for privacy risks. Get transparent risk assessments with actionable guidance.' }],
    ['meta', { name: 'twitter:image', content: 'https://sps.guide/twitter-image.png' }],
    ['meta', { name: 'twitter:creator', content: '@solana' }],
    
    // Additional SEO
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'googlebot', content: 'index, follow' }],
    ['link', { rel: 'canonical', href: 'https://sps.guide/' }],
    
    // Structured Data (JSON-LD)
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Solana Privacy Scanner',
      url: 'https://sps.guide',
      description: 'Free tool to scan Solana wallets, transactions, and programs for privacy risks',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      creator: {
        '@type': 'Organization',
        name: 'Solana Privacy Scanner',
        url: 'https://sps.guide'
      }
    })],
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
  
  // Sitemap
  sitemap: {
    hostname: 'https://sps.guide'
  },
  
  themeConfig: {
    // Site metadata
    siteTitle: 'Solana Privacy Scanner',
    logo: '🕵🏻‍♂️',
    
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
      copyright: 'MIT Licensed | Made for the Solana ecosystem'
    },

    // Search
    search: {
      provider: 'local',
      options: {
        placeholder: 'Search documentation...',
        translations: {
          button: {
            buttonText: 'Search',
            buttonAriaLabel: 'Search'
          },
          modal: {
            noResultsText: 'No results for',
            resetButtonTitle: 'Reset search',
            footer: {
              selectText: 'to select',
              navigateText: 'to navigate',
              closeText: 'to close',
            }
          }
        }
      }
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/taylorferran/solana-privacy-scanner/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    // Last updated
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    }
  }
})
