// src/app/tools/page.tsx
import { ArrowRight, Wrench } from 'lucide-react';
import Link from 'next/link';
import { GradientText } from '@/components/atoms/GradientText';
import { PageHero } from '@/components/molecules/PageHero';
import { StructuredData } from '@/components/organisms/StructuredData';
import { Card } from '@/components/ui/card';
import { LAYOUT, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';
import { cn } from '@/lib/utils';

export const metadata = generateBaseMetadata({
  title: 'Free UK Tax Tools | PayeTax',
  description:
    'Free UK tax tools: director salary vs dividends, tax code decoder, Scottish tax calculator, National Insurance calculator, and marriage allowance checker.',
  pathname: '/tools',
});

export default function ToolsPage() {
  const tools = [
    {
      href: '/tools/director-guide',
      title: 'Director Intelligence',
      description: 'Salary vs dividends optimizer for UK limited company directors.',
    },
    {
      href: '/tools/tax-code-decoder',
      title: 'Tax Code Decoder',
      description: 'Decode HMRC tax codes (1257L, BR, D0, K codes, etc.).',
    },
    {
      href: '/tools/scottish-tax-calculator',
      title: 'Scottish Tax Calculator',
      description: 'Calculate take-home using Scotland’s income tax bands.',
    },
    {
      href: '/tools/national-insurance-calculator',
      title: 'National Insurance Calculator',
      description: 'Employee and employer NI breakdown by tax year.',
    },
    {
      href: '/tools/marriage-allowance-calculator',
      title: 'Marriage Allowance Calculator',
      description: 'Check eligibility and estimate the savings.',
    },
  ] as const;

  return (
    <>
      <StructuredData
        type='breadcrumb'
        breadcrumbs={[
          { name: 'Home', url: SITE_URL },
          { name: 'Tools', url: `${SITE_URL}/tools` },
        ]}
      />
      <StructuredData
        type='itemlist'
        itemList={{
          listName: 'PayeTax Tools',
          listDescription: 'Free UK tax tools and calculators.',
          items: tools.map((tool, index) => ({
            name: tool.title,
            url: `${SITE_URL}${tool.href}`,
            description: tool.description,
            position: index + 1,
          })),
        }}
      />

      <div className={LAYOUT.PAGE_WRAPPER}>
        <PageHero
          badge={{ icon: Wrench, text: 'Free Tax Tools' }}
          title={
            <>
              Free UK Tax{' '}
              <GradientText variant='brand-full' as='span'>
                Tools
              </GradientText>
            </>
          }
          subtitle='Quick calculators and explainers built on current HMRC rates. No signup.'
        />

        <section className={cn(LAYOUT.SECTION, 'pt-0 md:pt-0')}>
          <div className={LAYOUT.CONTAINER_MD}>
            <div className='grid gap-4 md:grid-cols-2'>
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  data-testid={`tools-link-${tool.href.split('/').pop()}`}
                  className='group block h-full'
                >
                  <Card
                    className={cn(
                      'flex h-full flex-col justify-between rounded-2xl border-border/60 bg-card/70 p-5 backdrop-blur-sm transition-all duration-200',
                      'hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/80',
                    )}
                  >
                    <div>
                      <h2
                        className={cn(
                          'font-semibold text-foreground transition-colors group-hover:text-primary',
                          TYPOGRAPHY.TEXT_XL,
                        )}
                      >
                        {tool.title}
                      </h2>
                      <p
                        className={cn(
                          'mt-2 text-muted-foreground leading-relaxed',
                          TYPOGRAPHY.TEXT_SM,
                        )}
                      >
                        {tool.description}
                      </p>
                    </div>

                    <span
                      className={cn(
                        'mt-5 inline-flex items-center gap-1 whitespace-nowrap font-medium text-primary',
                        TYPOGRAPHY.TEXT_SM,
                        SPACING.GAP_1,
                      )}
                    >
                      Use Tool
                      <ArrowRight className='size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
