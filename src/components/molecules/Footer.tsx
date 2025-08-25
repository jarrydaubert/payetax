// src/components/molecules/Footer.tsx

'use client';

import {
  Building,
  Calculator,
  FileText,
  Heart,
  Mail,
  MessageSquare,
  Shield,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { NavigationSection } from '@/types/navigation';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks: NavigationSection[] = [
    {
      title: 'Product',
      links: [
        { name: 'Tax Calculator', href: '/', icon: <Calculator className='h-4 w-4' /> },
        { name: 'Blog', href: '/blog', icon: <FileText className='h-4 w-4' /> },
        { name: 'About', href: '/about', icon: <Building className='h-4 w-4' /> },
      ],
    },
    {
      title: 'Legal',
      links: [{ name: 'Privacy Policy', href: '/privacy', icon: <Shield className='h-4 w-4' /> }],
    },
    {
      title: 'Support',
      links: [
        {
          name: 'Contact Us',
          href: '/feedback',
          icon: <MessageSquare className='h-4 w-4' />,
        },
        {
          name: 'Email Us',
          href: 'mailto:support@toolhubx.uk?subject=ToolHubX%20Tax%20Calculator%20-%20Support%20Request' as const,
          icon: <Mail className='h-4 w-4' />,
          external: true,
        },
      ],
    },
  ];

  return (
    <footer className={cn('mt-auto', className)}>
      {/* Subtle separator line */}
      <div className='h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent' />

      {/* Main footer content */}
      <div className='glass py-6'>
        <div className='w-full px-8 xl:px-12 2xl:px-16'>
          <div className='grid grid-cols-1 gap-12 md:grid-cols-4 xl:gap-16'>
            {/* Brand section */}
            <div className='md:col-span-1'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex h-6 w-6 items-center justify-center rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-purple-500/20'>
                  <Sparkles className='h-3 w-3 text-blue-400' />
                </div>
                <span className='font-bold text-base text-white'>ToolHubX</span>
              </div>
              <p className='mb-3 text-white text-xs leading-relaxed'>
                Professional UK tax calculations using official HMRC rates.
              </p>
              <div className='flex items-center gap-2 text-white/90 text-xs'>
                <span>Built with</span>
                <Heart className='h-2 w-2 text-pink-500' />
                <span>for UK taxpayers</span>
              </div>
            </div>

            {/* Footer links */}
            {footerLinks.map((section) => (
              <div key={section.title} className='space-y-3'>
                <h3 className='font-semibold text-white text-xs uppercase tracking-wider'>
                  {section.title}
                </h3>
                <ul className='space-y-2'>
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {link.external ? (
                        <a
                          href={link.href}
                          className='group flex items-center gap-2 text-white text-xs transition-colors hover:text-blue-400'
                          aria-label={
                            link.name === 'Email Us' ? 'Send email to support' : undefined
                          }
                        >
                          <span className='text-blue-500 transition-transform group-hover:scale-110'>
                            {link.icon}
                          </span>
                          <span>{link.name}</span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className='group flex items-center gap-2 text-white text-xs transition-colors hover:text-blue-400'
                        >
                          <span className='text-blue-500 transition-transform group-hover:scale-110'>
                            {link.icon}
                          </span>
                          <span>{link.name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom section */}
          <div className='mt-4 border-white/20 border-t pt-4'>
            <div className='flex flex-col items-center justify-between gap-3 text-white/90 text-xs md:flex-row'>
              <div>© {currentYear} ToolHubX. All rights reserved.</div>
              <div className='max-w-md text-center text-xs md:text-right'>
                Tax calculations for guidance only. Uses official HMRC rates. Not financial advice.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
