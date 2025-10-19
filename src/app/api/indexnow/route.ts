// src/app/api/indexnow/route.ts
/**
 * IndexNow API integration for faster search engine indexing
 * Submits URLs to Bing, Yandex, and other IndexNow-supporting search engines
 *
 * @see https://www.indexnow.org/
 */

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();

    if (!(urls && Array.isArray(urls)) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required and must not be empty' },
        { status: 400 }
      );
    }

    // IndexNow key should be stored in environment variables
    // Generate one at https://www.bing.com/indexnow
    const indexNowKey = process.env.INDEXNOW_KEY;

    if (!indexNowKey) {
      console.warn('INDEXNOW_KEY not configured - skipping IndexNow submission');
      return NextResponse.json(
        {
          success: false,
          message: 'IndexNow not configured. Set INDEXNOW_KEY environment variable.',
        },
        { status: 200 }
      );
    }

    const payload = {
      host: 'payetax.co.uk',
      key: indexNowKey,
      keyLocation: `https://payetax.co.uk/${indexNowKey}.txt`,
      urlList: urls,
    };

    // Submit to IndexNow API (shared by Bing, Yandex, etc.)
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PayeTax/2.0.1 (https://payetax.co.uk)',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('IndexNow submission failed:', response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `IndexNow API returned ${response.status}`,
          details: errorText,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      submitted: urls.length,
      message: `Successfully submitted ${urls.length} URLs to IndexNow`,
    });
  } catch (error) {
    console.error('IndexNow error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export function GET() {
  const configured = !!process.env.INDEXNOW_KEY;
  return NextResponse.json({
    service: 'IndexNow',
    configured,
    message: configured
      ? 'IndexNow is configured and ready'
      : 'IndexNow requires INDEXNOW_KEY environment variable',
  });
}
