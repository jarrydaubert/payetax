// src/components/organisms/CalculatorInputs/DeductionsInputs.tsx
'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Wallet } from 'lucide-react';
import { useId } from 'react';
import { CurrencyInput } from '@/components/molecules/CurrencyInput';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { StudentLoanPlan } from '@/constants/taxRates';
import { useCalculatorStore } from '@/store/calculatorStore';

export function DeductionsInputs() {
  const { input, setPensionContribution, setPensionContributionType, setStudentLoanPlans } =
    useCalculatorStore();
  const pensionId = useId();

  const availableStudentLoans: { value: StudentLoanPlan; label: string; description: string }[] = [
    { value: 'plan1', label: 'Plan 1', description: 'Before Sept 2012' },
    { value: 'plan2', label: 'Plan 2', description: 'Sept 2012 - July 2023' },
    { value: 'plan4', label: 'Plan 4', description: 'Scotland' },
    { value: 'plan5', label: 'Plan 5', description: 'Aug 2023 onwards' },
    { value: 'postgrad', label: 'Postgraduate', description: 'Masters/PhD' },
  ];

  const toggleStudentLoan = (plan: StudentLoanPlan) => {
    const current = input.studentLoanPlans;
    if (current.includes(plan)) {
      setStudentLoanPlans(current.filter((p) => p !== plan));
    } else {
      setStudentLoanPlans([...current, plan]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className='p-6'>
        <div className='mb-4 flex items-center gap-2'>
          <Wallet className='h-5 w-5 text-primary' />
          <h3 className='font-semibold text-lg'>Deductions</h3>
        </div>

        <Tabs defaultValue='pension' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='pension'>
              <Wallet className='mr-2 h-4 w-4' />
              Pension
            </TabsTrigger>
            <TabsTrigger value='student-loan'>
              <GraduationCap className='mr-2 h-4 w-4' />
              Student Loan
            </TabsTrigger>
          </TabsList>

          <TabsContent value='pension' className='space-y-4 pt-4'>
            <div className='space-y-2'>
              <FormField
                label='Contribution Type'
                htmlFor='pension-type'
                description='How you want to specify your pension contribution'
              >
                <div className='flex gap-2'>
                  <motion.button
                    type='button'
                    onClick={() => setPensionContributionType('percentage')}
                    className={`flex-1 rounded-lg border p-3 text-center text-sm transition-all ${
                      input.pensionContributionType === 'percentage'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Percentage
                  </motion.button>
                  <motion.button
                    type='button'
                    onClick={() => setPensionContributionType('amount')}
                    className={`flex-1 rounded-lg border p-3 text-center text-sm transition-all ${
                      input.pensionContributionType === 'amount'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Fixed Amount
                  </motion.button>
                </div>
              </FormField>
            </div>

            <CurrencyInput
              id={pensionId}
              label={
                input.pensionContributionType === 'percentage'
                  ? 'Contribution Percentage'
                  : 'Contribution Amount'
              }
              value={input.pensionContribution}
              onChange={setPensionContribution}
              description={
                input.pensionContributionType === 'percentage'
                  ? 'Percentage of your gross salary'
                  : `Fixed ${input.payPeriod} contribution amount`
              }
              tooltip='Pension contributions are tax-free and reduce your taxable income'
              placeholder='5'
            />
          </TabsContent>

          <TabsContent value='student-loan' className='space-y-4 pt-4'>
            <FormField
              label='Student Loan Plans'
              htmlFor='student-loans'
              description='Select all student loan plans that apply to you'
              tooltip='You can have multiple student loan plans (e.g., Plan 2 + Postgraduate)'
            >
              <div className='space-y-2'>
                {availableStudentLoans.map((loan) => {
                  const isSelected = input.studentLoanPlans.includes(loan.value);
                  return (
                    <motion.button
                      key={loan.value}
                      type='button'
                      onClick={() => toggleStudentLoan(loan.value)}
                      className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div>
                        <div className='font-medium'>{loan.label}</div>
                        <div className='text-muted-foreground text-xs'>{loan.description}</div>
                      </div>
                      {isSelected && <Badge variant='default'>Active</Badge>}
                    </motion.button>
                  );
                })}
              </div>
            </FormField>
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}
