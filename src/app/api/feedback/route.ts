// src/app/api/feedback/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface FeedbackData {
  email?: string;
  message: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  // Early exit if Resend not configured
  if (!resend) {
    return NextResponse.json(
      { error: 'Server configuration error. Please check environment variables.' },
      { status: 500 }
    );
  }

  try {
    const data: FeedbackData = await request.json();
    const { email, message, url, userAgent, timestamp } = data;

    // Get client info
    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';

    // Validate required fields
    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Validate message length (prevent abuse)
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message too long (max 5000 characters)' }, { status: 400 });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Escape HTML to prevent XSS in email
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const safeMessage = escapeHtml(message);
    const safeEmail = email ? escapeHtml(email) : 'Not provided';
    const safeUrl = url ? escapeHtml(url) : 'N/A';

    // Send via Resend
    const { error } = await resend.emails.send({
      from: 'PayeTax <support@payetax.co.uk>',
      to: ['support@payetax.co.uk'],
      replyTo: email || undefined,
      subject: `New Feedback from ${safeEmail} on PayeTax`,
      tags: [
        { name: 'source', value: 'website' },
        { name: 'type', value: 'feedback' },
      ],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
            💬 New User Feedback
          </h2>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>📧 Email:</strong> ${safeEmail}</p>
            <p style="margin: 0 0 10px 0;"><strong>📅 Timestamp:</strong> ${timestamp || new Date().toLocaleString()}</p>
            <p style="margin: 0 0 10px 0;"><strong>🌐 Page URL:</strong> ${safeUrl}</p>
            <p style="margin: 0;"><strong>🖥️ IP Address:</strong> ${ipAddress}</p>
          </div>

          <div style="background: white; padding: 20px; border-left: 4px solid #7c3aed; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Message:</h3>
            <p style="white-space: pre-wrap; color: #1f2937;">${safeMessage}</p>
          </div>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;"><strong>User Agent:</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af; font-family: monospace;">${(userAgent || 'N/A').slice(0, 200)}...</p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="text-align: center; color: #9ca3af; font-size: 12px;">
            Submitted via <a href="https://payetax.co.uk" style="color: #7c3aed;">PayeTax.co.uk</a>
          </p>
        </div>
      `,
      text: `New feedback from ${email || 'Anonymous'}

Message: ${message}

---
Page: ${url || 'N/A'}
Timestamp: ${timestamp || new Date().toLocaleString()}
IP: ${ipAddress}

Submitted via PayeTax.co.uk`,
    });

    if (error) {
      throw new Error(error.message); // Handle Resend errors
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback email failed:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback. Please try again later.' },
      { status: 500 }
    );
  }
}
