// src/components/ui/SustainabilityBadge.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Leaf, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

export default function SustainabilityBadge() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {/* Sustainability Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className='fixed bottom-4 left-4 z-40'
      >
        <Button
          onClick={() => setShowDetails(true)}
          size='default'
          className={cn(
            'gap-2 rounded-full bg-green-600/90 backdrop-blur-sm hover:bg-green-600',
            TYPOGRAPHY.TEXT_SM
          )}
          aria-label='View eco-friendly information'
        >
          <Leaf className={ICON_SIZES.SIZE_4} aria-hidden='true' />
          <span className='hidden sm:inline'>Eco-Friendly</span>
        </Button>
      </motion.div>

      {/* Sustainability Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
              onClick={() => setShowDetails(false)}
            />

            {/* Modal */}
            <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className='relative w-full max-w-md'
                onClick={(e) => e.stopPropagation()}
              >
                <Card className='border-0 bg-card/95 p-6 backdrop-blur-xl'>
                  {/* Header */}
                  <div className='mb-6 flex items-start justify-between'>
                    <div className='flex items-center gap-2'>
                      <Leaf
                        className={cn(ICON_SIZES.SIZE_6, 'text-green-600 dark:text-green-400')}
                        aria-hidden='true'
                      />
                      <h3 className={cn('font-semibold', TYPOGRAPHY.TEXT_XL)}>
                        Eco-Friendly Calculator
                      </h3>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setShowDetails(false)}
                      className='size-8'
                      aria-label='Close'
                    >
                      <X className={ICON_SIZES.SIZE_4} aria-hidden='true' />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className={cn('space-y-5 text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                    {/* Environmental Impact */}
                    <div>
                      <h4
                        className={cn(
                          'mb-3 flex items-center gap-2 font-medium text-foreground',
                          TYPOGRAPHY.TEXT_BASE
                        )}
                      >
                        🌱 Environmental Impact
                      </h4>
                      <ul className={cn('space-y-2', TYPOGRAPHY.TEXT_SM)}>
                        <li className='flex gap-2'>
                          <span className='text-green-600 dark:text-green-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Low Carbon:</strong> Estimated ~0.2g
                            CO₂ per page visit (avg. web page: 1.76g)
                          </span>
                        </li>
                        <li className='flex gap-2'>
                          <span className='text-green-600 dark:text-green-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Efficient Code:</strong> 309KB
                            initial bundle, optimized for minimal energy
                          </span>
                        </li>
                        <li className='flex gap-2'>
                          <span className='text-green-600 dark:text-green-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Green Hosting:</strong> Deployed on
                            Vercel's carbon-neutral infrastructure
                          </span>
                        </li>
                        <li className='flex gap-2'>
                          <span className='text-green-600 dark:text-green-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Offline Ready:</strong> PWA reduces
                            repeat network requests
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Performance Benefits */}
                    <div>
                      <h4
                        className={cn(
                          'mb-3 flex items-center gap-2 font-medium text-foreground',
                          TYPOGRAPHY.TEXT_BASE
                        )}
                      >
                        ⚡ Performance Benefits
                      </h4>
                      <ul className={cn('space-y-2', TYPOGRAPHY.TEXT_SM)}>
                        <li className='flex gap-2'>
                          <span className='text-blue-600 dark:text-blue-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Fast Loading:</strong> Static
                            generation with ISR
                          </span>
                        </li>
                        <li className='flex gap-2'>
                          <span className='text-blue-600 dark:text-blue-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Edge Caching:</strong> Content
                            served from nearest location
                          </span>
                        </li>
                        <li className='flex gap-2'>
                          <span className='text-blue-600 dark:text-blue-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Client-Side Calculations:</strong>{' '}
                            No server requests needed
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className={cn('border-border border-t pt-4', TYPOGRAPHY.TEXT_SM)}>
                      <p className='mb-2'>Making tax calculations sustainable for everyone.</p>
                      <a
                        href='https://www.websitecarbon.com/'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 text-green-600 hover:underline dark:text-green-400'
                      >
                        Learn more about web sustainability →
                      </a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
