// src/components/molecules/DirectorGuide/calculator/KeyDates.tsx
/**
 * Key Dates - Compact tax deadline display
 */
'use client';

import { Calendar } from 'lucide-react';
import { useMemo } from 'react';
import { useDirectorFormData } from '@/store/directorGuideStore';

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function KeyDates() {
  const formData = useDirectorFormData();

  const keyDates = useMemo(() => {
    if (formData.yearEndMonth === 'unknown') return null;

    const now = new Date();
    const currentYear = now.getFullYear();

    let yearEndDate: Date;
    if (formData.yearEndMonth === '03') {
      yearEndDate = new Date(currentYear, 2, 31);
    } else if (formData.yearEndMonth === '12') {
      yearEndDate = new Date(currentYear, 11, 31);
    } else if (formData.yearEndMonth === 'other' && formData.yearEndCustom) {
      const [month, day] = formData.yearEndCustom.split('-').map(Number);
      if (month && day) {
        yearEndDate = new Date(currentYear, month - 1, day);
      } else {
        return null;
      }
    } else {
      return null;
    }

    if (yearEndDate < now) {
      yearEndDate.setFullYear(currentYear + 1);
    }

    const ctPaymentDate = new Date(yearEndDate);
    ctPaymentDate.setMonth(ctPaymentDate.getMonth() + 9);
    ctPaymentDate.setDate(ctPaymentDate.getDate() + 1);

    const ctReturnDate = new Date(yearEndDate);
    ctReturnDate.setFullYear(ctReturnDate.getFullYear() + 1);

    const taxYearEnd = new Date(yearEndDate.getFullYear(), 3, 5);
    if (yearEndDate > taxYearEnd) {
      taxYearEnd.setFullYear(taxYearEnd.getFullYear() + 1);
    }
    const saPaymentDate = new Date(taxYearEnd.getFullYear() + 1, 0, 31);

    return { yearEndDate, ctPaymentDate, ctReturnDate, saPaymentDate };
  }, [formData.yearEndMonth, formData.yearEndCustom]);

  if (!keyDates) return null;

  const dates = [
    { label: 'Year End', date: keyDates.yearEndDate },
    { label: 'CT Payment', date: keyDates.ctPaymentDate },
    { label: 'CT Return', date: keyDates.ctReturnDate },
    { label: 'Self Assessment', date: keyDates.saPaymentDate },
  ];

  return (
    <div className='rounded-xl border border-white/[0.04] bg-[#1e293b] p-4'>
      <div className='mb-3 flex items-center gap-2 text-slate-400'>
        <Calendar className='size-4' />
        <span className='font-medium text-sm'>Key Dates</span>
      </div>
      <div className='grid grid-cols-2 gap-x-6 gap-y-2 text-xs md:grid-cols-4'>
        {dates.map(({ label, date }) => (
          <div key={label}>
            <div className='text-slate-500'>{label}</div>
            <div className='font-mono text-slate-300'>{formatDate(date)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
