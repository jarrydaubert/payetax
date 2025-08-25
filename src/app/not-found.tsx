// src/app/not-found.tsx

import { ArrowRight, Calculator, Coffee, FileText, Home, Zap } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden'>
      {/* Animated background */}
      <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
        <div className='absolute inset-0'>
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`floating-${i}-${Math.random()}`}
              className='absolute h-2 w-2 animate-pulse rounded-full bg-purple-400 opacity-20'
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className='relative z-10 mx-auto max-w-6xl px-4 text-center'>
        {/* 404 Animation */}
        <div className='mb-8'>
          <div className='relative inline-block'>
            <h1 className='mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text font-black text-8xl text-transparent md:text-9xl'>
              404
            </h1>
            <div className='-z-10 absolute inset-0 animate-pulse font-black text-8xl text-purple-500/20 md:text-9xl'>
              404
            </div>
          </div>
        </div>

        {/* Error message */}
        <div className='mb-12'>
          <h2 className='mb-4 font-bold text-2xl text-white md:text-4xl'>Oops! Page Not Found</h2>
          <p className='mx-auto mb-6 max-w-2xl text-gray-300 text-lg leading-relaxed md:text-xl'>
            Looks like this page went on vacation to calculate taxes elsewhere. Don't worry, we've
            got plenty more where that came from!
          </p>
          <div className='flex items-center justify-center gap-2 text-purple-400'>
            <Zap className='h-5 w-5 animate-pulse' />
            <span className='font-medium text-sm'>Let's get you back on track</span>
            <Zap className='h-5 w-5 animate-pulse' />
          </div>
        </div>

        {/* Quick actions grid */}
        <div className='mb-12 grid grid-cols-1 gap-6 md:grid-cols-3'>
          <Link
            href='/'
            className='group glass-card rounded-xl border border-purple-400/20 p-6 transition-all duration-300 hover:scale-105 hover:border-purple-400/40'
          >
            <Home className='mx-auto mb-4 h-8 w-8 text-purple-400 transition-colors group-hover:text-purple-300' />
            <h3 className='mb-2 font-semibold text-white'>Go Home</h3>
            <p className='text-gray-400 text-sm'>Back to our main page</p>
            <ArrowRight className='mx-auto mt-3 h-4 w-4 text-purple-400 transition-transform group-hover:translate-x-1' />
          </Link>

          <Link
            href='/#calculator'
            className='group glass-card rounded-xl border border-cyan-400/20 p-6 transition-all duration-300 hover:scale-105 hover:border-cyan-400/40'
          >
            <Calculator className='mx-auto mb-4 h-8 w-8 text-cyan-400 transition-colors group-hover:text-cyan-300' />
            <h3 className='mb-2 font-semibold text-white'>Tax Calculator</h3>
            <p className='text-gray-400 text-sm'>Calculate your UK taxes</p>
            <ArrowRight className='mx-auto mt-3 h-4 w-4 text-cyan-400 transition-transform group-hover:translate-x-1' />
          </Link>

          <Link
            href='/blog'
            className='group glass-card rounded-xl border border-pink-400/20 p-6 transition-all duration-300 hover:scale-105 hover:border-pink-400/40'
          >
            <FileText className='mx-auto mb-4 h-8 w-8 text-pink-400 transition-colors group-hover:text-pink-300' />
            <h3 className='mb-2 font-semibold text-white'>Read Blog</h3>
            <p className='text-gray-400 text-sm'>Tax tips and guides</p>
            <ArrowRight className='mx-auto mt-3 h-4 w-4 text-pink-400 transition-transform group-hover:translate-x-1' />
          </Link>
        </div>

        {/* Fun facts section */}
        <div className='glass-card mb-8 rounded-xl border border-white/10 p-8'>
          <h3 className='mb-4 flex items-center justify-center gap-2 font-semibold text-white text-xl'>
            <Coffee className='h-5 w-5 text-yellow-400' />
            Did You Know?
          </h3>
          <p className='text-base text-gray-300 leading-relaxed'>
            The UK tax system processes over{' '}
            <span className='font-semibold text-purple-400'>30 million</span> PAYE returns annually.
            Our calculator helps thousands of people understand their take-home pay every month!
          </p>
        </div>

        {/* Help text */}
        <p className='text-gray-500 text-sm'>
          If you think this is an error, please{' '}
          <Link href='/feedback' className='text-purple-400 underline hover:text-purple-300'>
            contact us
          </Link>{' '}
          and let us know what happened.
        </p>
      </div>
    </div>
  );
}
