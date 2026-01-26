// src/app/tools/director-dashboard/page.tsx
import type { Metadata } from 'next';
import { DirectorDashboard } from '@/components/organisms/DirectorGuide';

export const metadata: Metadata = {
  title: 'Director Pay Dashboard | PayeTax',
  description:
    'Calculate your optimal salary and dividend mix as a UK limited company director. See how different payment strategies affect your take-home pay.',
  robots: {
    index: false, // Don't index while in development
    follow: false,
  },
};

/**
 * Director Dashboard page - New UI for director pay calculations
 *
 * This is a full-screen dashboard experience with:
 * - Left inputs panel
 * - Main results area
 * - Right education panel
 * - Comparison modal flow
 */
export default function DirectorDashboardPage() {
  return <DirectorDashboard />;
}
