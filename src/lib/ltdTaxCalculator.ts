// src/lib/ltdTaxCalculator.ts
export type LtdTaxResult = {
    profit: number;
    corpTax: number;
    employerNI: number;
    vat: number;
    dividendTaxBreakdown: { band: string; rate: number; amount: number }[];
    dividendTax: number;
    netProfit: number;
};

export const calculateLtdTax = (
    revenue: number,
    expenses: number,
    salary: number,
    dividends: number,
    vatRegistered: boolean,
    vatRate: number,
    taxYear: '2024' | '2025'
): LtdTaxResult => {
    const profitBeforeTax = revenue - expenses - salary;
    const corpTaxRateSmall = taxYear === '2024' ? 0.19 : 0.20;
    const corpTaxRateMain = taxYear === '2024' ? 0.25 : 0.26;
    let corpTax = 0;
    if (profitBeforeTax > 0) {
        if (profitBeforeTax <= 50000) corpTax = profitBeforeTax * corpTaxRateSmall;
        else if (profitBeforeTax <= 250000) {
            const marginalRelief = ((250000 - profitBeforeTax) / (250000 - 50000)) * (corpTaxRateMain - corpTaxRateSmall) * profitBeforeTax;
            corpTax = profitBeforeTax * corpTaxRateMain - marginalRelief;
        } else corpTax = profitBeforeTax * corpTaxRateMain;
    }

    const niThreshold = taxYear === '2024' ? 9100 : 5000;
    const employerNIRate = taxYear === '2024' ? 0.138 : 0.15;
    const employerNI = salary > niThreshold ? (salary - niThreshold) * employerNIRate : 0;

    const vat = vatRegistered && revenue > 0 ? revenue * (vatRate / 100) : 0;

    const dividendAllowance = taxYear === '2024' ? 1000 : 900;
    let dividendTax = 0;
    const dividendTaxBreakdown: { band: string; rate: number; amount: number }[] = [];
    const taxableDividends = Math.max(0, dividends - dividendAllowance);
    const basicRate = taxYear === '2024' ? 0.0875 : 0.09;
    const higherRate = taxYear === '2024' ? 0.3375 : 0.34;
    const additionalRate = taxYear === '2024' ? 0.3935 : 0.40;
    if (taxableDividends > 0) {
        const basicBand = Math.min(taxableDividends, 37500);
        if (basicBand > 0) {
            dividendTax += basicBand * basicRate;
            dividendTaxBreakdown.push({ band: 'Basic Rate', rate: basicRate * 100, amount: basicBand * basicRate });
        }
        if (taxableDividends > 37500) {
            const higherBand = Math.min(taxableDividends - 37500, 125140 - 37500);
            if (higherBand > 0) {
                dividendTax += higherBand * higherRate;
                dividendTaxBreakdown.push({ band: 'Higher Rate', rate: higherRate * 100, amount: higherBand * higherRate });
            }
            if (taxableDividends > 125140) {
                const additionalBand = taxableDividends - 125140;
                dividendTax += additionalBand * additionalRate;
                dividendTaxBreakdown.push({ band: 'Additional Rate', rate: additionalRate * 100, amount: additionalBand * additionalRate });
            }
        }
    }

    const netProfit = profitBeforeTax - corpTax - employerNI - dividendTax;
    return {
        profit: profitBeforeTax,
        corpTax: parseFloat(corpTax.toFixed(2)),
        employerNI: parseFloat(employerNI.toFixed(2)),
        vat: parseFloat(vat.toFixed(2)),
        dividendTaxBreakdown,
        dividendTax: parseFloat(dividendTax.toFixed(2)),
        netProfit: parseFloat(netProfit.toFixed(2))
    };
};