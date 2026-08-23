import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const SOURCE_EXTENSIONS = new Set(['.mdx', '.ts', '.tsx']);

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : collectSourceFiles(entryPath);
    }

    return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [entryPath] : [];
  });
}

describe('internal tools links', () => {
  it('does not link to the redirecting trailing-slash tools URL', () => {
    const redirectingPath = ['/tools', '/'].join('');
    const escapedPath = redirectingPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const disallowedTarget = new RegExp(`${escapedPath}(?=["'\`)#?])`);
    const sourceFiles = [
      ...collectSourceFiles(path.join(process.cwd(), 'content')),
      ...collectSourceFiles(path.join(process.cwd(), 'src')),
    ];
    const findings = sourceFiles
      .filter((filePath) => {
        const source = readFileSync(filePath, 'utf8');
        return disallowedTarget.test(source);
      })
      .map((filePath) => path.relative(process.cwd(), filePath));

    expect(findings).toEqual([]);
    expect(disallowedTarget.test("href: '/tools/'")).toBe(true);
    expect(disallowedTarget.test('[Tools](/tools/)')).toBe(true);
    expect(disallowedTarget.test("href: '/tools/director-guide'")).toBe(false);
  });
});
