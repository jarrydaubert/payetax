// src/app/api/feedback/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.M365_SMTP_HOST,
  port: Number(process.env.M365_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.M365_EMAIL,
    pass: process.env.M365_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});

interface FeedbackData {
  email?: string;
  message: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
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

    // Send email
    await transporter.sendMail({
      from: `"PayeTax Feedback" <${process.env.M365_EMAIL}>`,
      to: 'support@payetax.co.uk',
      subject: `New Feedback from ${email || 'Anonymous'} on PayeTax`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
            💬 New User Feedback
          </h2>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>📧 Email:</strong> ${email || 'Not provided'}</p>
            <p style="margin: 0 0 10px 0;"><strong>📅 Timestamp:</strong> ${timestamp || new Date().toLocaleString()}</p>
            <p style="margin: 0 0 10px 0;"><strong>🌐 Page URL:</strong> <a href="${url || 'N/A'}">${url || 'N/A'}</a></p>
            <p style="margin: 0;"><strong>🖥️ IP Address:</strong> ${ipAddress}</p>
          </div>

          <div style="background: white; padding: 20px; border-left: 4px solid #7c3aed; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Message:</h3>
            <p style="white-space: pre-wrap; color: #1f2937;">${message}</p>
          </div>

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;"><strong>User Agent:</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af; font-family: monospace;">${userAgent || 'N/A'}</p>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="text-align: center; color: #9ca3af; font-size: 12px;">
            Submitted via <a href="https://payetax.co.uk" style="color: #7c3aed;">PayeTax.co.uk</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback email failed:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback. Please try again later.' },
      { status: 500 }
    );
  }
}
