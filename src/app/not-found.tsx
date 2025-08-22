// src/app/not-found-simple.tsx
import Link from 'next/link';
import { Calculator, Coffee } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background gradient */}
      <div className="absolute inset-0" />

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        
        {/* 404 Number with gradient */}
        <div className="mb-6">
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
        <div className="mb-8">
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, hsl(270, 100%, 80%) 0%, hsl(200, 100%, 70%) 100%)',
              color: 'white',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)'
            }}
          >
            <span>← Back to Home</span>
          </Link>

          <Link
            href="/#calculator"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-white"
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
    </div>
  );
}