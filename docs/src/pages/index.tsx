import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import PrivacyScanner from '@site/src/components/PrivacyScanner';
import styles from './index.module.css';

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroLabel}>PRIVACY ANALYSIS SUITE</div>
        <h1 className={styles.heroTitle}>
          Solana Privacy Scanner
        </h1>
        <p className={styles.heroSubtitle}>
          Deterministic privacy analysis for Solana. 11 heuristics detect leaks across wallets, transactions, and programs. Open source. Zero config.
        </p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} to="/docs/sps/what-is-this">
            Get Started →
          </Link>
        </div>
      </div>
    </section>
  );
}

type ProductCard = {
  title: string;
  description: string;
  link: string;
  tag: string;
};

const products: ProductCard[] = [
  {
    title: 'Core',
    tag: 'Library',
    description: 'Programmatic API for on-chain scanning, static analysis, transaction simulation, and testing.',
    link: '/docs/core/usage',
  },
  {
    title: 'Toolkit',
    tag: 'Command Line',
    description: 'CLI for scanning wallets/transactions/programs and analyzing source code. Zero configuration.',
    link: '/docs/toolkit/overview',
  },
  {
    title: 'Claude Plugin',
    tag: 'AI Assistant',
    description: 'Privacy analysis directly in Claude Code. Real-time recommendations during development.',
    link: '/docs/claude-plugin/overview',
  },
];

function ProductCard({title, description, link, tag}: ProductCard) {
  return (
    <Link to={link} className={styles.productCard}>
      <div className={styles.productTag}>{tag}</div>
      <h3 className={styles.productTitle}>{title}</h3>
      <p className={styles.productDescription}>{description}</p>
      <div className={styles.productArrow}>→</div>
    </Link>
  );
}

function ProductsSection() {
  return (
    <section className={styles.products}>
      <div className={styles.productsContainer}>
        <h2 className={styles.productsTitle}>Three ways to scan</h2>
        <div className={styles.productsGrid}>
          {products.map((props, idx) => (
            <ProductCard key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ScannerSection() {
  return (
    <section className={styles.scanner}>
      <div className={styles.scannerContainer}>
        <div className={styles.scannerHeader}>
          <h2 className={styles.scannerTitle}>Try the scanner</h2>
          <p className={styles.scannerSubtitle}>Enter any Solana wallet address for instant privacy analysis</p>
        </div>
        <PrivacyScanner />
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}
      noFooter={false}
      wrapperClassName="homepage-wrapper">
      <div className={styles.homeContainer}>
        <HeroSection />
        <ProductsSection />
        <ScannerSection />
      </div>
    </Layout>
  );
}
