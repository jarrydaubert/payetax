// src/app/privacy/page.tsx

import { StructuredData } from '@/components/organisms/StructuredData';
import { generateMetadata, SITE_URL } from '@/lib/metadata';
import { PrivacyPageContent } from './PrivacyPageContent';

export const metadata = generateMetadata({
  title: 'Privacy Policy | PayeTax - Privacy-First Tax Calculations',
  description:
    'How PayeTax handles browser-stored calculator inputs, emailed results, consent-based analytics and technical diagnostics.',
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
