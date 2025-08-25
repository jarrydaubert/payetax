// src/components/ui/SustainabilityBadge.tsx
'use client';

import { Info, Leaf, X } from 'lucide-react';
import { useState } from 'react';

export default function SustainabilityBadge() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {/* Sustainability Badge */}
      <div className='fixed bottom-4 left-4 z-40'>
        <button
          type='button'
          onClick={() => setShowDetails(true)}
          className='flex items-center gap-2 rounded-full bg-green-600/90 px-3 py-2 text-white text-xs backdrop-blur-sm transition-colors hover:bg-green-600'
          aria-label='View sustainability information'
        >
          <Leaf className='h-3 w-3' />
          <span className='hidden sm:inline'>Carbon Neutral</span>
          <Info className='h-3 w-3 sm:hidden' />
        </button>
      </div>

      {/* Sustainability Details Modal */}
      {showDetails && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6'>
            <div className='mb-4 flex items-start justify-between'>
              <div className='flex items-center gap-2'>
                <Leaf className='h-5 w-5 text-green-400' />
                <h3 className='font-semibold text-white'>Eco-Friendly Calculator</h3>
              </div>
              <button
                type='button'
                onClick={() => setShowDetails(false)}
                className='text-gray-400 hover:text-white'
                aria-label='Close sustainability details'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <div className='space-y-4 text-gray-300 text-sm'>
              <div>
                <h4 className='mb-2 font-medium text-white'>🌱 Environmental Impact</h4>
                <ul className='space-y-1 text-xs'>
                  <li>
                    • <strong>Low Carbon:</strong> ~0.12g CO₂ per page visit
                  </li>
                  <li>
                    • <strong>Efficient Code:</strong> Optimized for minimal energy use
                  </li>
                  <li>
                    • <strong>Optimized Hosting:</strong> Efficient serverless infrastructure
                  </li>
                  <li>
                    • <strong>Offline Ready:</strong> Reduces network requests
                  </li>
                </ul>
              </div>

              <div>
                <h4 className='mb-2 font-medium text-white'>⚡ Performance Benefits</h4>
                <ul className='space-y-1 text-xs'>
                  <li>
                    • <strong>Fast Loading:</strong> Under 1.5s initial load
                  </li>
                  <li>
                    • <strong>Cached Assets:</strong> Instant subsequent visits
                  </li>
                  <li>
                    • <strong>Minimal JS:</strong> Efficient calculations
                  </li>
                </ul>
              </div>

              <div className='border-gray-700 border-t pt-2 text-gray-400 text-xs'>
                Making tax calculations sustainable for everyone.
                <a
                  href='https://www.websitecarbon.com/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='ml-1 text-green-400 hover:underline'
                >
                  Learn more about web sustainability
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
