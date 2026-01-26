// src/components/molecules/DirectorGuide/dashboard/InputsPanel.tsx
'use client';

import { Crown, FileDown, RotateCcw, Share2 } from 'lucide-react';
import { Input } from '@/components/atoms/ui/input';
import { Label } from '@/components/atoms/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/ui/select';
import { cn } from '@/lib/utils';
import type { Region } from '@/lib/validation/directorValidation';
import { useDirectorFormData, useDirectorGuideActions } from '@/store/directorGuideStore';

interface InputsPanelProps {
  onCalculate: () => void;
  isCalculateDisabled: boolean;
  className?: string;
}

/**
 * Left inputs panel with form fields and quick actions
 */
export function InputsPanel({ onCalculate, isCalculateDisabled, className }: InputsPanelProps) {
  const formData = useDirectorFormData();
  const { setRegion, setRevenue, setExpenses, setAlreadyTaken, reset } = useDirectorGuideActions();

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setRevenue(value ? Number(value) : 0);
  };

  const handleExpensesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setExpenses(value ? Number(value) : 0);
  };

  const handleAlreadyTakenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAlreadyTaken(value ? Number(value) : 0);
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === 0) return '';
    return `£${value.toLocaleString('en-GB')}`;
  };

  return (
    <aside
      className={cn('flex h-full flex-col border-r border-white/5 bg-slate-900 p-6', className)}
    >
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <span className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
          Inputs
        </span>
        <a
          href='/tools'
          className='flex items-center gap-1 text-slate-500 text-xs transition-colors hover:text-cyan-500'
        >
          ← Back
        </a>
      </div>

      {/* Form fields */}
      <div className='space-y-5'>
        <div className='space-y-2'>
          <Label className='text-slate-400 text-sm'>Company Revenue</Label>
          <Input
            type='text'
            value={formatCurrency(formData.revenue)}
            onChange={handleRevenueChange}
            placeholder='£0'
            className='border-white/10 bg-slate-800 font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20'
          />
          <p className='text-slate-600 text-xs'>Annual turnover before expenses</p>
        </div>

        <div className='space-y-2'>
          <Label className='text-slate-400 text-sm'>Business Expenses</Label>
          <Input
            type='text'
            value={formatCurrency(formData.expenses)}
            onChange={handleExpensesChange}
            placeholder='£0'
            className='border-white/10 bg-slate-800 font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20'
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-slate-400 text-sm'>Region</Label>
          <Select value={formData.region ?? ''} onValueChange={(v) => setRegion(v as Region)}>
            <SelectTrigger className='border-white/10 bg-slate-800 text-slate-100'>
              <SelectValue placeholder='Select region' />
            </SelectTrigger>
            <SelectContent className='border-slate-700 bg-slate-800'>
              <SelectItem value='rUK'>England</SelectItem>
              <SelectItem value='scotland'>Scotland</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label className='text-slate-400 text-sm'>Already Taken This Year</Label>
          <Input
            type='text'
            value={formatCurrency(formData.alreadyTaken)}
            onChange={handleAlreadyTakenChange}
            placeholder='£0'
            className='border-white/10 bg-slate-800 font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20'
          />
        </div>
      </div>

      {/* Calculate button */}
      <button
        type='button'
        onClick={onCalculate}
        disabled={isCalculateDisabled}
        className={cn(
          'mt-6 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 font-semibold text-slate-950 transition-all',
          isCalculateDisabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25'
        )}
      >
        Calculate
      </button>

      {/* Divider */}
      <div className='my-6 h-px bg-white/5' />

      {/* Quick actions */}
      <div className='space-y-1'>
        <span className='font-semibold text-slate-500 text-xs uppercase tracking-wider'>
          Quick Actions
        </span>
        <div className='mt-3 space-y-2'>
          <QuickAction icon={RotateCcw} label='Reset to defaults' shortcut='R' onClick={reset} />
          <QuickAction icon={FileDown} label='Export as PDF' shortcut='E' disabled isPro />
          <QuickAction icon={Share2} label='Share results' shortcut='S' disabled isPro />
        </div>
      </div>
    </aside>
  );
}

interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut: string;
  onClick?: () => void;
  disabled?: boolean;
  isPro?: boolean;
}

function QuickAction({ icon: Icon, label, shortcut, onClick, disabled, isPro }: QuickActionProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border border-white/5 bg-slate-800 px-3 py-2.5 text-left text-slate-400 text-sm transition-all',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:border-white/10 hover:bg-slate-700 hover:text-slate-200'
      )}
    >
      <Icon className='size-4 text-cyan-500' />
      <span className='flex-1'>{label}</span>
      {isPro && <Crown className='size-3 text-amber-500' />}
      <span className='rounded bg-slate-900 px-1.5 py-0.5 font-mono text-slate-600 text-xs'>
        {shortcut}
      </span>
    </button>
  );
}
