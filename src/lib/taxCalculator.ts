export type Period = '1' | '12' | '13' | '26' | '52' | '260' | '1950';
export type TaxYear = '2024' | '2025';

export interface TaxResult {
    gross: number;
    allowance: number;
    taxable: number;
    tax: number;
    taxBreakdown: { band: string; amount: number; rate: number }[];
    ni: number;
    student: number;
    pension: number;
    employerNI: number;
    hmrcPensionRelief: number;
    marriageAllowance: number;
    net: number;
    netChange: number;
}

interface TaxConfig {
    ukBands: { limit: number; rate: number }[];
    scotlandBands: { limit: number; rate: number }[];
    allowance: number;
    niThreshold: number;
    niUpper: number;
}

const TAX_YEARS: Record<TaxYear, TaxConfig> = {
    '2024': {
        ukBands: [
            { limit: 37700, rate: 0.2 },
            { limit: 74870, rate: 0.4 },
            { limit: Infinity, rate: 0.45 },
        ],
        scotlandBands: [
            { limit: 2305, rate: 0.19 },
            { limit: 11684, rate: 0.2 },
            { limit: 17100, rate: 0.21 },
            { limit: 31338, rate: 0.42 },
            { limit: 50140, rate: 0.45 },
            { limit: Infinity, rate: 0.47 },
        ],
        allowance: 12570,
        niThreshold: 12570,
        niUpper: 50270,
    },
    '2025': {
        ukBands: [
            { limit: 37700, rate: 0.2 },
            { limit: 74870, rate: 0.4 },
            { limit: Infinity, rate: 0.45 },
        ],
        scotlandBands: [
            { limit: 2305, rate: 0.19 },
            { limit: 11684, rate: 0.2 },
            { limit: 17100, rate: 0.21 },
            { limit: 31338, rate: 0.42 },
            { limit: 50140, rate: 0.45 },
            { limit: Infinity, rate: 0.47 },
        ],
        allowance: 12570,
        niThreshold: 12570,
        niUpper: 50270,
    },
};

const PERIOD_FACTORS: Record<Period, (hours: number) => number> = {
    '1': () => 1,
    '12': () => 12,
    '13': () => 13,
    '26': () => 26,
    '52': () => 52,
    '260': () => 260,
    '1950': (hours) => 1950 * (hours / 37.5),
};

function calculateAllowance(
    income: number,
    taxCode: string,
    taxYear: TaxYear,
    isScotland: boolean,
    isBlind: boolean,
    isMarried: boolean,
    partnerIncome: number
): { allowance: number; marriageAllowance: number } {
    const baseAllowance = TAX_YEARS[taxYear].allowance;
    const taxCodeValue = taxCode.trim().toUpperCase() || '1257L';

    let allowance = baseAllowance;
    if (taxCodeValue === 'BR' || taxCodeValue === 'D0' || taxCodeValue === 'D1') {
        allowance = 0;
    } else if (taxCodeValue === 'NT') {
        allowance = income;
    } else if (taxCodeValue === '0T') {
        allowance = 0;
    } else if (/^(S|K)?\d+[A-Za-z]$/.test(taxCodeValue)) {
        const match = taxCodeValue.match(/^(S|K)?(\d+)[A-Za-z]$/);
        if (match) {
            const prefix = match[1];
            const num = parseInt(match[2]) * 10;
            allowance = prefix === 'K' ? -num : num;
            if (prefix === 'S' && taxYear === '2025') allowance = 12579;
        }
    }

    if (isBlind) allowance += 3070;
    let marriageAllowance = 0;
    if (isMarried && partnerIncome <= 12570 && income >= 12571 && income <= 50270) {
        marriageAllowance = 252;
        allowance += 1260;
    } else if (taxCodeValue.endsWith('M')) {
        allowance += 1260;
        marriageAllowance = 252;
    } else if (taxCodeValue.endsWith('N')) {
        allowance -= 1260;
    }

    if (income > 100000) {
        const reduction = Math.min((income - 100000) / 2, allowance);
        allowance = Math.max(0, allowance - reduction);
    }

    return { allowance, marriageAllowance };
}

