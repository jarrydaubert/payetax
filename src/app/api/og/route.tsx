// src/app/api/og/route.tsx
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { CURRENT_TAX_YEAR, formatTaxYearDisplay } from '@/constants/taxRates';
import { checkRateLimit, createRateLimitHeaders } from '@/lib/rateLimit';
import { getClientIdentifier } from '@/lib/security/clientIdentifier';

const RATE_LIMIT = { max: 10, window: 60000 };

// Cache headers for CDN - OG images are expensive to generate
const CACHE_HEADERS = {
  'Cache-Control': 'public, immutable, s-maxage=31536000, stale-while-revalidate=86400',
};

const paper = '#f8f5ed';
const ink = '#07111f';
const inkMuted = '#465468';
const inkBlue = '#113f72';
const rule = '#cfc7b8';
const sans = 'Arial, Helvetica, sans-serif';
const display = 'Georgia, "Times New Roman", serif';
const mono = 'Menlo, Consolas, monospace';

const TRUST_ITEMS = [
  'Official HMRC rates',
  'Fast in-browser results',
  'Your data stays private',
  'No signup needed',
];

function GridBackground() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(to right, rgba(17, 63, 114, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 63, 114, 0.08) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }}
    />
  );
}

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request, { fallbackPrefix: 'ua:' });
  if (!(await checkRateLimit(`og:${clientId}`, RATE_LIMIT))) {
    return new Response('Too many requests', {
      status: 429,
      headers: createRateLimitHeaders(RATE_LIMIT),
    });
  }

  const taxYearLabel = formatTaxYearDisplay(CURRENT_TAX_YEAR, {
    separator: '/',
    shortEndYear: true,
  });

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: paper,
        color: ink,
        padding: '64px',
        fontFamily: sans,
        textAlign: 'center',
      }}
    >
      <GridBackground />

      {/* Eyebrow */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          zIndex: 1,
          border: `2px solid rgba(17, 63, 114, 0.25)`,
          borderRadius: '4px',
          padding: '8px 20px',
          marginBottom: '36px',
          color: inkBlue,
          fontFamily: mono,
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '5px',
          textTransform: 'uppercase',
        }}
      >
        Updated for {taxYearLabel}
      </div>

      {/* Headline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          fontFamily: display,
          fontSize: '76px',
          fontWeight: 700,
          letterSpacing: '-2px',
          lineHeight: 1.02,
          marginBottom: '28px',
        }}
      >
        <span>UK PAYE tax calculator</span>
        <span style={{ color: inkBlue }}>See your take-home pay</span>
      </div>

      {/* Tagline */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          zIndex: 1,
          maxWidth: '860px',
          color: inkMuted,
          fontSize: '28px',
          lineHeight: 1.4,
          marginBottom: '48px',
        }}
      >
        Estimate your take-home pay with official HMRC rates for income tax, National Insurance,
        student loans, and pensions.
      </div>

      {/* Trust strip */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          zIndex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          borderTop: `2px solid ${rule}`,
          paddingTop: '32px',
        }}
      >
        {TRUST_ITEMS.map((text) => (
          <div
            key={text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: inkMuted,
              fontSize: '22px',
            }}
          >
            <svg
              width='22'
              height='22'
              viewBox='0 0 24 24'
              fill='none'
              stroke={inkBlue}
              strokeWidth={3}
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <path d='M20 6 9 17l-5-5' />
            </svg>
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: '40px',
          zIndex: 1,
          alignItems: 'center',
          gap: '10px',
          color: inkBlue,
          fontFamily: mono,
          fontSize: '20px',
          fontWeight: 700,
        }}
      >
        payetax.co.uk
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: CACHE_HEADERS,
    },
  );
}
