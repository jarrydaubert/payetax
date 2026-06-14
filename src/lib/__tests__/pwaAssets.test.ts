import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type ManifestIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
};

type WebManifest = {
  theme_color: string;
  background_color: string;
  icons: ManifestIcon[];
};

const ROOT = process.cwd();

function readPublicText(path: string): string {
  return readFileSync(join(ROOT, 'public', path), 'utf8');
}

function readManifest(): WebManifest {
  return JSON.parse(readPublicText('manifest.json')) as WebManifest;
}

function readPngDimensions(path: string): { width: number; height: number } {
  const buffer = readFileSync(join(ROOT, 'public', path));
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

describe('PWA public assets', () => {
  it('keeps manifest launch colours aligned with the light Ledger theme', () => {
    const manifest = readManifest();

    expect(manifest.theme_color).toBe('#f8f5ed');
    expect(manifest.background_color).toBe('#f8f5ed');
  });

  it('uses dedicated padded maskable icon assets', () => {
    const manifest = readManifest();
    const maskableIcons = manifest.icons.filter((icon) => icon.purpose === 'maskable');

    expect(maskableIcons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: '/android-chrome-maskable-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        }),
        expect.objectContaining({
          src: '/android-chrome-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        }),
      ]),
    );
    expect(maskableIcons).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: '/android-chrome-192x192.png' }),
        expect.objectContaining({ src: '/android-chrome-512x512.png' }),
      ]),
    );

    for (const icon of maskableIcons) {
      const relativePath = icon.src.replace(/^\//, '');
      expect(existsSync(join(ROOT, 'public', relativePath))).toBe(true);

      const [expectedWidth, expectedHeight] = icon.sizes.split('x').map(Number);
      expect(readPngDimensions(relativePath)).toEqual({
        width: expectedWidth,
        height: expectedHeight,
      });
    }
  });

  it('serves the dedicated offline page as the navigation fallback', () => {
    const serviceWorker = readPublicText('sw.js');

    expect(serviceWorker).toContain("const OFFLINE_FALLBACK_URL = '/offline';");
    expect(serviceWorker).toContain('OFFLINE_FALLBACK_URL');
    expect(serviceWorker).toContain("const PRECACHE_ASSETS = [\n  '/',\n  OFFLINE_FALLBACK_URL,");
    expect(serviceWorker).toContain('function isRootNavigation(request)');
    expect(serviceWorker).toContain(
      'const rootResponse = await caches.match(request, { ignoreSearch: true });',
    );
    expect(serviceWorker).toContain("return offlineResponse || caches.match('/');");

    const rootFallbackIndex = serviceWorker.indexOf('const rootResponse = await caches.match');
    const offlineFallbackIndex = serviceWorker.indexOf(
      'const offlineResponse = await caches.match(OFFLINE_FALLBACK_URL);',
    );
    expect(rootFallbackIndex).toBeGreaterThan(-1);
    expect(offlineFallbackIndex).toBeGreaterThan(rootFallbackIndex);
  });

  it('does not keep unused feedback, push, or periodic-sync scaffolding in the service worker', () => {
    const serviceWorker = readPublicText('sw.js');

    expect(serviceWorker).not.toContain('feedback-sync');
    expect(serviceWorker).not.toContain('syncFeedback');
    expect(serviceWorker).not.toContain("addEventListener('push'");
    expect(serviceWorker).not.toContain("addEventListener('periodicsync'");
    expect(serviceWorker).not.toContain('showNotification');
  });

  it('keeps service-worker prompts aligned with the light PWA shell', () => {
    const registrationScript = readPublicText('register-sw.js');

    expect(registrationScript).toContain('Update available');
    expect(registrationScript).toContain('#f8f5ed');
    expect(registrationScript).toContain('#123a66');
    expect(registrationScript).not.toContain('#1f2937');
    expect(registrationScript).not.toContain('Update Available');
    expect(registrationScript).not.toContain(String.fromCodePoint(0x1f680));
  });
});
