import { StructuredData } from '@/components/organisms/StructuredData';
import { SITE_URL } from '@/lib/metadata';
import { AboutPageContent } from './AboutPageContent';

export default function AboutPage() {
  return (
    <>
      <StructuredData
        type='person'
        expert={{
          name: 'Jarryd Daubert',
          jobTitle: 'Creator & Developer',
          description: 'Creator of PayeTax, building privacy-first tax tools for UK taxpayers.',
          organization: 'PayeTax',
          expertise: ['UK PAYE tax', 'HMRC compliance', 'tax software'],
        }}
      />
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'About', url: `${SITE_URL}/about` },
        ]}
      />
      <AboutPageContent />
    </>
  );
}
