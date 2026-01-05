'use client';

import { Leaf, X } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

export default function SustainabilityBadge() {
  const [showDetails, setShowDetails] = useState(false);
  const titleId = useId();

  return (
    <>
      {/* Sustainability Badge - CSS animation */}
      <div className='fade-in slide-in-from-bottom-2 fixed bottom-4 left-4 z-40 animate-in duration-500'>
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
      </div>

      {/* Modal - CSS animations */}
      {showDetails && (
        <>
          {/* Backdrop */}
          <button
            type='button'
            className='fade-in fixed inset-0 z-50 animate-in bg-black/60 backdrop-blur-sm duration-200'
            onClick={() => setShowDetails(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowDetails(false)}
            aria-label='Close modal'
          />

          {/* Modal */}
          <div className={cn('fixed inset-0 z-50 flex items-center justify-center', SPACING.P_4)}>
            <div
              className='fade-in zoom-in-95 slide-in-from-bottom-2 relative w-full max-w-md animate-in duration-200'
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === 'Escape' && setShowDetails(false)}
              role='dialog'
              aria-modal='true'
              aria-labelledby={titleId}
            >
              <Card className={cn('border-0 bg-card/95 backdrop-blur-xl', SPACING.P_6)}>
                {/* Header */}
                <div className={cn('flex items-start justify-between', SPACING.MB_6)}>
                  <div className={cn('flex items-center', SPACING.GAP_2)}>
                    <Leaf
                      className={cn(ICON_SIZES.SIZE_6, 'text-green-600 dark:text-green-400')}
                      aria-hidden='true'
                    />
                    <h3 id={titleId} className={cn('font-semibold', TYPOGRAPHY.TEXT_XL)}>
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
                <div className={cn('text-muted-foreground', SPACING.SPACE_Y_6, TYPOGRAPHY.TEXT_SM)}>
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
                    <ul className={cn(SPACING.SPACE_Y_2, TYPOGRAPHY.TEXT_SM)}>
                      <li className={cn('flex', SPACING.GAP_2)}>
                        <span className='text-green-600 dark:text-green-400'>•</span>
                        <span>
                          <strong className='text-foreground'>Low Carbon:</strong> Cleaner than 90%
                          of websites tested
                        </span>
                      </li>
                      <li className={cn('flex', SPACING.GAP_2)}>
                        <span className='text-green-600 dark:text-green-400'>•</span>
                        <span>
                          <strong className='text-foreground'>Efficient Code:</strong> Optimized
                          bundle with tree-shaking
                        </span>
                      </li>
                      <li className={cn('flex', SPACING.GAP_2)}>
                        <span className='text-green-600 dark:text-green-400'>•</span>
                        <span>
                          <strong className='text-foreground'>Green Hosting:</strong> Deployed on
                          Vercel&apos;s carbon-neutral infrastructure
                        </span>
                      </li>
                      <li className={cn('flex', SPACING.GAP_2)}>
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
                    <ul className={cn(SPACING.SPACE_Y_2, TYPOGRAPHY.TEXT_SM)}>
                      <li className={cn('flex', SPACING.GAP_2)}>
                        <span className='text-blue-600 dark:text-blue-400'>•</span>
                        <span>
                          <strong className='text-foreground'>Static Generation:</strong> Pre-built
                          pages with ISR
                        </span>
                      </li>
                      <li className={cn('flex', SPACING.GAP_2)}>
                        <span className='text-blue-600 dark:text-blue-400'>•</span>
                        <span>
                          <strong className='text-foreground'>Edge Caching:</strong> Content served
                          from nearest location
                        </span>
                      </li>
                      <li className={cn('flex', SPACING.GAP_2)}>
                        <span className='text-blue-600 dark:text-blue-400'>•</span>
                        <span>
                          <strong className='text-foreground'>Client Calculations:</strong> Zero
                          server requests for tax math
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Footer */}
                  <div className={cn('border-border border-t pt-4', TYPOGRAPHY.TEXT_SM)}>
                    <p className={SPACING.MB_2}>
                      Making tax calculations sustainable for everyone.
                    </p>
                    <a
                      href='https://www.websitecarbon.com/website/payetax-co-uk/'
                      target='_blank'
                      rel='noopener noreferrer'
                      className={cn(
                        'inline-flex items-center text-green-600 hover:underline dark:text-green-400',
                        SPACING.GAP_1
                      )}
                    >
                      Check our carbon score →
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}
