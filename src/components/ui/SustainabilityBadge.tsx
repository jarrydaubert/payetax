// src/components/ui/SustainabilityBadge.tsx
'use client';

import { useState } from 'react';
import { Leaf, Info, X } from 'lucide-react';

export default function SustainabilityBadge() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {/* Sustainability Badge */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setShowDetails(true)}
          className="flex items-center gap-2 px-3 py-2 bg-green-600/90 hover:bg-green-600 text-white text-xs rounded-full transition-colors backdrop-blur-sm"
          aria-label="View sustainability information"
        >
          <Leaf className="h-3 w-3" />
          <span className="hidden sm:inline">Carbon Neutral</span>
          <Info className="h-3 w-3 sm:hidden" />
        </button>
      </div>

      {/* Sustainability Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-400" />
                <h3 className="font-semibold text-white">Eco-Friendly Calculator</h3>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close sustainability details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">🌱 Environmental Impact</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Low Carbon:</strong> ~0.12g CO₂ per page visit</li>
                  <li>• <strong>Efficient Code:</strong> Optimized for minimal energy use</li>
                  <li>• <strong>Green Hosting:</strong> Renewable energy powered</li>
                  <li>• <strong>Offline Ready:</strong> Reduces network requests</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">⚡ Performance Benefits</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Fast Loading:</strong> Under 1.5s initial load</li>
                  <li>• <strong>Cached Assets:</strong> Instant subsequent visits</li>
                  <li>• <strong>Minimal JS:</strong> Efficient calculations</li>
                </ul>
              </div>
              
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
                Making tax calculations sustainable for everyone. 
                <a href="https://www.websitecarbon.com/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline ml-1">
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