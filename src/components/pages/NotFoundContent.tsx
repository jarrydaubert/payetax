'use client';

import { Home } from 'lucide-react';
import Link from 'next/link';
import { robotoFlex } from '@/app/fonts';

export default function NotFoundContent() {
  return (
    <div className={`${robotoFlex.variable} font-sans`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">404</h1>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="w-5 h-5 mr-2" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
