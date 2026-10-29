import { setNodeEnv } from '@/test/env';

describe('setNodeEnv', () => {
  const original = process.env.NODE_ENV;
  afterEach(() => setNodeEnv(original));

  it.each([
    'development',
    'production',
    'test',
    undefined,
  ])('updates runtime reads to %s', (value) => {
    setNodeEnv(value);
    expect(process.env.NODE_ENV).toBe(value);
  });
});
