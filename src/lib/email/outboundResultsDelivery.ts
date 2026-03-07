import type { PayPeriod, TaxYear } from '@/constants/taxRates';
import {
  generateDirectorEmailHtml,
  generateDirectorEmailText,
} from '@/lib/email/directorResultsEmail';
import { type SendOutboundEmailResult, sendOutboundEmail } from '@/lib/email/emailDelivery';
import {
  formatTaxYearForEmail,
  generatePayeEmailHtml,
  generatePayeEmailText,
} from '@/lib/email/payeResultsEmail';
import { calculateStrategyComparison } from '@/lib/tax/strategyComparison';
import { calculateTax, type TaxCalculationInput } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';
import type { DirectorEmailInput, PayeEmailInput } from '@/lib/validation/emailValidation';

export type OutboundResultsDeliveryResult = SendOutboundEmailResult;

export function sendPayeResultsEmail(args: {
  email: string;
  input: PayeEmailInput;
}): Promise<OutboundResultsDeliveryResult> {
  const calculationInput: TaxCalculationInput = {
    ...args.input,
    payPeriod: args.input.payPeriod as PayPeriod,
    taxYear: args.input.taxYear as TaxYear,
    incomeSources: args.input.incomeSources?.map((source, index) => ({
      id: source.id ?? `email-source-${index}`,
      label: source.label,
      type: source.type,
      amount: source.amount,
      period: source.period as PayPeriod,
    })),
  };

  const results = calculateTax(calculationInput);
  const taxYearLabel = formatTaxYearForEmail(args.input.taxYear);

  return sendOutboundEmail(
    {
      from: 'PayeTax <noreply@payetax.co.uk>',
      to: args.email,
      subject: `Your UK Tax Calculation - ${formatCurrency(results.netPay.annually)} take-home`,
      html: generatePayeEmailHtml(results, taxYearLabel),
      text: generatePayeEmailText(results, taxYearLabel),
    },
    'send-results',
  );
}

export function sendDirectorResultsEmail(args: {
  email: string;
  input: DirectorEmailInput;
  taxYear?: string;
}): Promise<OutboundResultsDeliveryResult> {
  const normalizedTaxYear = (args.taxYear ?? '2025-2026') as TaxYear;
  const comparison = calculateStrategyComparison(args.input, normalizedTaxYear);
  const strategies = {
    allSalary: comparison.strategies.allSalary,
    optimalMix: comparison.strategies.optimalMix,
    allDividends: comparison.strategies.allDividends,
  };
  const recommendedStrategy = strategies[comparison.recommended];

  return sendOutboundEmail(
    {
      from: 'PayeTax <noreply@payetax.co.uk>',
      to: args.email,
      subject: `Director Tax Strategy Report - ${formatCurrency(recommendedStrategy.takeHome)} Take-Home`,
      html: generateDirectorEmailHtml({
        grossProfit: comparison.grossProfit,
        strategies,
        recommended: comparison.recommended,
        savingsVsAllSalary: comparison.savingsVsAllSalary,
        taxYear: args.taxYear,
      }),
      text: generateDirectorEmailText({
        grossProfit: comparison.grossProfit,
        strategies,
        recommended: comparison.recommended,
        savingsVsAllSalary: comparison.savingsVsAllSalary,
        taxYear: args.taxYear,
      }),
    },
    'send-director-results',
  );
}
