/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { detectLikelyBotRequest } from '../botGuard';

function buildRequest(headers?: Record<string, string>) {
  return new NextRequest('https://payetax.co.uk/api/test', {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      ...headers,
    }),
  });
}

describe('detectLikelyBotRequest', () => {
  it('returns null for normal browser-like requests', () => {
    const request = buildRequest({
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    });

    expect(detectLikelyBotRequest(request, { email: 'user@payetax.co.uk' })).toBeNull();
  });

  it('flags non-empty honeypot fields', () => {
    const request = buildRequest();
    expect(detectLikelyBotRequest(request, { email: 'user@payetax.co.uk', website: 'spam' })).toBe(
      'honeypot:website',
    );
  });

  it('flags obvious scripted user-agents', () => {
    const request = buildRequest({ 'user-agent': 'curl/8.0.1' });
    expect(detectLikelyBotRequest(request, { email: 'user@payetax.co.uk' })).toBe(
      'user-agent:curl/',
    );
  });
});
