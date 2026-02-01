// Mock for github-slugger (ESM-only package)
// Mimics github-slugger's behavior for consistent test results

class GithubSlugger {
  private occurrences = new Map<string, number>();

  slug(text: string): string {
    if (!text) return '';

    // github-slugger behavior:
    // - Converts to lowercase
    // - Replaces spaces and special chars with hyphens
    // - Collapses multiple hyphens
    // - Removes leading/trailing hyphens
    const base = text
      .toLowerCase()
      .trim()
      // Replace spaces and non-alphanumeric with hyphens
      .replace(/[^\w]+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '');

    if (!base) return '';

    // Handle duplicate slugs
    const count = this.occurrences.get(base) ?? 0;
    this.occurrences.set(base, count + 1);

    return count === 0 ? base : `${base}-${count}`;
  }

  reset(): void {
    this.occurrences.clear();
  }
}

export default GithubSlugger;
