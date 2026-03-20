import { type NextRequest, NextResponse } from 'next/server';
import { getRateLimitDiagnostics } from '@/lib/rateLimit';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const RATE_LIMIT_HEALTH_SECRET = process.env.RATE_LIMIT_HEALTH_SECRET;

function isAuthorized(request: NextRequest): boolean {
  // In production, this endpoint is secret-gated.
  if (IS_PRODUCTION) {
    if (!RATE_LIMIT_HEALTH_SECRET) return false;
    return request.headers.get('x-rate-limit-health-secret') === RATE_LIMIT_HEALTH_SECRET;
  }

  // In non-production, allow access for local verification convenience.
  if (!RATE_LIMIT_HEALTH_SECRET) return true;
  return request.headers.get('x-rate-limit-health-secret') === RATE_LIMIT_HEALTH_SECRET;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    if (IS_PRODUCTION && !RATE_LIMIT_HEALTH_SECRET) {
      return NextResponse.json(
        { error: 'Rate-limit health check is not configured' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const diagnostics = await getRateLimitDiagnostics();
  return NextResponse.json(
    {
      ok: true,
      checkedAt: new Date().toISOString(),
      diagnostics,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
