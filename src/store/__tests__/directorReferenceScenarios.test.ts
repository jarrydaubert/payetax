import { CURRENT_TAX_YEAR } from '@/constants/taxRates';
import { calculateSafeMonthlyDraw } from '@/lib/tax';
import {
  type DirectorFormData,
  type DirectorStrategyKey,
  hasCurrentDirectorResults,
  useDirectorGuideStore,
} from '@/store/directorGuideStore';
import {
  consultancy,
  contractor,
  financialFields,
  recruiter,
  referenceTaxYear,
} from '@/test/directorReferenceFixtures/referenceCompanies';

const projectionFields = ['monthsRemaining', 'projectedRevenue', 'projectedExpenses'] as const;
const cashFields = [
  'taxBasedMonthlyDraw',
  'requiredBuffer',
  'cashBasedCeiling',
  'safeMonthlyDraw',
  'spendingShortfall',
  'shortfall',
] as const;

function finiteAmount(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label}: expected a finite number, got ${String(value)}`);
  }
  return value;
}

function verifyAmounts(
  label: string,
  fields: readonly string[],
  expected: Readonly<Record<string, unknown>>,
  actual: object | null | undefined,
) {
  if (!actual) throw new Error(`${label}: missing result`);

  for (const field of Object.keys(expected)) {
    if (!fields.includes(field)) throw new Error(`${label}: unknown expected field ${field}`);
  }

  const observations = [];
  for (const field of fields) {
    const fieldLabel = `${label}.${field}`;
    if (!Object.hasOwn(expected, field)) {
      throw new Error(`${fieldLabel}: missing expectation`);
    }
    if (!Object.hasOwn(actual, field)) throw new Error(`${fieldLabel}: missing actual field`);
    const result = finiteAmount((actual as Record<string, unknown>)[field], `${fieldLabel} actual`);
    const reference = expected[field];

    if (typeof reference === 'object' && reference !== null) {
      if (
        !('independent' in reference && 'observed' in reference) ||
        Object.keys(reference).length !== 2
      ) {
        throw new Error(`${fieldLabel}: invalid unresolved observation`);
      }
      const independent = finiteAmount(reference.independent, `${fieldLabel} independent`);
      const observed = finiteAmount(reference.observed, `${fieldLabel} observed`);
      if (independent === observed)
        throw new Error(`${fieldLabel}: amounts agree; resolve the gap`);
      observations.push({ field, independent, observed, actual: result });
      continue;
    }

    const amount = finiteAmount(reference, `${fieldLabel} expected`);
    if (result !== amount) {
      throw new Error(`${fieldLabel}: expected £${amount} from the reference, got £${result}`);
    }
  }
  return observations;
}

function submit(input: Partial<DirectorFormData>, strategy?: DirectorStrategyKey) {
  const store = useDirectorGuideStore;
  store.setState(store.getInitialState(), true);
  store.setState(({ formData }) => ({ formData: { ...formData, ...input } }));
  if (strategy) store.getState().setSelectedStrategy(strategy);
  store.getState().calculate();

  const state = store.getState();
  const {
    calculatedFormData: form,
    calculatedStrategy: selected,
    monthlyModeOutput: projection,
    strategyComparison: comparison,
  } = state;
  if (!(form && selected && comparison && hasCurrentDirectorResults(state))) {
    throw new Error(`No current Director result: ${state.error ?? 'submission was not published'}`);
  }
  return { form, selected, projection, comparison };
}

beforeAll(() => {
  // Director's public store uses the active tax year. Make a year change explicit.
  expect(CURRENT_TAX_YEAR).toBe(referenceTaxYear);
});

afterEach(() => useDirectorGuideStore.setState(useDirectorGuideStore.getInitialState(), true));

describe('A · low-profit recruiter', () => {
  it('publishes the affordable salary, LEL setup and all-dividend comparison', () => {
    const { comparison, selected } = submit(recruiter.input);
    expect(comparison.grossProfit).toBe(recruiter.grossProfit);
    expect(selected).toBe(comparison.recommended);
    for (const [strategy, expected] of Object.entries(recruiter.expected)) {
      expect(
        verifyAmounts(
          `A ${strategy}`,
          financialFields,
          expected,
          comparison.strategies[strategy as keyof typeof recruiter.expected],
        ),
      ).toEqual([]);
    }
    expect(
      verifyAmounts(
        'A displayed',
        financialFields,
        recruiter.expected.allSalary,
        comparison.strategies[selected],
      ),
    ).toEqual([]);
  });
});

describe('B · profitable consultancy', () => {
  it('publishes the recommended mix including associated-company marginal relief', () => {
    const { comparison, selected } = submit(consultancy.input);
    expect(comparison.grossProfit).toBe(consultancy.grossProfit);
    expect(selected).toBe('optimalMix');
    expect(
      verifyAmounts(
        'B mix',
        financialFields,
        consultancy.expected.optimalMix,
        comparison.strategies.optimalMix,
      ),
    ).toEqual([]);
  });

  it('attributes only the incremental personal tax when the director has another job', () => {
    const { comparison, selected } = submit(
      { ...consultancy.input, ...consultancy.otherJob },
      'optimalMix',
    );
    expect(
      verifyAmounts(
        'B other job',
        financialFields,
        consultancy.expected.otherJob,
        comparison.strategies[selected],
      ),
    ).toEqual([]);
  });

  describe('unresolved band rounding observations (separate decision)', () => {
    it.each([
      {
        label: 'all salary',
        input: consultancy.input,
        strategy: 'allSalary',
        expected: consultancy.expected.allSalary,
      },
      {
        label: 'all dividends',
        input: consultancy.input,
        strategy: 'allDividends',
        expected: consultancy.expected.allDividends,
      },
      {
        label: 'employer pension and other job',
        input: { ...consultancy.input, ...consultancy.otherJob, ...consultancy.employerPension },
        strategy: 'optimalMix',
        expected: consultancy.expected.employerPension,
      },
      {
        label: 'carried-forward trading loss',
        input: { ...consultancy.input, ...consultancy.tradingLoss },
        strategy: 'allDividends',
        expected: consultancy.expected.tradingLoss,
      },
    ] as const)(
      'checks supported components and characterises the open differences for $label',
      ({ label, input, strategy, expected }) => {
        const { comparison, selected } = submit(input, strategy);
        const differences = verifyAmounts(
          `B ${label}`,
          financialFields,
          expected,
          comparison.strategies[selected],
        );

        // These checks record current divergence. A change must be reconciled with the official workings.
        expect(differences.map(({ field }) => field)).toEqual([
          strategy === 'allSalary' ? 'incomeTax' : 'dividendTax',
          'totalPersonalTax',
          'takeHome',
        ]);
        for (const { field, actual, observed, independent } of differences) {
          if (actual !== observed) {
            throw new Error(
              `B ${label}.${field}: open observation changed from £${observed} to £${actual} (independent £${independent}). Reconcile the reference.`,
            );
          }
        }
      },
    );
  });
});

describe('C · cash-constrained contractor', () => {
  it.each(Object.entries(contractor.cash))(
    'applies the cash helper to the submitted figures for %s',
    (variant, scenario) => {
      const strategy = variant === 'withPayroll' ? 'optimalMix' : 'allDividends';
      const { form, selected, projection, comparison } = submit(
        { ...contractor.input, ...scenario.input },
        strategy,
      );
      expect(selected).toBe(strategy);
      expect(comparison.grossProfit).toBe(contractor.grossProfit);
      expect(
        verifyAmounts(
          `C ${variant} projection`,
          projectionFields,
          contractor.projection,
          projection,
        ),
      ).toEqual([]);
      const active = comparison.strategies[strategy];
      expect(
        verifyAmounts(
          `C ${variant} financials`,
          financialFields,
          contractor.expected[strategy],
          active,
        ),
      ).toEqual([]);
      if (!projection) throw new Error('C: missing submitted monthly projection');

      const draw = calculateSafeMonthlyDraw({
        annualTakeHome: active.takeHome,
        companyTaxReserve: active.corporationTax + active.employerNI,
        monthsRemaining: projection.monthsRemaining,
        cashInBank: form.cashInBank,
        additionalCommittedCash: form.additionalCommittedCash,
        minimumMonthlyDraw: form.minimumMonthlyDraw,
        runwayMonths: form.runwayMonths,
        monthlyExpenses: form.monthlyExpenses,
      });
      expect(verifyAmounts(`C ${variant} cash`, cashFields, scenario.expected, draw)).toEqual([]);
      expect(draw.hasBufferShortfall).toBe(scenario.expected.shortfall > 0);
      expect(draw.hasContractEndRisk).toBe(false);
    },
  );
});

it('starts with clean figure defaults after another company has submitted', () => {
  submit({
    ...consultancy.input,
    ...consultancy.otherJob,
    ...consultancy.employerPension,
    ...consultancy.tradingLoss,
    yourSetupSalary: recruiter.input.yourSetupSalary,
    yourSetupDividends: recruiter.input.yourSetupDividends,
  });
  const { form } = submit({ ...contractor.input, ...contractor.cash.blank.input }, 'allDividends');
  expect(form).toMatchObject({
    associatedCompaniesCount: 1,
    otherIncome: 0,
    hasOtherPAYEEmployment: false,
    pensionContribution: 0,
    lossesBroughtForward: 0,
    yourSetupSalary: undefined,
    yourSetupDividends: undefined,
  });
});

describe('Director reference assertion controls', () => {
  const expected = recruiter.expected.allDividends;

  it.each([
    ['incorrect tax, same take-home', { corporationTax: 1573.21 }, 'corporationTax: expected'],
    ['undefined field', { salary: undefined }, 'salary actual: expected a finite number'],
    ['NaN', { salary: Number.NaN }, 'salary actual: expected a finite number'],
    ['infinity', { salary: Number.POSITIVE_INFINITY }, 'salary actual: expected a finite number'],
  ] as const)('rejects %s in a submitted result', (_name, change, message) => {
    const { comparison } = submit(recruiter.input);
    const actual = comparison.strategies.allDividends;
    expect(verifyAmounts('control', financialFields, expected, actual)).toEqual([]);
    expect(() =>
      verifyAmounts('control', financialFields, expected, { ...actual, ...change }),
    ).toThrow(message);
  });

  it('rejects malformed or resolved rounding observations', () => {
    const { comparison } = submit(recruiter.input);
    const actual = comparison.strategies.allDividends;
    expect(() =>
      verifyAmounts(
        'control',
        financialFields,
        {
          ...expected,
          salary: { independent: 0, observed: 0, extra: 1 },
        },
        actual,
      ),
    ).toThrow('salary: invalid unresolved observation');
    expect(() =>
      verifyAmounts(
        'control',
        financialFields,
        {
          ...expected,
          salary: { independent: 0, observed: 0 },
        },
        actual,
      ),
    ).toThrow('salary: amounts agree');
  });

  it('rejects missing results and missing, unknown or non-finite expectations', () => {
    const { comparison } = submit(recruiter.input);
    const actual = comparison.strategies.allDividends;
    const { salary: _salary, ...partial } = expected;
    const { salary: _actualSalary, ...partialResult } = actual;
    expect(() => verifyAmounts('control', financialFields, expected, partialResult)).toThrow(
      'salary: missing actual field',
    );
    expect(() => verifyAmounts('control', financialFields, expected, null)).toThrow(
      'missing result',
    );
    expect(() => verifyAmounts('control', financialFields, partial, actual)).toThrow(
      'salary: missing expectation',
    );
    expect(() =>
      verifyAmounts('control', financialFields, { ...expected, salaray: 0 }, actual),
    ).toThrow('unknown expected field salaray');
    expect(() =>
      verifyAmounts('control', financialFields, { ...expected, salary: Number.NaN }, actual),
    ).toThrow('salary expected: expected a finite number');
  });
});
