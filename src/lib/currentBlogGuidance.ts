import { CURRENT_TAX_GUIDANCE } from '@/constants/currentTaxGuidance';
import { CURRENT_TAX_YEAR, TAX_RATES } from '@/lib/tax';

export interface CurrentBlogGuidanceFinding {
  file: string;
  rule:
    | 'expired-mileage'
    | 'expired-homeworking'
    | 'expired-student-loan'
    | 'stale-current-year'
    | 'incomplete-current-guidance';
  detail: string;
}

interface StalePattern {
  rule: CurrentBlogGuidanceFinding['rule'];
  detail: string;
  pattern: RegExp;
}

const HISTORICAL_CONTEXT_MARKER = 'tax-guidance-guard: historical-context';
const FIRST_TEN_THOUSAND_MILE_RATE = '55p per mile';
const HOMEWORKING_DENIAL = 'cannot claim homeworking tax relief';
const CURRENT_TAX_YEAR_DISPLAY = CURRENT_TAX_YEAR.replace('-', '/').replace('/20', '/');
const STUDENT_LOAN_POLICY = TAX_RATES[CURRENT_TAX_YEAR].studentLoan;
type StudentLoanPlan = keyof typeof STUDENT_LOAN_POLICY;
const UNDERGRADUATE_PLANS: readonly StudentLoanPlan[] = ['plan1', 'plan2', 'plan4', 'plan5'];
const ALL_GUIDANCE_PLANS: readonly StudentLoanPlan[] = [...UNDERGRADUATE_PLANS, 'postgrad'];
const PLAN_LABELS: Record<StudentLoanPlan, string> = {
  plan1: 'Plan 1',
  plan2: 'Plan 2',
  plan4: 'Plan 4',
  plan5: 'Plan 5',
  postgrad: 'Postgraduate Loan',
};
const EXPIRED_STUDENT_LOAN_AMOUNTS: Partial<Record<StudentLoanPlan, RegExp>> = {
  plan1: /(?<![\d,])(?:£\s*)?26,?065\b/,
  plan2: /(?<![\d,])(?:£\s*)?28,?470\b/,
  plan4: /(?<![\d,])(?:£\s*)?32,?745\b/,
};

const CURRENT_GUIDANCE_BY_PATH = new Map(
  CURRENT_TAX_GUIDANCE.map(({ slug, reviewedAt }) => [
    `content/blog/${slug}.mdx`,
    {
      reviewedAt,
      plans: slug.startsWith('what-') ? (['plan2'] as const) : ALL_GUIDANCE_PLANS,
    },
  ]),
);

const STALE_PATTERNS: readonly StalePattern[] = [
  {
    rule: 'stale-current-year',
    detail: `Current-facing copy must identify ${CURRENT_TAX_YEAR_DISPLAY}, not 2025/26, as current.`,
    pattern: /\bcurrent\s+(?:guide|tax year|article|rates?)\b[^\n.]{0,80}\b2025\/26\b/i,
  },
];

const MONEY_PATTERN = /£\s*[\d,]+(?:\.\d{1,2})?/g;
const HOMEWORKING_FLAT_RATE_PATTERN =
  /(?:(?:£\s*6|6\s+pounds?)\s*(?:(?:a|per|\/)\s*)?week(?:ly)?|(?:£\s*26|26\s+pounds?)\s*(?:(?:a|per|\/)\s*)?month(?:ly)?|(?:£\s*312|312\s+pounds?)\s*(?:(?:a|per|\/)\s*)?year|£\s*312\s+annually)/i;
const MILEAGE_DOMAIN_PATTERN = /\b(?:mileage|business miles?|own (?:car|van))\b/i;
const COMPLETE_MILEAGE_RULE_PATTERN =
  /\b55p per (?:business )?mile\b[^\n.]{0,120}\bfirst 10,000\b[^\n.]{0,120}\b25p\b[^\n.]{0,80}\bafter\b/i;
const HOMEWORKING_DOMAIN_PATTERN = /\b(?:home\s*working|homeworking|working from home)\b/i;
const STUDENT_LOAN_THRESHOLD_CONTEXT_PATTERN =
  /\b(?:thresholds?|repayments?\s+(?:begin|start)|deductions?\s+(?:begin|start)|earn(?:ings)?\s+(?:above|over)|(?:pay|earnings?)\s+reaches?)\b/i;

