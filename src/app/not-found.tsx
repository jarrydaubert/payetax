// src/app/not-found.tsx

import { ArrowRight, Calculator, Coffee, FileText, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden pt-20'>
      {/* Animated background */}
      <div className='absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background'>
        <div className='absolute inset-0'>
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => {
            const left = (i * 137.5) % 100; // Golden angle distribution
            const top = (i * 37.5) % 100;
            const delay = (i * 0.15) % 3;
            const duration = 2 + (i % 4);
            return (
              <div
                key={`particle-${left}-${top}-${delay}`}
                className='absolute h-2 w-2 animate-pulse rounded-full bg-primary opacity-20'
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className='relative z-10 mx-auto max-w-6xl px-4 text-center'>
        {/* 404 Animation */}
        <div className='mb-8'>
          <div className='relative inline-block'>
            <h1 className='mb-2 bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text font-black text-7xl text-transparent'>
              404
            </h1>
            <div className='-z-10 absolute inset-0 animate-pulse font-black text-7xl text-primary/10'>
              404
            </div>
          </div>
        </div>

        {/* Error message */}
        <div className='mb-12'>
          <h2 className='mb-4 font-bold text-3xl text-foreground'>Oops! Page Not Found</h2>
          <p className='mx-auto mb-6 max-w-2xl text-lg text-muted-foreground leading-relaxed'>
            Looks like this page went on vacation to calculate taxes elsewhere. Don't worry, we've
            got plenty more where that came from!
          </p>
          <div className='flex items-center justify-center gap-2 text-primary'>
            <Sparkles className='h-5 w-5 animate-pulse' />
            <span className='font-medium text-sm'>Let's get you back on track</span>
            <Sparkles className='h-5 w-5 animate-pulse' />
          </div>
        </div>

        {/* Quick actions grid */}
        <div className='mb-12 grid grid-cols-1 gap-6 md:grid-cols-3'>
          <Link
            href='/'
            className='group glass-card rounded-xl border border-primary/20 p-6 transition-all duration-300 active:scale-[1.02] md:hover:scale-105 md:hover:border-primary/40'
          >
            <Home className='mx-auto mb-4 h-8 w-8 text-primary transition-colors group-hover:text-primary/80' />
            <h3 className='mb-2 font-semibold text-foreground'>Go Home</h3>
            <p className='text-muted-foreground text-sm'>Back to our main page</p>
            <ArrowRight className='mx-auto mt-3 h-4 w-4 text-primary transition-transform group-hover:translate-x-1' />
          </Link>

          <Link
            href='/#tax-calculator'
            className='group glass-card rounded-xl border border-cyan-500/20 p-6 transition-all duration-300 hover:border-cyan-500/40 active:scale-[1.02] md:hover:scale-105'
          >
            <Calculator className='mx-auto mb-4 h-8 w-8 text-cyan-500 transition-colors group-hover:text-cyan-400' />
            <h3 className='mb-2 font-semibold text-foreground'>Tax Calculator</h3>
            <p className='text-muted-foreground text-sm'>Calculate your UK taxes</p>
            <ArrowRight className='mx-auto mt-3 h-4 w-4 text-cyan-500 transition-transform group-hover:translate-x-1' />
          </Link>

          <Link
            href='/blog'
            className='group glass-card rounded-xl border border-pink-500/20 p-6 transition-all duration-300 hover:border-pink-500/40 active:scale-[1.02] md:hover:scale-105'
          >
            <FileText className='mx-auto mb-4 h-8 w-8 text-pink-500 transition-colors group-hover:text-pink-400' />
            <h3 className='mb-2 font-semibold text-foreground'>Read Blog</h3>
            <p className='text-muted-foreground text-sm'>Tax tips and guides</p>
            <ArrowRight className='mx-auto mt-3 h-4 w-4 text-pink-500 transition-transform group-hover:translate-x-1' />
          </Link>
        </div>

        {/* Fun facts section */}
        <div className='glass-card mb-8 rounded-xl border border-border p-8'>
          <h3 className='mb-4 flex items-center justify-center gap-2 font-semibold text-foreground text-xl'>
            <Coffee className='h-5 w-5 text-yellow-500 dark:text-yellow-400' />
            Did You Know?
          </h3>
          <p className='text-base text-muted-foreground leading-relaxed'>
            The UK tax system processes over{' '}
            <span className='font-semibold text-primary'>30 million</span> PAYE returns annually.
            Our calculator helps thousands of people understand their take-home pay every month!
          </p>
        </div>

        {/* Help text */}
        <p className='text-muted-foreground text-sm'>
          If you think this is an error, please{' '}
          <a
            href='mailto:support@payetax.co.uk?subject=404 Error Report'
            className='text-primary underline hover:text-primary/80'
          >
            contact us
          </a>{' '}
          and let us know what happened.
        </p>
      </div>
    </div>
  );
}
