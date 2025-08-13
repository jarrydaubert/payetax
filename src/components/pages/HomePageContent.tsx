'use client';

import { 
  Calculator, 
  Info, 
  TrendingUp, 
  Shield, 
  BarChart, 
  Clock,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Zap,
  Lock,
  BookOpen,
  Sparkles,
  Eye,
  FileText,
  Brain
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { cn } from '@/lib/utils';
import HeroBlackHole from '@/components/organisms/HeroBlackHole'; // New import

// Dynamically import heavy components for better performance
const TaxCalculatorForm = dynamic(() => import('@/components/organisms/TaxCalculatorForm'), {
  loading: () => (
    <div className="glass-card p-8 animate-pulse bg-white/20 dark:bg-gray-800/20 h-96 rounded-xl">
      <div className="space-y-4">
        <div className="h-6 bg-white/30 dark:bg-gray-700/30 rounded w-1/2"></div>
        <div className="h-4 bg-white/20 dark:bg-gray-700/20 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-10 bg-white/20 dark:bg-gray-700/20 rounded"></div>
          <div className="h-10 bg-white/20 dark:bg-gray-700/20 rounded"></div>
        </div>
      </div>
    </div>
  )
});

const TaxSummary = dynamic(() => import('@/components/molecules/TaxSummary'), {
  loading: () => (
    <div className="glass-card p-6 animate-pulse bg-white/20 dark:bg-gray-800/20 h-48 rounded-xl">
      <div className="space-y-3">
        <div className="h-4 bg-white/30 dark:bg-gray-700/30 rounded w-1/3"></div>
        <div className="h-8 bg-white/20 dark:bg-gray-700/20 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-white/20 dark:bg-gray-700/20 rounded"></div>
          <div className="h-3 bg-white/20 dark:bg-gray-700/20 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  )
});

const ResultsTableLazy = dynamic(() => import('@/components/organisms/ResultsTable'), {
  loading: () => (
    <div className="glass-card p-6 animate-pulse bg-white/20 dark:bg-gray-800/20 h-64 rounded-xl">
      <div className="space-y-3">
        <div className="h-4 bg-white/30 dark:bg-gray-700/30 rounded w-1/4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex justify-between">
              <div className="h-3 bg-white/20 dark:bg-gray-700/20 rounded w-1/3"></div>
              <div className="h-3 bg-white/20 dark:bg-gray-700/20 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
});

/**
 * Enhanced home page content component
 */
export default function HomePageContent() {
  const { input, results } = useCalculatorStore();
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side only rendering for store access
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* New Hero Section - Placed at top */}
        <HeroBlackHole />

        {/* Existing Hero Section - Now below new hero */}
        <section className="pt-8 pb-6">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                UK Tax Calculator 2024-2025
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Calculate your take-home pay instantly with our advanced PAYE calculator. 
                Accurate, private, and completely free - designed for UK taxpayers.
              </p>
            </div>

            {/* No-scroll calculation area for large screens */}
            <div id="calculator" className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto"> {/* Added id for scroll anchor */}
              {/* Calculator Form - Enhanced width utilization */}
              <div className="order-1">
                <Suspense fallback={<div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"></div>}>
                  <TaxCalculatorForm className="h-full" autoCalculate />
                </Suspense>
              </div>

              {/* Results Section - Enhanced layout */}
              <div className="order-2 space-y-6">
                {/* Tax Summary Card */}
                <Suspense fallback={<div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"></div>}>
                  {results && (
                    <TaxSummary results={results} />
                  )}
                </Suspense>

                {/* Detailed Results Table */}
                {results && input.salary > 0 && (
                  <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"></div>}>
                    <ResultsTableLazy results={results} />
                  </Suspense>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Rest of your sections remain unchanged */}
        {/* Features Section */}
        <section className="relative z-10 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose ToolHubX?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Professional-grade tax calculation with cutting-edge design and privacy-first approach.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: <Calculator className="h-8 w-8" />,
                  title: "Instant Results",
                  description: "Real-time calculations as you type, with detailed breakdowns and visual charts"
                },
                {
                  icon: <BarChart className="h-8 w-8" />,
                  title: "Visual Breakdowns",
                  description: "Clear charts and tables showing exactly where your money goes"
                },
                {
                  icon: <Lock className="h-8 w-8" />,
                  title: "Privacy Focused",
                  description: "All calculations happen in your browser - we never store your financial data"
                },
                {
                  icon: <Zap className="h-8 w-8" />,
                  title: "Export Options",
                  description: "Print or download your results for personal records or planning"
                }
              ].map((feature, index) => (
                <div key={index} className="glass-card p-6 text-center group hover:shadow-xl transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cutting-Edge Blog Discovery Section */}
        <section className="relative z-10 py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            {/* Section Header with Sparkle Animation */}
            <div className="text-center mb-16 relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 mb-6 relative">
                <BookOpen className="h-10 w-10 text-white" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Master UK Taxation
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Dive deep into our comprehensive guides, expert tips, and latest tax insights. 
                Transform complexity into clarity with our cutting-edge content.
              </p>
            </div>

            {/* Interactive Blog Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
              {[
                {
                  category: 'tax-basics',
                  title: 'Tax Fundamentals',
                  description: 'Master the essentials of UK taxation',
                  icon: <Brain className="h-8 w-8" />,
                  gradient: 'from-blue-500 to-cyan-500',
                  hoverGradient: 'from-blue-600 to-cyan-600',
                  articles: '12+ guides'
                },
                {
                  category: 'tax-tips',
                  title: 'Smart Strategies',
                  description: 'Optimize your tax efficiency legally',
                  icon: <TrendingUp className="h-8 w-8" />,
                  gradient: 'from-green-500 to-emerald-500',
                  hoverGradient: 'from-green-600 to-emerald-600',
                  articles: '8+ tips'
                },
                {
                  category: 'tax-news',
                  title: 'Latest Updates',
                  description: 'Stay current with tax law changes',
                  icon: <Eye className="h-8 w-8" />,
                  gradient: 'from-purple-500 to-violet-500',
                  hoverGradient: 'from-purple-600 to-violet-600',
                  articles: '6+ updates'
                }
              ].map((item, index) => (
                <Link 
                  key={item.category}
                  href={`/blog/category/${item.category}`}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105"
                >
                  {/* Animated Background */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-80 transition-all duration-500",
                    item.gradient,
                    `group-hover:opacity-100 group-hover:bg-gradient-to-br group-hover:${item.hoverGradient}`
                  )}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-500"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[200px]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                          {item.icon}
                        </div>
                        <span className="text-sm font-medium text-white/80 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          {item.articles}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:scale-105 transition-transform duration-300">
                        {item.title}
                      </h3>
                      
                      <p className="text-white/90 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-white font-medium mt-6 group-hover:translate-x-2 transition-transform duration-300">
                      <span>Explore guides</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                </Link>
              ))}
            </div>

            {/* All Articles CTA with Immersive Design */}
            <div className="text-center">
              <Link 
                href="/blog"
                className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-700 via-purple-700 to-pink-700 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500"></div>
                
                {/* Button content */}
                <div className="relative z-10 flex items-center">
                  <FileText className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Browse All Articles</span>
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="relative z-10 py-16 bg-gray-50/50 dark:bg-gray-800/20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center items-center space-x-8 mb-8">
                {[
                  { icon: Shield, label: "Privacy First" },
                  { icon: Award, label: "Accurate Results" },
                  { icon: Users, label: "Trusted by 10k+" },
                  { icon: Clock, label: "Always Updated" }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center group">
                    <div className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-lg group-hover:shadow-xl transition-shadow duration-300 mb-2">
                      <item.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Trusted by UK Taxpayers
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Join thousands of users who trust ToolHubX for accurate tax calculations. 
                  Our calculator follows HMRC guidelines and is updated for the latest tax year.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
