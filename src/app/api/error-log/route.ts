// src/app/api/error-log/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { checkRateLimit } from '@/lib/rateLimit';
import { addBreadcrumb, captureAPIError, setContext } from '@/lib/sentry';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Security constants
const MAX_BODY_SIZE = 100 * 1024; // 100KB max body size

/**
 * Anonymize IP address for GDPR compliance by masking the last octet.
 * IPv4: 192.168.1.100 -> 192.168.1.xxx
 * IPv6: 2001:db8::1 -> 2001:db8::xxx
 */
function anonymizeIp(ip: string): string {
  if (ip === 'unknown') return ip;

  // IPv4: mask last octet
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = 'xxx';
      return parts.join('.');
    }
  }

  // IPv6: mask last segment
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length > 0) {
      parts[parts.length - 1] = 'xxx';
      return parts.join(':');
    }
  }

  return ip;
}

interface ErrorData {
  message: string;
  stack?: string;
  digest?: string;
  url?: string;
  userAgent?: string;
  componentStack?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Anonymize IP for logging/display (GDPR compliance)
  const anonymizedIp = anonymizeIp(ipAddress);

  // Add breadcrumb for error log request (use anonymized IP)
  addBreadcrumb('api', {
    message: 'Error log API request received',
    level: 'info',
    data: { ipAddress: anonymizedIp },
  });

  // Check rate limit (10 requests per minute per IP)
  if (!checkRateLimit(ipAddress)) {
    addBreadcrumb('api', {
      message: 'Rate limit exceeded for error logging',
      level: 'warning',
      data: { ipAddress: anonymizedIp },
    });
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 }
    );
  }

  // Check body size before processing (security: prevent memory exhaustion)
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  // Early exit if Resend not configured
  if (!resend) {
    const configError = new Error('Resend API key not configured');
    captureAPIError(configError, {
      endpoint: '/api/error-log',
      method: 'POST',
      statusCode: 500,
    });
    return NextResponse.json(
      { error: 'Server configuration error. Please check environment variables.' },
      { status: 500 }
    );
  }

  try {
    const data: ErrorData = await request.json();

    // Set context for Sentry tracking
    setContext('error_log_request', {
      url: data.url,
      userAgent: data.userAgent,
      timestamp: data.timestamp,
      digest: data.digest,
    });
    const { message, stack, digest, url, userAgent, componentStack, timestamp } = data;

    // Escape HTML to prevent XSS in email
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const safeMessage = escapeHtml(message);
    const safeStack = stack ? escapeHtml(stack) : null;
    const safeComponentStack = componentStack ? escapeHtml(componentStack) : null;
    const safeUrl = url ? escapeHtml(url) : 'N/A';
    const safeDigest = digest ? escapeHtml(digest) : 'N/A';

    // Send error email to support via Resend
    // Security: Use generic subject to prevent email header injection
    const { error } = await resend.emails.send({
      from: 'PayeTax Error Monitor <support@payetax.co.uk>',
      to: ['support@payetax.co.uk'],
      subject: '🚨 Application Error on PayeTax',
      tags: [
        { name: 'source', value: 'error-monitor' },
        { name: 'type', value: 'application-error' },
      ],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; display: flex; align-items: center;">
              🚨 Application Error Detected
            </h2>
          </div>

          <div style="background: #fef2f2; padding: 20px; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #991b1b;">Error Message:</h3>
            <p style="font-family: monospace; background: white; padding: 15px; border-radius: 4px; color: #991b1b; font-size: 14px;">
              ${safeMessage}
            </p>
          </div>

          <div style="background: #f9fafb; padding: 20px; margin-top: 2px;">
            <p style="margin: 0 0 10px 0;"><strong>⏰ Timestamp:</strong> ${timestamp || new Date().toLocaleString()}</p>
            <p style="margin: 0 0 10px 0;"><strong>🌐 Page URL:</strong> ${safeUrl}</p>
            <p style="margin: 0 0 10px 0;"><strong>🔑 Error Digest:</strong> ${safeDigest}</p>
            <p style="margin: 0;"><strong>🖥️ IP Address:</strong> ${anonymizedIp}</p>
          </div>

          ${
            safeStack
              ? `
          <div style="background: white; padding: 20px; margin-top: 2px; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #374151;">Stack Trace:</h3>
            <pre style="background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px; line-height: 1.5;">${safeStack}</pre>
          </div>
          `
              : ''
          }

          ${
            safeComponentStack
              ? `
          <div style="background: white; padding: 20px; margin-top: 2px; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #374151;">Component Stack:</h3>
            <pre style="background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px; line-height: 1.5;">${safeComponentStack}</pre>
          </div>
          `
              : ''
          }

          <div style="background: #f3f4f6; padding: 15px; margin-top: 2px; border-radius: 0 0 8px 8px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;"><strong>User Agent:</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af; font-family: monospace;">${(userAgent || 'N/A').slice(0, 200)}...</p>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #1e40af;">💡 Next Steps:</h3>
            <ul style="color: #1e3a8a; margin: 0; padding-left: 20px;">
              <li>Check if error is reproducible</li>
              <li>Review recent deployments for changes</li>
              <li>Inspect error logs for patterns</li>
              <li>Test fix in development environment</li>
            </ul>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="text-align: center; color: #9ca3af; font-size: 12px;">
            Auto-generated by <a href="https://payetax.co.uk" style="color: #7c3aed;">PayeTax.co.uk</a> Error Monitoring
          </p>
        </div>
      `,
      text: `🚨 Application Error Detected

Error: ${message}

---
Timestamp: ${timestamp || new Date().toLocaleString()}
Page URL: ${url || 'N/A'}
Error Digest: ${digest || 'N/A'}
IP Address: ${anonymizedIp}

${stack ? `\nStack Trace:\n${stack}\n` : ''}
${componentStack ? `\nComponent Stack:\n${componentStack}\n` : ''}

User Agent: ${userAgent || 'N/A'}

---
Auto-generated by PayeTax.co.uk Error Monitoring`,
    });

    if (error) {
      throw new Error(error.message);
    }

    addBreadcrumb('api', {
      message: 'Error log email sent successfully',
      level: 'info',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging failed:', error);

    // Track API error in Sentry
    captureAPIError(error, {
      endpoint: '/api/error-log',
      method: 'POST',
      statusCode: 500,
    });

    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}
