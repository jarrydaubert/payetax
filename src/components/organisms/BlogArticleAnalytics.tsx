'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

interface BlogArticleAnalyticsProps {
  slug: string;
  category?: string;
}

/**
 * Fires a single analytics event when a blog article is viewed.
 */
export function BlogArticleAnalytics({ slug, category }: BlogArticleAnalyticsProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) return;

    trackEvent({
      action: 'blog_article_read',
      category: 'content',
      label: slug,
      custom_data: {
        slug,
        category: category || 'uncategorized',
      },
    });

    hasTrackedRef.current = true;
  }, [slug, category]);

  return null;
}
