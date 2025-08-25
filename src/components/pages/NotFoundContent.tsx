'use client';

import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundContent() {
  return (
    <div className='min-h-screen pt-20'>
      <div className='container mx-auto max-w-7xl px-4'>
        <div className='text-center'>
          <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-gradient-to-r from-red-500/20 to-orange-500/20 px-4 py-2'>
            <AlertTriangle className='h-4 w-4 text-red-400' />
            <span className='font-medium text-red-300 text-sm'>404 Error</span>
          </div>

          <h1 className='mb-6 font-bold text-4xl md:text-6xl'>
            <span className='bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent'>
              Page Not Found
            </span>
            <br />
            <span className='text-white'>We Can't Find That</span>
          </h1>

          <p className='mx-auto mb-8 max-w-3xl text-gray-300 text-xl leading-relaxed'>
            Sorry, the page you are looking for doesn't exist or has been moved. Let's get you back
            to calculating your UK taxes.
          </p>

          <Link
            href='/'
            className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 font-medium text-white transition-colors hover:from-purple-700 hover:to-cyan-700'
          >
            <Home className='h-4 w-4' />
            Back to Tax Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}