function calculateIncomeTax(
    taxable: number,
    taxCode: string,
    income: number,
    taxYear: TaxYear,
    isScotland: boolean
): { tax: number; taxBreakdown: { band: string; amount: number; rate: number }[] } {
    let tax = 0;
    const taxBreakdown: { band: string; amount: number; rate: number }[] = [];
    const taxCodeValue = taxCode.trim().toUpperCase();
    const bands = isScotland ? TAX_YEARS[taxYear].scotlandBands : TAX_YEARS[taxYear].ukBands;

    if (taxCodeValue === 'BR') {
        tax = income * 0.2;
        taxBreakdown.push({ band: 'Basic Rate', amount: tax, rate: 0.2 });
    } else if (taxCodeValue === 'D0') {
        tax = income * 0.4;
        taxBreakdown.push({ band: 'Higher Rate', amount: tax, rate: 0.4 });
    } else if (taxCodeValue === 'D1') {
        tax = income * 0.45;
        taxBreakdown.push({ band: 'Additional Rate', amount: tax, rate: 0.45 });
    } else if (taxCodeValue === 'NT') {
        tax = 0;
        taxBreakdown.push({ band: 'No Tax', amount: 0, rate: 0 });
    } else {
        let remaining = taxable;
        for (let i = 0; i < bands.length; i++) {
            if (remaining <= 0) break;
            const bandLimit = i === 0 ? bands[i].limit : bands[i].limit - bands[i - 1].limit;
            const taxableInBand = Math.min(remaining, bandLimit);
            const taxInBand = taxableInBand * bands[i].rate;
            tax += taxInBand;
            taxBreakdown.push({
                band: `${(bands[i].rate * 100).toFixed(0)}%`,
                amount: taxInBand,
                rate: bands[i].rate,
            });
            remaining -= taxableInBand;
        }
    }

    return { tax, taxBreakdown };
}

function calculateNI(income: number, taxYear: TaxYear): number { // Fixed: Use income, not taxable
    const niThreshold = TAX_YEARS[taxYear].niThreshold;
    const niUpper = TAX_YEARS[taxYear].niUpper;
    const niTaxable = Math.max(income - niThreshold, 0); // NI on full income above threshold

    if (niTaxable <= niUpper - niThreshold) {
        return niTaxable * 0.08;
    } else {
        return (niUpper - niThreshold) * 0.08 + (niTaxable - (niUpper - niThreshold)) * 0.02;
    }
}

function calculateStudentLoan(income: number, studentLoans: string[]): number {
    let totalStudentLoan = 0;
    for (const loanType of studentLoans) {
        switch (loanType) {
            case 'plan1':
                totalStudentLoan += Math.max(income - 22015, 0) * 0.09;
                break;
            case 'plan2':
                totalStudentLoan += Math.max(income - 27295, 0) * 0.09;
                break;
            case 'plan4':
                totalStudentLoan += Math.max(income - 27660, 0) * 0.09;
                break;
            case 'postgraduate':
                totalStudentLoan += Math.max(income - 21000, 0) * 0.06;
                break;
            default:
                break;
        }
    }
    return totalStudentLoan;
}

function calculateTaxForYear(
    income: number,
    taxYear: TaxYear,
    isScotland: boolean,
    pensionContrib: number,
    student: number,
    ni: number,
    allowancesDeductions: number
): number {
    const { allowance } = calculateAllowance(income, '1257L', taxYear, isScotland, false, false, 0);
    const taxable = Math.max(income - allowance - pensionContrib - allowancesDeductions, 0);
    const { tax } = calculateIncomeTax(taxable, '1257L', income, taxYear, isScotland);
    return income - tax - ni - student - pensionContrib - allowancesDeductions;
}

export function calculateTax(
    gross: number,
    taxCode: string,
    pension: number,
    isPensionPercent: boolean,
    studentLoans: string[],
    isScotland: boolean,
    taxYear: TaxYear,
    isOverPensionAge: boolean,
    isMarried: boolean,
    partnerSalary: number,
    isBlind: boolean,
    noNI: boolean,
    period: Period,
    hoursPerWeek: number,
    allowancesDeductions: number = 0
): TaxResult {
    const income = gross * PERIOD_FACTORS[period](hoursPerWeek);
    const pensionContrib = isPensionPercent ? (income * pension) / 100 : pension;

    const { allowance, marriageAllowance } = calculateAllowance(
        income,
        taxCode,
        taxYear,
        isScotland,
        isBlind,
        isMarried && income - pensionContrib <= 50270,
        partnerSalary
    );

    const taxableBeforeDeductions = Math.max(income - allowance - pensionContrib, 0);
    const taxable = Math.max(taxableBeforeDeductions - allowancesDeductions, 0);

    const { tax, taxBreakdown } = calculateIncomeTax(taxable, taxCode, income, taxYear, isScotland);
    const ni = noNI || isOverPensionAge ? 0 : calculateNI(income, taxYear); // Fixed: NI on income
    const student = calculateStudentLoan(income, studentLoans);

    const employerNI = Math.max(income - TAX_YEARS[taxYear].niThreshold, 0) * 0.138;
    const hmrcPensionRelief = pensionContrib * (taxBreakdown[taxBreakdown.length - 1]?.rate || 0);

    const net = income - tax - ni - student - pensionContrib - allowancesDeductions + marriageAllowance;
    const prevYear = taxYear === '2025' ? '2024' : '2025';
    const prevYearNet = calculateTaxForYear(income, prevYear, isScotland, pensionContrib, student, ni, allowancesDeductions);

    return {
        gross: income,
        allowance,
        taxable,
        tax,
        taxBreakdown,
        ni,
        student,
        pension: pensionContrib,
        employerNI,
        hmrcPensionRelief,
        marriageAllowance,
        net: net > 0 ? net : 0,
        netChange: net - prevYearNet,
    };
}