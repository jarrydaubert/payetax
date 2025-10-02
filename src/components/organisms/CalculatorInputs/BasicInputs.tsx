// src/components/organisms/CalculatorInputs/BasicInputs.tsx
'use client';

import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { useId } from 'react';
import { CurrencyInput } from '@/components/molecules/CurrencyInput';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PERIODS, TAX_YEARS } from '@/constants/taxRates';
import { useCalculatorStore } from '@/store/calculatorStore';

export function BasicInputs() {
  const { input, setSalary, setPayPeriod, setTaxYear } = useCalculatorStore();
  const salaryId = useId();
  const payPeriodId = useId();
  const taxYearId = useId();

  const payPeriodOptions = [
    { value: PERIODS.ANNUALLY, label: 'Annually' },
    { value: PERIODS.MONTHLY, label: 'Monthly' },
    { value: PERIODS.WEEKLY, label: 'Weekly' },
    { value: PERIODS.FORTNIGHTLY, label: 'Fortnightly' },
    { value: PERIODS.FOUR_WEEKLY, label: 'Four Weekly' },
  ];

  const taxYearOptions = TAX_YEARS.map((year) => ({
    value: year,
    label: year,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className='p-6'>
        <div className='mb-4 flex items-center gap-2'>
          <Calculator className='h-5 w-5 text-primary' />
          <h3 className='font-semibold text-lg'>Basic Information</h3>
        </div>

        <div className='space-y-4'>
          <CurrencyInput
            id={salaryId}
            label='Salary'
            value={input.salary}
            onChange={setSalary}
            description={`Enter your ${input.payPeriod} salary`}
            tooltip='Your gross salary before any deductions'
            required
            placeholder='30000'
          />

          <FormField
            label='Pay Period'
            htmlFor={payPeriodId}
            description='How often you receive your salary'
            tooltip='Select how frequently you get paid'
          >
            <Select value={input.payPeriod} onValueChange={setPayPeriod}>
              <SelectTrigger id={payPeriodId}>
                <SelectValue placeholder='Select pay period' />
              </SelectTrigger>
              <SelectContent>
                {payPeriodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label='Tax Year'
            htmlFor={taxYearId}
            description='UK tax year (April 6th - April 5th)'
            tooltip='The tax year determines which HMRC rates apply'
          >
            <Select value={input.taxYear} onValueChange={setTaxYear}>
              <SelectTrigger id={taxYearId}>
                <SelectValue placeholder='Select tax year' />
              </SelectTrigger>
              <SelectContent>
                {taxYearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </Card>
    </motion.div>
  );
}
