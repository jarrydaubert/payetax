import { Compass, Home, Newspaper, Wrench } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StatusPage } from '@/components/molecules/StatusPage';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: { absolute: 'Page Not Found | PayeTax' },
  description: 'The requested PayeTax page could not be found.',
  alternates: { canonical: null },
  robots: { index: false, follow: false },
  openGraph: null,
  twitter: null,
};

export default function NotFound() {
  return (
    <StatusPage
      icon={Compass}
      eyebrow='404'
      title='Page not found'
      description="The page you're looking for doesn't exist or has moved. Here are a few good places to pick things back up."
      actions={
        <>
          <Button asChild size='touch' className='rounded-sm px-6'>
            <Link href='/'>
              <Home className='size-4' aria-hidden='true' />
              Open calculator
            </Link>
          </Button>
          <Button asChild size='touch' variant='outline' className='rounded-sm bg-card px-6'>
            <Link href='/tools'>
              <Wrench className='size-4' aria-hidden='true' />
              Browse tools
            </Link>
          </Button>
          <Button asChild size='touch' variant='outline' className='rounded-sm bg-card px-6'>
            <Link href='/blog'>
              <Newspaper className='size-4' aria-hidden='true' />
              Read the blog
            </Link>
          </Button>
        </>
      }
    />
  );
}