function money(amount: number, decimals: 0 | 2): string {
  return `£${amount.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function expectedPlanTokens(plan: StudentLoanPlan): string[] {
  const policy = STUDENT_LOAN_POLICY[plan];
  return [
    money(policy.threshold, 0),
    money(Math.floor((policy.threshold / 12) * 100) / 100, 2),
    money(Math.floor((policy.threshold / 52) * 100) / 100, 2),
    `${policy.rate}%`,
  ];
}

function planLabelPattern(plan: StudentLoanPlan): RegExp {
  if (plan === 'postgrad') return /\b(?:Postgraduate Loan|PGL)\b/i;
  return new RegExp(`\\bPlan\\s*${plan.slice(-1)}\\b`, 'i');
}

function addFinding(
  findings: CurrentBlogGuidanceFinding[],
  finding: CurrentBlogGuidanceFinding,
): void {
  if (
    findings.some(
      (existing) =>
        existing.file === finding.file &&
        existing.rule === finding.rule &&
        existing.detail === finding.detail,
    )
  ) {
    return;
  }
  findings.push(finding);
}

function checkPositiveCurrentGuidance(
  source: { file: string; content: string },
  findings: CurrentBlogGuidanceFinding[],
): void {
  const guidance = CURRENT_GUIDANCE_BY_PATH.get(source.file);
  if (!guidance) return;

  const requiredCopy = [
    {
      matches: source.content.includes(`updatedAt: "${guidance.reviewedAt}"`),
      detail: `Frontmatter updatedAt must match the factual review date ${guidance.reviewedAt}.`,
    },
    {
      matches: source.content.includes(CURRENT_TAX_YEAR_DISPLAY),
      detail: `Current guidance must identify tax year ${CURRENT_TAX_YEAR_DISPLAY}.`,
    },
    {
      matches: COMPLETE_MILEAGE_RULE_PATTERN.test(source.content),
      detail: `Current guidance must state the complete 2026/27 mileage rule: ${FIRST_TEN_THOUSAND_MILE_RATE} for the first 10,000 business miles and 25p after that.`,
    },
    {
      matches: source.content.toLowerCase().includes(HOMEWORKING_DENIAL),
      detail: 'Current guidance must state that employees cannot claim homeworking tax relief.',
    },
  ];

  for (const requirement of requiredCopy) {
    if (requirement.matches) continue;
    addFinding(findings, {
      file: source.file,
      rule: 'incomplete-current-guidance',
      detail: requirement.detail,
    });
  }

  const lines = source.content.split('\n');
  const statements = lines.flatMap((line) => line.split(/(?<=[.!?])\s+/));
  for (const plan of guidance.plans) {
    const label = PLAN_LABELS[plan];
    const labelPattern = planLabelPattern(plan);
    const tokens = expectedPlanTokens(plan);
    const currentFactLine = lines.find(
      (line) => labelPattern.test(line) && tokens.every((token) => line.includes(token)),
    );
    if (!currentFactLine) {
      addFinding(findings, {
        file: source.file,
        rule: 'incomplete-current-guidance',
        detail: `${label} must show the current annual, monthly and weekly thresholds and rate: ${tokens.join(', ')}.`,
      });
    }

    for (const line of statements.filter(
      (candidate) =>
        !candidate.includes(HISTORICAL_CONTEXT_MARKER) &&
        labelPattern.test(candidate) &&
        STUDENT_LOAN_THRESHOLD_CONTEXT_PATTERN.test(candidate),
    )) {
      const statedAmounts = line.match(MONEY_PATTERN) ?? [];
      if (statedAmounts.length === 0) continue;

      const allowedAmounts = new Set(tokens.slice(0, 3));
      if (statedAmounts.some((amount) => !allowedAmounts.has(amount.replace(/\s+/g, '')))) {
        addFinding(findings, {
          file: source.file,
          rule: 'expired-student-loan',
          detail: `${label} threshold copy contains a value outside the current annual, monthly or weekly policy.`,
        });
      }

      const statedRates = line.match(/\b\d+(?:\.\d+)?%/g) ?? [];
      if (statedRates.some((rate) => rate !== tokens[3])) {
        addFinding(findings, {
          file: source.file,
          rule: 'expired-student-loan',
          detail: `${label} threshold copy contains a rate outside the current policy.`,
        });
      }
    }
  }
}

export function findCurrentBlogGuidanceProblems(
  sources: ReadonlyArray<{ file: string; content: string }>,
): CurrentBlogGuidanceFinding[] {
  const findings: CurrentBlogGuidanceFinding[] = [];

  for (const source of sources) {
    for (const rule of STALE_PATTERNS) {
      if (!rule.pattern.test(source.content)) continue;
      addFinding(findings, {
        file: source.file,
        rule: rule.rule,
        detail: rule.detail,
      });
    }

    for (const line of source.content.split('\n')) {
      const isHistoricalContext = line.includes(HISTORICAL_CONTEXT_MARKER);

      if (
        !isHistoricalContext &&
        MILEAGE_DOMAIN_PATTERN.test(line) &&
        /(?:\b45\s*p(?:ence)?\b|£0\.45\b)/i.test(line)
      ) {
        addFinding(findings, {
          file: source.file,
          rule: 'expired-mileage',
          detail: 'The pre-6-April-2026 mileage rate is not valid as current guidance.',
        });
      }

      if (!isHistoricalContext && STUDENT_LOAN_THRESHOLD_CONTEXT_PATTERN.test(line)) {
        for (const plan of UNDERGRADUATE_PLANS) {
          const expiredAmount = EXPIRED_STUDENT_LOAN_AMOUNTS[plan];
          if (!expiredAmount) continue;
          if (planLabelPattern(plan).test(line) && expiredAmount.test(line)) {
            addFinding(findings, {
              file: source.file,
              rule: 'expired-student-loan',
              detail: `${PLAN_LABELS[plan]} copy contains its expired 2025/26 threshold.`,
            });
          }
        }
      }

      if (!isHistoricalContext && HOMEWORKING_DOMAIN_PATTERN.test(line)) {
        if (
          /\b(?:home\s*working|homeworking|working from home)\s+(?:flat-rate\s+)?allowance\b/i.test(
            line,
          )
        ) {
          addFinding(findings, {
            file: source.file,
            rule: 'expired-homeworking',
            detail: 'Do not present the former employee homeworking allowance as current.',
          });
        }

        for (const clause of line.split(/[.;]\s+/)) {
          if (!HOMEWORKING_FLAT_RATE_PATTERN.test(clause)) continue;
          const isEmployerReimbursement =
            /\b(?:employer|reimburs(?:e|es|ed|ement|ements|ing))\b/i.test(clause) &&
            !/\bemploye(?:e|es)\s+(?:can|may)\s+(?:claim|deduct)\b/i.test(clause);
          if (isEmployerReimbursement) continue;

          addFinding(findings, {
            file: source.file,
            rule: 'expired-homeworking',
            detail: 'Do not present the former employee homeworking flat rate as current relief.',
          });
        }
      }
    }

    checkPositiveCurrentGuidance(source, findings);
  }

  return findings;
}
