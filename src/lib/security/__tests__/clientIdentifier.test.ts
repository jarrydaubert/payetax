/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { getClientIdentifier } from '../clientIdentifier';

function buildRequest(headers?: Record<string, string>) {
  return new NextRequest('https://payetax.co.uk/api/test', {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      ...headers,
    }),
  });
}

describe('getClientIdentifier', () => {
  const originalTrustFlag = process.env.TRUST_CF_CONNECTING_IP;

  afterEach(() => {
    if (originalTrustFlag === undefined) {
      delete process.env.TRUST_CF_CONNECTING_IP;
    } else {
      process.env.TRUST_CF_CONNECTING_IP = originalTrustFlag;
    }
  });

  it('uses the first x-forwarded-for IP as the primary identity', () => {
    const request = buildRequest({ 'x-forwarded-for': '203.0.113.7, 198.51.100.1' });
    expect(getClientIdentifier(request)).toBe('203.0.113.7');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    const request = buildRequest({ 'x-real-ip': '203.0.113.9' });
    expect(getClientIdentifier(request)).toBe('203.0.113.9');
  });

  it('falls back to a hashed user-agent identity when no IP headers exist', () => {
    const request = buildRequest({ 'user-agent': 'Mozilla/5.0 Test' });
    expect(getClientIdentifier(request, { fallbackPrefix: 'ua:' })).toMatch(/^ua:/);
  });

  it('ignores a spoofed cf-connecting-ip header by default', () => {
    // On Vercel without a Cloudflare proxy, cf-connecting-ip arrives
    // attacker-controlled. It must not create a fresh rate-limit bucket.
    const request = buildRequest({
      'cf-connecting-ip': '10.99.99.99',
      'x-forwarded-for': '203.0.113.7',
    });

    expect(getClientIdentifier(request)).toBe('203.0.113.7');
  });

  it('ignores cf-connecting-ip even when it is the only IP header present', () => {
    const request = buildRequest({
      'cf-connecting-ip': '10.99.99.99',
      'user-agent': 'Mozilla/5.0 Test',
    });

    expect(getClientIdentifier(request, { fallbackPrefix: 'ua:' })).toMatch(/^ua:/);
  });

  it('trusts cf-connecting-ip first only when TRUST_CF_CONNECTING_IP=true', () => {
    process.env.TRUST_CF_CONNECTING_IP = 'true';

    const request = buildRequest({
      'cf-connecting-ip': '198.51.100.42',
      'x-forwarded-for': '203.0.113.7',
    });

    expect(getClientIdentifier(request)).toBe('198.51.100.42');
  });

  it('applies the ipPrefix option to IP-derived identities', () => {
    const request = buildRequest({ 'x-forwarded-for': '203.0.113.7' });
    expect(getClientIdentifier(request, { ipPrefix: 'ip:' })).toBe('ip:203.0.113.7');
  });
});
