import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import PrivacyScanner from '@site/src/components/PrivacyScanner';

export default function Home(): ReactNode {
  return (
    <Layout
      title="Solana Privacy Scanner"
      description="Analyze Solana wallets, transactions, and programs for privacy risks. Get transparent risk assessments and actionable guidance.">
      <main>
        <PrivacyScanner />
      </main>
    </Layout>
  );
}

