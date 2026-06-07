import { type SchemaType, StructuredData } from '@/components/organisms/StructuredData';
import { INSTALL_PLATFORMS } from '@/constants/pages/installPageData';
import { generateMetadata, SITE_URL } from '@/lib/metadata';
import { InstallPageContent } from './InstallPageContent';

export const metadata = generateMetadata({
  title: 'Install PayeTax App | Offline UK Tax Calculator',
  description:
    'Install PayeTax as an app on iPhone, Android, and desktop. Use the UK tax calculator faster with offline support and home-screen access.',
  pathname: '/install',
});

export default function InstallPage() {
  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Install', url: `${SITE_URL}/install` },
  ];

  const installHowToData: SchemaType = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Install PayeTax',
    description:
      'Install PayeTax on iPhone, Android, and desktop for faster access and offline support.',
    totalTime: 'PT2M',
    step: INSTALL_PLATFORMS.map((platform) => ({
      '@type': 'HowToStep',
      name: `Install on ${platform.platform} (${platform.browser})`,
      text: platform.steps.join(' '),
    })),
  };

  return (
    <>
      <StructuredData type='breadcrumb' breadcrumbs={breadcrumbItems} />
      <StructuredData type='howto' data={installHowToData} />
      <InstallPageContent />
    </>
  );
}
