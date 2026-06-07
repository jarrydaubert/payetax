import { Compass, Home, Newspaper, Wrench } from 'lucide-react';
import Link from 'next/link';
import { StatusPage } from '@/components/molecules/StatusPage';
import { Button } from '@/components/ui/button';

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
