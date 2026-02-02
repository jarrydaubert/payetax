// src/lib/newsletter/__tests__/unsubscribeToken.test.ts

import {
  createUnsubscribeToken,
  resolveUnsubscribeSecret,
  TOKEN_MAX_AGE_MS,
  verifyUnsubscribeToken,
} from '@/lib/newsletter/unsubscribeToken';

describe('unsubscribeToken', () => {
  const secret = 'x'.repeat(64);
  const email = 'user@example.com';
  const now = 1738368000000; // 2025-02-01T00:00:00.000Z (fixed for deterministic tests)

  it('creates a token that verifies back to the same email', () => {
    const token = createUnsubscribeToken(email, secret, now);
    expect(verifyUnsubscribeToken(token, secret, now)).toBe(email);
  });

  it('rejects expired tokens', () => {
    const token = createUnsubscribeToken(email, secret, now - TOKEN_MAX_AGE_MS - 1);
    expect(verifyUnsubscribeToken(token, secret, now)).toBeNull();
  });

  it('rejects tampered signatures', () => {
    const token = createUnsubscribeToken(email, secret, now);
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [e, ts, sig] = decoded.split(':');
    expect(e).toBe(email);
    expect(ts).toBe(String(now));
    expect(sig).toBeTruthy();

    // Flip one hex char in the signature.
    const tamperedSig = sig.slice(0, -1) + (sig.slice(-1) === 'a' ? 'b' : 'a');
    const tamperedToken = Buffer.from(`${e}:${ts}:${tamperedSig}`).toString('base64url');
    expect(verifyUnsubscribeToken(tamperedToken, secret, now)).toBeNull();
  });

  it('accepts legacy 16-hex signatures', () => {
    const token = createUnsubscribeToken(email, secret, now, 16);
    expect(verifyUnsubscribeToken(token, secret, now)).toBe(email);
  });

  it('requires UNSUBSCRIBE_SECRET in production', () => {
    expect(() => resolveUnsubscribeSecret({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toThrow(
      /UNSUBSCRIBE_SECRET/i,
    );
  });

  it('uses a dev fallback secret outside production', () => {
    expect(resolveUnsubscribeSecret({ NODE_ENV: 'development' } as NodeJS.ProcessEnv)).toBeTruthy();
  });
});
