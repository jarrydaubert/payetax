/**
 * Curated salary page targets used for internal linking.
 * Keep aligned with programmatic salary pages that are guaranteed to resolve.
 */
export const SALARY_PAGE_LINK_TARGETS = [
  18000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000,
  85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000, 125000, 130000, 140000, 150000,
  175000, 200000, 250000, 300000, 500000,
] as const;

interface NearestTargetOptions {
  excludeExact?: boolean;
}

const MIN_SALARY_TARGET = SALARY_PAGE_LINK_TARGETS[0] ?? 0;
const MAX_SALARY_TARGET =
  SALARY_PAGE_LINK_TARGETS[SALARY_PAGE_LINK_TARGETS.length - 1] ?? MIN_SALARY_TARGET;
const SALARY_TOKEN_REGEX = /(?:£\s*)?(\d{1,3}(?:,\d{3})+|\d{2,6})(\s*[kK])?\b/g;

function parseSalaryToken(rawNumber: string, hasK: boolean): number {
  const numeric = Number.parseInt(rawNumber.replace(/,/g, ''), 10);
  return hasK ? numeric * 1000 : numeric;
}

export function getNearestSalaryPageTarget(
  salary: number,
  options: NearestTargetOptions = {},
): number {
  let nearest: number = SALARY_PAGE_LINK_TARGETS[0] ?? salary;
  let nearestDiff = Number.POSITIVE_INFINITY;

  for (const candidate of SALARY_PAGE_LINK_TARGETS) {
    if (options.excludeExact && candidate === salary) continue;

    const diff = Math.abs(candidate - salary);
    if (diff < nearestDiff) {
      nearest = candidate;
      nearestDiff = diff;
    }
  }

  return nearest;
}

export function extractSalaryIntentCandidates(text: string): number[] {
  const matches: number[] = [];
  const seen = new Set<number>();

  for (const match of text.matchAll(SALARY_TOKEN_REGEX)) {
    const rawNumber = match[1];
    if (!rawNumber) continue;

    const value = parseSalaryToken(rawNumber, Boolean(match[2]));
    if (value < MIN_SALARY_TARGET || value > MAX_SALARY_TARGET) continue;
    if (seen.has(value)) continue;

    seen.add(value);
    matches.push(value);
  }

  return matches;
}

export function getSalaryIntentTargetFromTextValues(
  textValues: Iterable<string>,
  options: NearestTargetOptions = {},
): number | null {
  for (const text of textValues) {
    const [firstCandidate] = extractSalaryIntentCandidates(text);
    if (firstCandidate === undefined) continue;
    return getNearestSalaryPageTarget(firstCandidate, options);
  }

  return null;
}
