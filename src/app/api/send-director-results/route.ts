// src/app/api/send-director-results/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  generateDirectorEmailHtml,
  generateDirectorEmailText,
} from '@/lib/email/directorResultsEmail';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIdentifier } from '@/lib/security/clientIdentifier';
import { isValidRequestOrigin } from '@/lib/security/origin';
import { calculateStrategyComparison } from '@/lib/tax/strategyComparison';
import { formatCurrency } from '@/lib/utils';
import { SendDirectorResultsRequestSchema } from '@/lib/validation/emailValidation';

export const runtime = 'nodejs';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function formatErrorForLog(error: unknown): { name?: string; message?: string } {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  return { message: 'Unknown error' };
}
const MAX_BODY_SIZE = 50 * 1024; // 50KB

export async function POST(request: NextRequest) {
  // CSRF protection check (origin/referer allowlist).
  if (!isValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  // Rate limiting: 5 emails per minute per client
  const clientId = getClientIdentifier(request, { fallbackPrefix: 'ua:' });
  if (!(await checkRateLimit(`send-director-results:${clientId}`, { max: 5, window: 60000 }))) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  if (!resend) {
    console.error('[send-director-results] Resend not configured');
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
  }

  // Read body with size limit
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
  }

  if (rawBody.length > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  // Parse JSON
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validationResult = SendDirectorResultsRequestSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validationResult.error.flatten() },
      { status: 400 },
    );
  }

  const { email, input, taxYear } = validationResult.data;
  const comparison = calculateStrategyComparison(input, taxYear ?? '2025-2026');
  const strategies = {
    allSalary: comparison.strategies.allSalary,
    optimalMix: comparison.strategies.optimalMix,
    allDividends: comparison.strategies.allDividends,
  };
  const recommendedStrategy = strategies[comparison.recommended];

  try {
    const html = generateDirectorEmailHtml({
      grossProfit: comparison.grossProfit,
      strategies,
      recommended: comparison.recommended,
      savingsVsAllSalary: comparison.savingsVsAllSalary,
      taxYear,
    });

    const text = generateDirectorEmailText({
      grossProfit: comparison.grossProfit,
      strategies,
      recommended: comparison.recommended,
      savingsVsAllSalary: comparison.savingsVsAllSalary,
      taxYear,
    });

    const { error } = await resend.emails.send({
      from: 'PayeTax <noreply@payetax.co.uk>',
      to: email,
      subject: `Director Tax Strategy Report - ${formatCurrency(recommendedStrategy.takeHome)} Take-Home`,
      html,
      text,
    });

    if (error) {
      console.error('[send-director-results] Resend error:', formatErrorForLog(error));
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[send-director-results] Error:', formatErrorForLog(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
