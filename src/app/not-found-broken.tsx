// src/app/not-found.tsx
'use client';

import React from 'react';
// TODO: Restore animations with CSS-based approach
import { Home, Calculator, ArrowLeft, Coffee } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      {/* BMC Widget is now handled by root layout, no need to import here */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        
        {/* Background gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, 
                hsl(230, 70%, 5%) 0%, 
                hsl(240, 60%, 8%) 25%,
                hsl(250, 70%, 6%) 50%,
                hsl(260, 80%, 7%) 75%,
                hsl(270, 70%, 8%) 100%)
            `
          }}
        />

        {/* Background orbs with CSS animations */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(270, 100%, 80%) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 15s ease-in-out infinite'
          }}
        />

        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, hsl(200, 100%, 70%) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'float 20s ease-in-out infinite 1s'
          }}
        />

        {/* Main content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          
          {/* 404 Number with gradient */}
          <div
            className="mb-6"
          >
            <h1 
              className="font-bold mb-4"
              style={{ 
                fontSize: 'clamp(4rem, 15vw, 12rem)',
                lineHeight: '0.9',
                background: 'linear-gradient(135deg, hsl(270, 100%, 80%) 0%, hsl(200, 100%, 70%) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 20px hsla(270, 100%, 80%, 0.3))'
              }}
            >
              404
            </h1>
          </div>

          {/* Page not found text */}
          <div
            className="mb-8"
          >
            <h2 
              className="font-bold text-white mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
            >
              Page Not Found
            </h2>
            <p 
              className="text-gray-300 max-w-2xl mx-auto leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}
            >
              Looks like you've wandered into uncharted territory. Don't worry, even the best tax calculations sometimes lead to unexpected places!
            </p>
          </div>

          {/* Navigation buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* Back to home button */}
            <Link
              href="/"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, hsl(270, 100%, 80%) 0%, hsl(200, 100%, 70%) 100%)',
                color: 'white',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                boxShadow: '0 4px 15px hsla(270, 100%, 80%, 0.3)'
              }}
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>

            {/* Calculator button */}
            <Link
              href="/#calculator"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-white border border-gray-600 hover:border-purple-400"
              style={{
                background: 'hsla(270, 100%, 80%, 0.1)',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)'
              }}
            >
              <Calculator className="h-5 w-5" />
              <span>Try Calculator</span>
            </Link>
          </div>

          {/* Fun message */}
          <p
            className="mt-8 text-gray-400 text-sm"
            style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}
          >
            Still here? Why not grab a coffee and calculate some taxes? 
            It's more fun than being lost! ☕
          </p>
        </div>

        {/* Decorative elements */}
        <div
          className="absolute top-10 left-10 text-purple-400 opacity-30"
        >
          <Calculator className="h-8 w-8" />
        </div>

        <div
          className="absolute bottom-10 right-10 text-cyan-400 opacity-30"
        >
          <Coffee className="h-8 w-8" />
        </div>
      </div>
    </>
  );
}
