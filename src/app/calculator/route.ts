// src/app/calculator/route.ts
/**
 * Calculator route redirect (308 Permanent)
 *
 * /calculator permanently redirects to homepage where the main calculator lives.
 * Dynamic salary routes like /calculator/30000 are handled by [salary]/page.tsx
 */

import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://payetax.co.uk';

export function GET() {
  return NextResponse.redirect(new URL('/', SITE_URL), 308);
}
