// src/app/api/newsletter/subscribe/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { generateWelcomeEmailHtml } from '@/../emails/welcome';
import { checkRateLimit } from '@/lib/rateLimit';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const audienceId = process.env.RESEND_AUDIENCE_ID;

const SubscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 subscribe attempts per minute per IP
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ipAddress, { max: 3, window: 60000 })) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check configuration
    if (!resend) {
      console.error('[newsletter/subscribe] Resend not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    if (!audienceId) {
      console.error('[newsletter/subscribe] Audience ID not configured');
      return NextResponse.json({ error: 'Newsletter not configured' }, { status: 503 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = SubscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email address', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Add contact to Resend Audience
    const { error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    if (error) {
      console.error('[newsletter/subscribe] Resend error:', error);

      // Check for duplicate email
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        return NextResponse.json({ error: 'Already subscribed' }, { status: 409 });
      }

      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    // Send welcome email (fire and forget - don't block response)
    resend.emails
      .send({
        from: 'PayeTax <noreply@payetax.co.uk>',
        to: email,
        subject: 'Welcome to PayeTax!',
        html: generateWelcomeEmailHtml(email),
      })
      .catch((err) => {
        console.error('[newsletter/subscribe] Failed to send welcome email:', err);
      });

    // Notify admin of new subscriber
    resend.emails
      .send({
        from: 'PayeTax <noreply@payetax.co.uk>',
        to: 'support@payetax.co.uk',
        subject: `New subscriber: ${email}`,
        html: `<p>New newsletter subscriber: <strong>${email}</strong></p><p>Time: ${new Date().toISOString()}</p>`,
      })
      .catch((err) => {
        console.error('[newsletter/subscribe] Failed to send admin notification:', err);
      });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    });
  } catch (error) {
    console.error('[newsletter/subscribe] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle OPTIONS for CORS preflight if needed
export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
