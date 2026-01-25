// src/app/api/newsletter/unsubscribe/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const audienceId = process.env.RESEND_AUDIENCE_ID;

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return new NextResponse(renderUnsubscribePage('Missing email parameter', false), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (!(resend && audienceId)) {
    return new NextResponse(renderUnsubscribePage('Service not configured', false), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    // Remove contact from audience
    await resend.contacts.remove({
      email,
      audienceId,
    });

    return new NextResponse(renderUnsubscribePage(email, true), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('[newsletter/unsubscribe] Error:', error);
    return new NextResponse(renderUnsubscribePage('Failed to unsubscribe', false), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function renderUnsubscribePage(emailOrError: string, success: boolean): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${success ? 'Unsubscribed' : 'Error'} - PayeTax</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    h1 { color: #020617; margin: 0 0 16px; }
    p { color: #64748b; margin: 0 0 24px; line-height: 1.6; }
    a {
      display: inline-block;
      background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
    .error { color: #ef4444; }
  </style>
</head>
<body>
  <div class="card">
    ${
      success
        ? `
      <h1>Unsubscribed</h1>
      <p>You've been removed from the PayeTax newsletter. You won't receive any more emails from us.</p>
      <a href="https://payetax.co.uk">Back to PayeTax</a>
    `
        : `
      <h1 class="error">Error</h1>
      <p>${emailOrError}</p>
      <a href="https://payetax.co.uk">Back to PayeTax</a>
    `
    }
  </div>
</body>
</html>
`;
}
