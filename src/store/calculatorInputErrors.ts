/**
 * Rejected amount text in the main PAYE calculator, by field.
 *
 * Kept separate from the store so components and tests can use these pure helpers directly.
 *
 * @module store/calculatorInputErrors
 */
import type { IncomeSource } from '@/lib/types/calculator';

/** Main-calculator amount fields whose typed text can be rejected. */
export type CalculatorAmountField =
  | 'salary'
  | 'partnerGrossWage'
  | 'allowancesDeductions'
  | 'pensionContribution'
  | `incomeSource:${string}`;

/** Rejected text held for an amount field, with its error message. */
export interface CalculatorInvalidAmount {
  text: string;
  error: string;
}

export type CalculatorInputErrors = Partial<Record<CalculatorAmountField, CalculatorInvalidAmount>>;

/** Key under which an additional income source's rejected amount text is held. */
export const incomeSourceAmountField = (id: string): CalculatorAmountField => `incomeSource:${id}`;

/**
 * Rejected amounts that block calculation: those in fields the current inputs use. A hidden
 * partner wage (not married) or a removed income source does not block.
 */
export const getBlockingInputErrors = (state: {
  input: { isMarried: boolean; incomeSources: Pick<IncomeSource, 'id'>[] };
  inputErrors: CalculatorInputErrors;
}): [CalculatorAmountField, CalculatorInvalidAmount][] =>
  (Object.entries(state.inputErrors) as [CalculatorAmountField, CalculatorInvalidAmount][]).filter(
    ([field]) => {
      if (field === 'partnerGrossWage') return state.input.isMarried;
      if (field.startsWith('incomeSource:')) {
        return state.input.incomeSources.some(
          (source) => incomeSourceAmountField(source.id) === field,
        );
      }
      return true;
    },
  );
