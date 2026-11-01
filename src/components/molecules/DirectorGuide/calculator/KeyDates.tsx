// src/components/molecules/DirectorGuide/calculator/KeyDates.tsx
/**
 * Key Dates - Compact tax deadline display
 */
'use client';

import { Calendar, Download } from 'lucide-react';
import { useMemo } from 'react';
import { trackCalendarDownloaded } from '@/lib/directorGuideAnalytics';
import { useDirectorFormSlice } from '@/store/directorGuideStore';

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const formatICSDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const escapeICSText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export function KeyDates() {
  const { yearEndMonth, yearEndCustom } = useDirectorFormSlice((formData) => ({
    yearEndMonth: formData.yearEndMonth,
    yearEndCustom: formData.yearEndCustom,
  }));

  const keyDates = useMemo(() => {
    if (yearEndMonth === 'unknown') return null;

    const now = new Date();
    const currentYear = now.getFullYear();

    let yearEndDate: Date;
    if (yearEndMonth === '03') {
      yearEndDate = new Date(currentYear, 2, 31);
    } else if (yearEndMonth === '12') {
      yearEndDate = new Date(currentYear, 11, 31);
    } else if (yearEndMonth === 'other' && yearEndCustom) {
      const [month, day] = yearEndCustom.split('-').map(Number);
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
  }, [yearEndMonth, yearEndCustom]);

  if (!keyDates) return null;

  const dates = [
    { label: 'Year End', date: keyDates.yearEndDate },
    { label: 'CT Payment', date: keyDates.ctPaymentDate },
    { label: 'CT Return', date: keyDates.ctReturnDate },
    { label: 'Self Assessment', date: keyDates.saPaymentDate },
  ];

  const handleDownloadCalendar = () => {
    if (typeof URL.createObjectURL !== 'function') return;

    const nowStamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z');
    const events = dates.flatMap(({ label, date }) => {
      const startDate = formatICSDate(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      const summary = escapeICSText(`PayeTax: ${label}`);
      const description = escapeICSText(`Key tax deadline: ${label}`);
      const uid = `${label.toLowerCase().replace(/\s+/g, '-')}-${startDate}@payetax.co.uk`;

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${nowStamp}`,
        `DTSTART;VALUE=DATE:${startDate}`,
        `DTEND;VALUE=DATE:${formatICSDate(endDate)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        'END:VEVENT',
      ];
    });

    const calendarData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PayeTax//Director Key Dates//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...events,
      'END:VCALENDAR',
      '',
    ].join('\r\n');

    const blob = new Blob([calendarData], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payetax-key-dates-${keyDates.yearEndDate.getFullYear()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    trackCalendarDownloaded();
  };

  return (
    <div className='rounded-sm border border-border/60 bg-card p-4'>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Calendar className='size-4' />
          <span className='font-medium text-sm'>Key Dates</span>
        </div>
        <button
          type='button'
          onClick={handleDownloadCalendar}
          className='inline-flex items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/10 px-2 py-1 font-medium text-primary text-xs transition-colors hover:border-primary/40 hover:bg-primary/20'
        >
          <Download className='size-3.5' />
          Download .ics
        </button>
      </div>
      <div className='grid grid-cols-2 gap-2 text-xs md:grid-cols-4 md:gap-6'>
        {dates.map(({ label, date }) => (
          <div key={label}>
            <div className='text-muted-foreground'>{label}</div>
            <div className='font-mono text-foreground'>{formatDate(date)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
