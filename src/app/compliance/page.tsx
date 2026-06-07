// src/app/compliance/page.tsx

import { StructuredData } from '@/components/organisms/StructuredData';
import { generateMetadata, SITE_URL } from '@/lib/metadata';
import { CompliancePageContent } from './CompliancePageContent';

export const metadata = generateMetadata({
  title: 'HMRC Compliance & Data Sources | PayeTax',
  description:
    'PayeTax uses official HMRC tax rates verified for accuracy. Learn about our compliance standards and data sources for UK tax calculations.',
  pathname: '/compliance',
});

export default function CompliancePage() {
  return (
    <>
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Compliance', url: `${SITE_URL}/compliance` },
        ]}
      />
      <CompliancePageContent />
    </>
  );
}
