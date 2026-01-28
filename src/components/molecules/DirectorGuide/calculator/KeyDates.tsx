// src/components/molecules/DirectorGuide/calculator/KeyDates.tsx
/**
 * Key Dates - Tax deadlines with .ics calendar export
 */
'use client';

import { Calendar, Download } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDirectorFormData } from '@/store/directorGuideStore';

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const generateICS = (title: string, date: Date, description: string) => {
  const formatICSDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dateStr = date.toISOString().split('T')[0]?.replace(/-/g, '') ?? '';
  
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PayeTax//Director Calculator//EN
BEGIN:VEVENT
UID:${Date.now()}@payetax.co.uk
DTSTAMP:${formatICSDate(new Date())}
DTSTART;VALUE=DATE:${dateStr}
SUMMARY:${title}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};

export function KeyDates() {
  const formData = useDirectorFormData();

  const keyDates = useMemo(() => {
    if (formData.yearEndMonth === 'unknown') return null;

    const now = new Date();
    const currentYear = now.getFullYear();

    let yearEndDate: Date;
    if (formData.yearEndMonth === '03') {
      yearEndDate = new Date(currentYear, 2, 31); // 31 March
    } else if (formData.yearEndMonth === '12') {
      yearEndDate = new Date(currentYear, 11, 31); // 31 December
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

    // If year-end has passed this year, use next year
    if (yearEndDate < now) {
      yearEndDate.setFullYear(currentYear + 1);
    }

    // CT payment: 9 months + 1 day after year end
    const ctPaymentDate = new Date(yearEndDate);
    ctPaymentDate.setMonth(ctPaymentDate.getMonth() + 9);
    ctPaymentDate.setDate(ctPaymentDate.getDate() + 1);

    // CT return: 12 months after year end
    const ctReturnDate = new Date(yearEndDate);
    ctReturnDate.setFullYear(ctReturnDate.getFullYear() + 1);

    // SA payment: 31 January following tax year end (5 April)
    const taxYearEnd = new Date(yearEndDate.getFullYear(), 3, 5); // 5 April
    if (yearEndDate > taxYearEnd) {
      taxYearEnd.setFullYear(taxYearEnd.getFullYear() + 1);
    }
    const saPaymentDate = new Date(taxYearEnd.getFullYear() + 1, 0, 31); // 31 January

    return {
      yearEnd: yearEndDate,
      ctPayment: ctPaymentDate,
      ctReturn: ctReturnDate,
      saPayment: saPaymentDate,
    };
  }, [formData.yearEndMonth, formData.yearEndCustom]);

  if (!keyDates) return null;

  const dates = [
    {
      label: 'Year End',
      date: keyDates.yearEnd,
      description: null,
    },
    {
      label: 'CT Payment Due',
      date: keyDates.ctPayment,
      description: `Corporation Tax payment due for year ending ${formatDate(keyDates.yearEnd)}`,
    },
    {
      label: 'CT Return Due',
      date: keyDates.ctReturn,
      description: `Corporation Tax return due for year ending ${formatDate(keyDates.yearEnd)}`,
    },
    {
      label: 'Self Assessment Due',
      date: keyDates.saPayment,
      description: 'Self Assessment tax return and payment due',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calendar className='size-5' />
          Key Dates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4 sm:grid-cols-2'>
          {dates.map(({ label, date, description }) => (
            <div
              key={label}
              className='flex items-center justify-between rounded-lg border p-3'
            >
              <div>
                <div className='font-medium'>{label}</div>
                <div className='text-muted-foreground text-sm'>{formatDate(date)}</div>
              </div>
              {description && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => generateICS(label, date, description)}
                  title='Add to calendar'
                >
                  <Download className='size-4' />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
