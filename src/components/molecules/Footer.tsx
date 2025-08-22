// src/components/molecules/Footer.tsx

'use client';

import Link from 'next/link';
// TODO: Restore animations with CSS-based approach
import { 
  Heart, 
  Mail, 
  MessageSquare, 
  Shield, 
  FileText,
  Calculator,
  Sparkles,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Tax Calculator', href: '/', icon: <Calculator className="h-4 w-4" /> },
        { name: 'Blog', href: '/blog', icon: <FileText className="h-4 w-4" /> },
        { name: 'About', href: '/about', icon: <Building className="h-4 w-4" /> },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy', icon: <Shield className="h-4 w-4" /> },
      ]
    },
    {
      title: 'Support',
      links: [
        { 
          name: 'Contact Us', 
          href: '/feedback', 
          icon: <MessageSquare className="h-4 w-4" /> 
        },
        { 
          name: 'Email Us', 
          href: 'mailto:support@toolhubx.uk?subject=ToolHubX%20Tax%20Calculator%20-%20Support%20Request', 
          icon: <Mail className="h-4 w-4" />,
          external: true
        },
      ]
    }
  ];

  return (
    <footer className={cn('mt-auto', className)}>
      {/* Subtle separator line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Main footer content */}
      <div className="glass py-6">
        <div className="w-full px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 xl:gap-16">
            
            {/* Brand section */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-blue-400" />
                </div>
                <span className="text-base font-bold text-white">
                  ToolHubX
                </span>
              </div>
              <p className="text-white text-xs leading-relaxed mb-3">
                Professional UK tax calculations using official HMRC rates.
              </p>
              <div className="flex items-center gap-2 text-xs text-white/90">
                <span>Built with</span>
                <Heart className="h-2 w-2 text-pink-500" />
                <span>for UK taxpayers</span>
              </div>
            </div>

            {/* Footer links */}
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="font-semibold text-white text-xs uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {link.external ? (
                        <a
                          href={link.href}
                          className="group flex items-center gap-2 text-white hover:text-blue-400 transition-colors text-xs"
                          aria-label={link.name === 'Email Us' ? 'Send email to support' : undefined}
                        >
                          <span className="text-blue-500 group-hover:scale-110 transition-transform">
                            {link.icon}
                          </span>
                          <span>{link.name}</span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="group flex items-center gap-2 text-white hover:text-blue-400 transition-colors text-xs"
                        >
                          <span className="text-blue-500 group-hover:scale-110 transition-transform">
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
          <div className="border-t border-white/20 mt-4 pt-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/90">
              <div>© {currentYear} ToolHubX. All rights reserved.</div>
              <div className="text-xs max-w-md text-center md:text-right">
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
