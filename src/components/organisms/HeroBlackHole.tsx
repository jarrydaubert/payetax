'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const HeroBlackHole: React.FC = () => {
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);

  return (
    <section
      className={cn(
        'relative min-h-[60vh] md:min-h-[80vh] flex flex-col items-center justify-center overflow-visible',
        'bg-gradient-to-b from-background to-muted/50 text-foreground z-0'
      )}
    >
      {/* Text */}
      <a
        href="#calculator"
        className="absolute top-8 text-sm opacity-70 hover:opacity-100 transition-opacity px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 z-20"
      >
        Get Started
      </a>
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center max-w-4xl px-4 z-20">
        Calculate Smarter with ToolHubX
      </h1>
      <p className="text-lg md:text-xl mb-8 text-center opacity-70 max-w-2xl px-4 z-20">
        HMRC-compliant UK tax tools: Never miss a deduction, idea, or saving.
      </p>
      <a
        href="#calculator"
        className="relative overflow-hidden px-6 py-3 rounded-full inline-flex items-center group z-20 text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #8b5cf6, #d946ef)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }}
      >
        <span className="relative z-10">Start Your Free Calculation</span>
        <ArrowRight className="h-5 w-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>

      {/* Glow Effect */}
      <div className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-[-1]">
        {/* Arc */}
        <motion.div
          className="absolute bottom-0 left-1/2 w-full h-[80vh] hero-glow-arc rounded-t-full -translate-x-1/2"
          animate={{ scaleY: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Inner Glow */}
        <motion.div
          className="absolute bottom-0 left-1/2 w-[80%] h-[60vh] hero-inner-glow rounded-t-full -translate-x-1/2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Streaks */}
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 left-1/2 hero-streak h-[40vh] w-[2px]"
            style={{
              transform: `translate(-50%, 0) rotate(${i * 15 - 180}deg) translateY(50%)`,
            }}
            animate={{ height: ['40vh', '60vh', '40vh'] }}
            transition={{ duration: 1.5 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Twinkling Stars - Restored, with random */}
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute hero-star hero-twinkle rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              animationDelay: `${Math.random() * 2}s`,
            }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
          />
        ))}

        {/* Rotating Circles with Dots - Reflect-style */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full hero-rotate">
          {/* Circle 1 */}
          <div className="absolute bottom-0 left-1/2 w-[60%] h-[60%] rounded-full -translate-x-1/2 translate-y-1/2">
            {[...Array(8)].map((_, j) => (
              <div
                key={j}
                className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-white/80 transition-all duration-300"
                style={{
                  transform: `translate(-50%, -50%) rotate(${j * 45}deg) translate(50%, 0)`,
                  boxShadow: hoveredDot === j ? '0 0 20px rgba(255, 255, 255, 0.8)' : '0 0 8px rgba(255, 255, 255, 0.4)'
                }}
                onMouseEnter={() => setHoveredDot(j)}
                onMouseLeave={() => setHoveredDot(null)}
              >
                {(j === 1 || j === 3 || j === 5) && (
                  <div 
                    className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap transition-opacity duration-300"
                    style={{ opacity: hoveredDot === j ? 1 : 0 }}
                  >
                    Feature {j + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Circle 2 - Reverse */}
          <div className="absolute bottom-0 left-1/2 w-[40%] h-[40%] rounded-full -translate-x-1/2 translate-y-1/2 hero-rotate" style={{ animationDirection: 'reverse' }}>
            {[...Array(8)].map((_, j) => (
              <div
                key={j}
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-white/60 transition-all duration-300"
                style={{
                  transform: `translate(-50%, -50%) rotate(${j * 45}deg) translate(40%, 0)`,
                  boxShadow: hoveredDot === j + 8 ? '0 0 15px rgba(255, 255, 255, 0.6)' : '0 0 6px rgba(255, 255, 255, 0.3)'
                }}
                onMouseEnter={() => setHoveredDot(j + 8)}
                onMouseLeave={() => setHoveredDot(null)}
              >
                {(j === 0 || j === 2 || j === 4) && (
                  <div 
                    className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap transition-opacity duration-300"
                    style={{ opacity: hoveredDot === j + 8 ? 1 : 0 }}
                  >
                    Tool {j + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Circle 3 */}
          <div className="absolute bottom-0 left-1/2 w-[20%] h-[20%] rounded-full -translate-x-1/2 translate-y-1/2 hero-rotate">
            {[...Array(8)].map((_, j) => (
              <div
                key={j}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white/40 transition-all duration-300"
                style={{
                  transform: `translate(-50%, -50%) rotate(${j * 45}deg) translate(30%, 0)`,
                  boxShadow: hoveredDot === j + 16 ? '0 0 10px rgba(255, 255, 255, 0.4)' : '0 0 4px rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={() => setHoveredDot(j + 16)}
                onMouseLeave={() => setHoveredDot(null)}
              >
                {(j === 1 || j === 4 || j === 7) && (
                  <div 
                    className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap transition-opacity duration-300"
                    style={{ opacity: hoveredDot === j + 16 ? 1 : 0 }}
                  >
                    Calc {j + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBlackHole;
