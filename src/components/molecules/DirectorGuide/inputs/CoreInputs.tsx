// src/components/molecules/DirectorGuide/inputs/CoreInputs.tsx
/**
 * Core Inputs - Revenue, Expenses, Region, Year-End
 *
 * Essential inputs for director calculator.
 */
'use client';

import { Info } from 'lucide-react';
import { useId } from 'react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Region } from '@/lib/validation/directorValidation';
import {
  useDirectorFormData,
  useDirectorGuideActions,
  type YearEndMonth,
} from '@/store/directorGuideStore';

export function CoreInputs() {
  const id = useId();
  const formData = useDirectorFormData();
  const { setRegion, setRevenue, setIncludesVat, setExpenses, setYearEndMonth, setYearEndCustom } =
    useDirectorGuideActions();

  const revenueId = `${id}-revenue`;
  const vatId = `${id}-vat`;
  const expensesId = `${id}-expenses`;
  const regionId = `${id}-region`;
  const yearEndId = `${id}-yearEnd`;

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
              <Tooltip>
                <TooltipTrigger>
                  <Info className='size-4 text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='max-w-xs'>Exclude director salary - we calculate that separately</p>
                </TooltipContent>
              </Tooltip>
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

          {/* Year End */}
          <div className='space-y-2'>
            <div className='flex items-center gap-1'>
              <Label htmlFor={yearEndId}>Financial Year End</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className='size-4 text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent>
                  <p className='max-w-xs'>Used to calculate key tax deadlines</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={formData.yearEndMonth}
              onValueChange={(v) => setYearEndMonth(v as YearEndMonth)}
            >
              <SelectTrigger id={yearEndId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='03'>31 March (most common)</SelectItem>
                <SelectItem value='12'>31 December</SelectItem>
                <SelectItem value='other'>Other date</SelectItem>
                <SelectItem value='unknown'>I don&apos;t know</SelectItem>
              </SelectContent>
            </Select>
            {formData.yearEndMonth === 'other' && (
              <Input
                type='text'
                value={formData.yearEndCustom}
                onChange={(e) => setYearEndCustom(e.target.value)}
                placeholder='MM-DD (e.g. 06-30)'
                className='mt-2'
              />
            )}
            {formData.yearEndMonth === 'unknown' && (
              <p className='text-muted-foreground text-xs'>
                Check Companies House or your accountant
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
