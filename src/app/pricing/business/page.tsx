// src/app/pricing/business/page.tsx
// MONETIZATION: Page disabled until widget registration system is ready
// To enable: remove notFound() and uncomment metadata + component

import { notFound } from 'next/navigation';

// import type { Metadata } from 'next';
// import { BusinessPricingClient } from './BusinessPricingClient';

// export const metadata: Metadata = {
//   title: 'Business Widget Pricing | PayeTax',
//   description:
//     'Embed the UK tax calculator on your website. Free for personal use, premium tiers for businesses with white-label, API access, and priority support.',
//   alternates: {
//     canonical: '/pricing/business',
//   },
//   openGraph: {
//     title: 'Business Widget Pricing | PayeTax',
//     description:
//       'Embed the UK tax calculator on your website. Premium options for HR portals, job boards, and recruitment platforms.',
//     url: 'https://payetax.co.uk/pricing/business',
//   },
// };

export default function BusinessPricingPage() {
  // Return 404 until monetization features are active
  notFound();

  // Uncomment when ready:
  // return <BusinessPricingClient />;
}
