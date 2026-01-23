// src/components/molecules/TableOfContents.tsx
'use client';

import List from 'lucide-react/dist/esm/icons/list.js';
import { useEffect, useState } from 'react';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  index: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

function extractHeadings(content: string): TocItem[] {
  // Only extract h2 headings (##)
  const headingRegex = /^##\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let index = 0;

  for (const match of content.matchAll(headingRegex)) {
    const text = match[1]?.trim();
    if (!text) continue;
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    headings.push({ id, text, index });
    index++;
  }

  return headings;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const headings = extractHeadings(content);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px', threshold: 0 }
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className={cn('hidden xl:block', className)} aria-label='Table of contents'>
      <div className='sticky top-24'>
        <div className='mb-3 flex items-center gap-2 font-semibold text-foreground'>
          <List className={ICON_SIZES.SIZE_4} aria-hidden='true' />
          <span className={TYPOGRAPHY.TEXT_SM}>On this page</span>
        </div>
        <ul className='space-y-2 border-foreground/10 border-l'>
          {headings.map((heading) => (
            <li key={`${heading.id}-${heading.index}`}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    setActiveId(heading.id);
                  }
                }}
                className={cn(
                  '-ml-px block border-l-2 py-1 pl-4 transition-colors',
                  TYPOGRAPHY.TEXT_SM,
                  activeId === heading.id
                    ? 'border-primary font-medium text-primary'
                    : 'border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
