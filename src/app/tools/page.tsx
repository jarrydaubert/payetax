// src/app/tools/page.tsx
import Link from 'next/link';
import { StructuredData } from '@/components/organisms/StructuredData';
import PageContainer from '@/components/templates/PageContainer';
import { generateMetadata as generateBaseMetadata, SITE_URL } from '@/lib/metadata';

export const metadata = generateBaseMetadata({
  title: 'Free UK Tax Tools | PayeTax',
  description:
    'Free UK tax tools: director salary vs dividends, tax code decoder, Scottish tax calculator, National Insurance calculator, and marriage allowance checker.',
  keywords:
    'UK tax tools, tax code decoder, Scottish tax calculator, NI calculator, director dividends calculator, marriage allowance calculator',
  pathname: '/tools',
});

export default function ToolsPage() {
  const tools = [
    {
      href: '/tools/director-guide',
      title: 'Director Guide',
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

      <PageContainer maxWidth='5xl'>
        <header className='mb-8'>
          <h1 className='text-balance font-semibold text-3xl text-slate-100'>
            Free UK Tax{' '}
            <span className='bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent'>
              Tools
            </span>
          </h1>
          <p className='mt-3 max-w-2xl text-pretty text-slate-400'>
            Quick calculators and explainers built on current HMRC rates. No signup.
          </p>
        </header>

        <div className='grid gap-4 md:grid-cols-2'>
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              data-testid={`tools-link-${tool.href.split('/').pop()}`}
              className='group rounded-2xl border border-white/[0.08] bg-[#0b1220]/40 p-5 transition hover:border-white/[0.14] hover:bg-[#0f172a]/50'
            >
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <div className='font-semibold text-slate-100 group-hover:text-white'>
                    {tool.title}
                  </div>
                  <div className='mt-1 text-slate-500 text-sm'>{tool.description}</div>
                </div>
                <span className='text-cyan-400 text-sm transition group-hover:translate-x-0.5'>
                  Open →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </>
  );
}
