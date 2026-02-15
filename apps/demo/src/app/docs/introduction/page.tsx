import type { Metadata } from 'next';
import IntroductionContent from './content';

const title = 'Introduction';
const description =
  'PartyLayer is an open-source SDK for integrating Canton Network wallets into your dApp. Unified adapter interface, registry-backed wallet verification, and CIP-0103 support.';
const url = 'https://partylayer.xyz/docs/introduction';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://partylayer.xyz' },
    { '@type': 'ListItem', position: 2, name: 'Docs', item: 'https://partylayer.xyz/docs/introduction' },
    { '@type': 'ListItem', position: 3, name: 'Introduction' },
  ],
};

export default function IntroductionPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <IntroductionContent />
    </>
  );
}
