// src/components/ui/SustainabilityBadge.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Leaf, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
          className='gap-2 rounded-full bg-green-600/90 text-sm backdrop-blur-sm hover:bg-green-600'
          aria-label='View eco-friendly information'
        >
          <Leaf className='size-4' />
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
                      <Leaf className='size-6 text-green-400' />
                      <h3 className='font-semibold text-xl'>Eco-Friendly Calculator</h3>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setShowDetails(false)}
                      className='size-8'
                      aria-label='Close'
                    >
                      <X className='size-4' />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className='space-y-5 text-muted-foreground text-sm'>
                    {/* Environmental Impact */}
                    <div>
                      <h4 className='mb-3 flex items-center gap-2 font-medium text-base text-foreground'>
                        🌱 Environmental Impact
                      </h4>
                      <ul className='space-y-2 text-sm'>
                        <li className='flex gap-2'>
                          <span className='text-green-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Low Carbon:</strong> ~0.2g CO₂ per
                            page visit (avg. web page: 1.76g)
                          </span>
                        </li>
                        <li className='flex gap-2'>
                          <span className='text-green-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Efficient Code:</strong> 286KB
                            initial bundle, optimized for minimal energy
                          </span>
                        </li>
                        <li className='flex gap-2'>
                          <span className='text-green-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Green Hosting:</strong> Deployed on
                            Vercel's carbon-neutral infrastructure
                          </span>
                        </li>
                        <li className='flex gap-2'>
                          <span className='text-green-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Offline Ready:</strong> PWA reduces
                            repeat network requests
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Performance Benefits */}
                    <div>
                      <h4 className='mb-3 flex items-center gap-2 font-medium text-base text-foreground'>
                        ⚡ Performance Benefits
                      </h4>
                      <ul className='space-y-2 text-sm'>
                        <li className='flex gap-2'>
                          <span className='text-blue-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Fast Loading:</strong> Static
                            generation with ISR
                          </span>
                        </li>
                        <li className='flex gap-2'>
                          <span className='text-blue-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Edge Caching:</strong> Content
                            served from nearest location
                          </span>
                        </li>
                        <li className='flex gap-2'>
                          <span className='text-blue-400'>•</span>
                          <span>
                            <strong className='text-foreground'>Client-Side Calculations:</strong>{' '}
                            No server requests needed
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className='border-border border-t pt-4 text-sm'>
                      <p className='mb-2'>Making tax calculations sustainable for everyone.</p>
                      <a
                        href='https://www.websitecarbon.com/'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 text-green-400 hover:underline'
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
