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

const paper = '#f8f5ed';
const paperMuted = '#f2eee4';
const ink = '#07111f';
const inkMuted = '#465468';
const inkBlue = '#113f72';
const rule = '#cfc7b8';
const success = '#17623d';
const destructive = '#9b2f2f';
const sans = 'Arial, Helvetica, sans-serif';
const display = 'Georgia, "Times New Roman", serif';
const mono = 'Menlo, Consolas, monospace';

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

function Wordmark() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        color: ink,
        fontFamily: display,
        fontSize: '40px',
        fontWeight: 700,
        letterSpacing: '-1px',
      }}
    >
      <span>paye</span>
      <span style={{ color: inkBlue }}>tax</span>
    </div>
  );
}

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
  const rawTitle = searchParams.get('title') || 'See Your Take-Home Pay';
  const rawDescription =
    searchParams.get('description') || 'Free UK PAYE calculator with official HMRC rates.';

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
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: paper,
        color: ink,
        padding: '54px 64px',
        fontFamily: sans,
      }}
    >
      <GridBackground />

      <div
        style={{
          display: 'flex',
          position: 'relative',
          zIndex: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `2px solid ${rule}`,
          paddingBottom: '26px',
        }}
      >
        <Wordmark />
        <span
          style={{
            color: inkBlue,
            fontFamily: mono,
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          UK PAYE Calculator
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          position: 'relative',
          zIndex: 1,
          flex: 1,
          flexDirection: 'column',
          paddingTop: hasResults ? '42px' : '58px',
        }}
      >
        {hasResults ? (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                height: '64px',
                maxWidth: '960px',
                color: ink,
                fontFamily: display,
                fontSize: '54px',
                fontWeight: 700,
                letterSpacing: '-1.4px',
                lineHeight: 1.05,
                marginBottom: '32px',
                overflow: 'hidden',
              }}
            >
              {title !== 'UK Tax Calculator' ? title : 'Your Tax Calculation'}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '340px',
                  border: `2px solid ${rule}`,
                  backgroundColor: 'rgba(255, 255, 255, 0.32)',
                  padding: '24px 28px',
                }}
              >
                <span
                  style={{
                    color: inkMuted,
                    fontFamily: mono,
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '2.5px',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Gross Salary
                </span>
                <span
                  style={{
                    color: ink,
                    fontFamily: mono,
                    fontSize: '42px',
                    fontWeight: 700,
                  }}
                >
                  {formattedSalary}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '74px',
                  color: inkBlue,
                  fontFamily: display,
                  fontSize: '46px',
                }}
              >
                →
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '380px',
                  border: `2px solid ${inkBlue}`,
                  backgroundColor: paperMuted,
                  padding: '24px 28px',
                }}
              >
                <span
                  style={{
                    color: inkBlue,
                    fontFamily: mono,
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '2.5px',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Take-Home Pay
                </span>
                <span
                  style={{
                    color: success,
                    fontFamily: mono,
                    fontSize: '42px',
                    fontWeight: 700,
                  }}
                >
                  {formattedTakeHome}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <span
              style={{
                color: inkBlue,
                fontFamily: mono,
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '4px',
                marginBottom: '20px',
                textTransform: 'uppercase',
              }}
            >
              HMRC rates
            </span>
            <h1
              style={{
                maxWidth: '920px',
                color: ink,
                fontFamily: display,
                fontSize: '72px',
                fontWeight: 700,
                letterSpacing: '-1.8px',
                lineHeight: 1,
                margin: 0,
                marginBottom: '28px',
                overflow: 'hidden',
              }}
            >
              {title}
            </h1>

            <p
              style={{
                maxWidth: '780px',
                color: inkMuted,
                fontSize: '28px',
                lineHeight: 1.38,
                margin: 0,
                overflow: 'hidden',
              }}
            >
              {description}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          zIndex: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          borderTop: `2px solid ${rule}`,
          paddingTop: '24px',
        }}
      >
        <span
          style={{
            color: inkBlue,
            fontFamily: mono,
            fontSize: '20px',
            fontWeight: 700,
          }}
        >
          payetax.co.uk
        </span>
        <span
          style={{
            display: 'flex',
            gap: '5px',
            color: inkMuted,
            fontSize: '18px',
          }}
        >
          <span style={{ color: destructive, fontWeight: 700 }}>Illustrative only.</span>
          <span>Not financial or tax advice.</span>
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
