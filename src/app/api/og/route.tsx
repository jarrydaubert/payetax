// src/app/api/og/route.tsx
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { checkRateLimit, createRateLimitHeaders } from '@/lib/rateLimit';
import { formatCurrency } from '@/lib/utils';

// Input constraints to prevent abuse and layout issues
const MAX_TITLE_LENGTH = 70;
const MAX_DESCRIPTION_LENGTH = 150;
const MAX_SALARY = 10_000_000;
const RATE_LIMIT = { max: 10, window: 60000 };

/** Get client identifier - always returns a key */
function getClientIdentifier(request: NextRequest): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0];
    if (firstIp) return firstIp.trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  const ua = request.headers.get('user-agent') || 'unknown';
  return `ua:${Buffer.from(ua).toString('base64').slice(0, 16)}`;
}

/**
 * Clamp text to maximum length, adding ellipsis if truncated
 */
function clampText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

/**
 * Parse and validate a money value from query param
 * Returns null if invalid or out of bounds
 */
function parseMoney(value: string | null): number | null {
  if (!value) return null;
  // Remove currency symbols, commas, spaces
  const cleaned = value.replace(/[£,\s]/g, '');
  const num = Number.parseFloat(cleaned);
  if (!Number.isFinite(num)) return null;
  if (num < 0 || num > MAX_SALARY) return null;
  return num;
}

// Cache headers for CDN - OG images are expensive to generate
const CACHE_HEADERS = {
  'Cache-Control': 'public, immutable, s-maxage=31536000, stale-while-revalidate=86400',
};

export async function GET(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  if (!(await checkRateLimit(`og:${clientId}`, RATE_LIMIT))) {
    return new Response('Too many requests', {
      status: 429,
      headers: createRateLimitHeaders(RATE_LIMIT),
    });
  }

  const searchParams = request.nextUrl.searchParams;

  // Get and validate parameters with constraints
  const rawTitle = searchParams.get('title') || 'UK Tax Calculator';
  const rawDescription =
    searchParams.get('description') || 'Calculate your take-home pay instantly';

  const title = clampText(rawTitle, MAX_TITLE_LENGTH);
  const description = clampText(rawDescription, MAX_DESCRIPTION_LENGTH);

  // Parse salary values with validation
  const salary = parseMoney(searchParams.get('salary'));
  const takeHome = parseMoney(searchParams.get('takeHome'));

  const formattedSalary = salary !== null ? formatCurrency(salary, 0) : null;
  const formattedTakeHome = takeHome !== null ? formatCurrency(takeHome, 0) : null;
  const hasResults = Boolean(formattedSalary && formattedTakeHome);

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#020617',
        padding: '60px',
      }}
    >
      {/* Top gradient line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #06b6d4, #10b981)',
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: hasResults ? '32px' : '48px',
        }}
      >
        <span style={{ fontSize: '36px', fontWeight: 700, color: '#f8fafc' }}>paye</span>
        <span
          style={{
            fontSize: '36px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          tax
        </span>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {hasResults ? (
          // Results view
          <>
            <h1
              style={{
                fontSize: '42px',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '24px',
                lineHeight: 1.2,
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              {title !== 'UK Tax Calculator' ? title : 'Your Tax Calculation'}
            </h1>

            <div
              style={{
                display: 'flex',
                gap: '40px',
                marginTop: '16px',
              }}
            >
              {/* Salary */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '28px 36px',
                }}
              >
                <span style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '8px' }}>
                  Gross Salary
                </span>
                <span style={{ fontSize: '48px', fontWeight: 700, color: '#f8fafc' }}>
                  {formattedSalary}
                </span>
              </div>

              {/* Arrow */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  color: '#64748b',
                }}
              >
                →
              </div>

              {/* Take Home */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  borderRadius: '16px',
                  padding: '28px 36px',
                  border: '2px solid rgba(16,185,129,0.3)',
                }}
              >
                <span style={{ fontSize: '18px', color: '#10b981', marginBottom: '8px' }}>
                  Take-Home Pay
                </span>
                <span style={{ fontSize: '48px', fontWeight: 700, color: '#10b981' }}>
                  {formattedTakeHome}
                </span>
              </div>
            </div>
          </>
        ) : (
          // Default view
          <>
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '24px',
                lineHeight: 1.2,
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              {title}
            </h1>

            <p
              style={{
                fontSize: '28px',
                color: '#94a3b8',
                maxWidth: '80%',
                lineHeight: 1.4,
                overflow: 'hidden',
              }}
            >
              {description}
            </p>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
        }}
      >
        <span style={{ fontSize: '22px', color: '#64748b' }}>payetax.co.uk</span>
        <span style={{ fontSize: '18px', color: '#475569' }}>
          Official HMRC rates • Free • No signup
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: CACHE_HEADERS,
    },
  );
}
