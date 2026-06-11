import { StructuredData } from '@/components/organisms/StructuredData';
import { SITE_URL } from '@/lib/metadata';
import { AboutPageContent } from './AboutPageContent';

export default function AboutPage() {
  return (
    <>
      <StructuredData
        type='person'
        expert={{
          name: 'Jarryd Aubert',
          jobTitle: 'Software tester and creator of PayeTax',
          description:
            'Creator of PayeTax, a UK tax calculator R&D project focused on deterministic calculation correctness, edge cases, privacy, and deployment hygiene.',
          organization: 'PayeTax',
          expertise: ['UK PAYE tax', 'HMRC compliance', 'tax calculation testing'],
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
