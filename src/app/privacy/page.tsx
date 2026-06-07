// src/app/privacy/page.tsx

import { StructuredData } from '@/components/organisms/StructuredData';
import { generateMetadata, SITE_URL } from '@/lib/metadata';
import { PrivacyPageContent } from './PrivacyPageContent';

export const metadata = generateMetadata({
  title: 'Privacy Policy | PayeTax - Privacy-First Tax Calculations',
  description:
    "PayeTax privacy policy: Interactive calculations run in your browser and tax inputs aren't stored. Learn how we protect your financial privacy.",
  pathname: '/privacy',
});

export default function PrivacyPage() {
  return (
    <>
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Privacy', url: `${SITE_URL}/privacy` },
        ]}
      />
      <PrivacyPageContent />
    </>
  );
}
