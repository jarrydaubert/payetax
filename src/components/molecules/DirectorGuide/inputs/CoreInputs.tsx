// src/components/molecules/DirectorGuide/inputs/CoreInputs.tsx
/**
 * Core Inputs - Revenue, Expenses, Region, Year-End
 *
 * Essential inputs for director calculator.
 */
'use client';

import { useId } from 'react';
import { LabelTooltip } from '@/components/atoms/LabelTooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Region } from '@/lib/validation/directorValidation';
import { useDirectorFormSlice, useDirectorGuideActions } from '@/store/directorGuideStore';
import { AccountingPeriodEndInput } from './AccountingPeriodEndInput';

export function CoreInputs() {
  const id = useId();
  const formData = useDirectorFormSlice((state) => ({
    revenue: state.revenue,
    includesVat: state.includesVat,
    expenses: state.expenses,
    region: state.region,
  }));
  const { setRegion, setRevenue, setIncludesVat, setExpenses } = useDirectorGuideActions();

  const revenueId = `${id}-revenue`;
  const vatId = `${id}-vat`;
  const expensesId = `${id}-expenses`;
  const regionId = `${id}-region`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Financials</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          {/* Revenue */}
          <div className='space-y-2'>
            <Label htmlFor={revenueId}>Annual Revenue</Label>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground'>£</span>
              <Input
                id={revenueId}
                type='number'
                value={formData.revenue ?? ''}
                onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
                placeholder='100000'
              />
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id={vatId}
                checked={formData.includesVat}
                onCheckedChange={(checked) => setIncludesVat(checked === true)}
              />
              <Label htmlFor={vatId} className='text-sm'>
                Revenue includes VAT (warnings only)
              </Label>
            </div>
          </div>

          {/* Expenses */}
          <div className='space-y-2'>
            <div className='flex items-center gap-1'>
              <Label htmlFor={expensesId}>Business Expenses</Label>
              <LabelTooltip fieldName='directorExpenses' />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground'>£</span>
              <Input
                id={expensesId}
                type='number'
                value={formData.expenses ?? ''}
                onChange={(e) => setExpenses(parseFloat(e.target.value) || 0)}
                placeholder='20000'
              />
            </div>
          </div>

          {/* Region */}
          <div className='space-y-2'>
            <Label htmlFor={regionId}>Region</Label>
            <Select value={formData.region ?? ''} onValueChange={(v) => setRegion(v as Region)}>
              <SelectTrigger id={regionId}>
                <SelectValue placeholder='Select region' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='rUK'>England / Wales / NI</SelectItem>
                <SelectItem value='scotland'>Scotland</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AccountingPeriodEndInput />
        </div>
      </CardContent>
    </Card>
  );
}
