// src/components/molecules/DirectorGuide/calculator/KeyDates.tsx
/**
 * Key Dates - Compact tax deadline display
 */
'use client';

import { Calendar, Download } from 'lucide-react';
import { trackCalendarDownloaded } from '@/lib/directorGuideAnalytics';
import { CURRENT_TAX_YEAR, formatTaxYearDisplay, getCompanyDeadlines } from '@/lib/tax';
import { hasCurrentDirectorResults, useDirectorGuideStore } from '@/store/directorGuideStore';

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

const formatICSDate = (date: Date) => date.toISOString().slice(0, 10).replaceAll('-', '');

const escapeICSText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export function KeyDates() {
  const calculatedFormData = useDirectorGuideStore((state) => state.calculatedFormData);
  const periodEnd = calculatedFormData?.accountingPeriodEnd ?? '';
  const companyDeadlines = getCompanyDeadlines(periodEnd);
  const companyDates = companyDeadlines
    ? [
        {
          id: 'year-end',
          label: 'Accounting period end',
          date: companyDeadlines.periodEnd,
          description: 'Corporation Tax accounting period end',
        },
        {
          id: 'ct-payment',
          label: 'Corporation Tax payment (standard)',
          date: companyDeadlines.payment,
          description: 'Standard due date. Instalment rules may apply.',
        },
        {
          id: 'ct-return',
          label: 'Company Tax Return (standard)',
          date: companyDeadlines.filing,
          description: 'Standard filing date. Long accounts may change it.',
        },
      ]
    : [];
  const personalDate = {
    id: 'self-assessment',
    label: `Self Assessment (${formatTaxYearDisplay(CURRENT_TAX_YEAR)})`,
    date: new Date(Date.UTC(Number(CURRENT_TAX_YEAR.split('-')[1]) + 1, 0, 31)),
    description: 'Standard online filing and payment if due. Check payments on account.',
  };

  const handleDownloadCalendar = () => {
    if (!companyDeadlines || typeof URL.createObjectURL !== 'function') return;
    const state = useDirectorGuideStore.getState();
    if (state.calculatedFormData !== calculatedFormData || !hasCurrentDirectorResults(state))
      return;

    const nowStamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z');
    const events = [...companyDates, personalDate].flatMap(({ id, label, date, description }) => {
      const startDate = formatICSDate(date);
      const endDate = new Date(date);
      endDate.setUTCDate(endDate.getUTCDate() + 1);

      return [
        'BEGIN:VEVENT',
        `UID:${id}-${startDate}@payetax.co.uk`,
        `DTSTAMP:${nowStamp}`,
        `DTSTART;VALUE=DATE:${startDate}`,
        `DTEND;VALUE=DATE:${formatICSDate(endDate)}`,
        `SUMMARY:${escapeICSText(`PayeTax: ${label}`)}`,
        `DESCRIPTION:${escapeICSText(description)}`,
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
    link.download = `payetax-key-dates-${companyDeadlines.periodEnd.getUTCFullYear()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    trackCalendarDownloaded();
  };

  return (
    <div className='rounded-sm border border-border/60 bg-card p-4'>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Calendar className='size-4' />
          <span className='text-sm font-medium'>Key Dates</span>
        </div>
        {companyDeadlines && (
          <button
            type='button'
            onClick={handleDownloadCalendar}
            className='inline-flex items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/20'
          >
            <Download className='size-3.5' />
            Download .ics
          </button>
        )}
      </div>
      <div className='space-y-3 text-xs'>
        <div>
          <h3 className='font-medium'>Company</h3>
          {companyDeadlines ? (
            <dl className='mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {companyDates.map(({ id, label, date }) => (
                <div key={id}>
                  <dt className='text-muted-foreground'>{label}</dt>
                  <dd className='font-mono'>{formatDate(date)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className='text-muted-foreground'>
              {periodEnd
                ? 'Correct the accounting period end to see company deadlines.'
                : 'Enter your accounting period end to see company deadlines.'}
            </p>
          )}
          <p className='mt-1 text-muted-foreground'>
            Instalment rules can change when payment is due. Long accounts or a late HMRC notice can
            mean a later filing deadline.{' '}
            <a className='underline' href='https://www.gov.uk/pay-corporation-tax'>
              HMRC Corporation Tax payment guidance
            </a>
          </p>
        </div>
        <div className='border-t border-border/60 pt-2'>
          <h3 className='font-medium'>{personalDate.label}</h3>
          <p className='font-mono'>{formatDate(personalDate.date)}</p>
          <p className='text-muted-foreground'>
            Usual online filing and payment date if due. Payments on account may also apply.
          </p>
        </div>
      </div>
    </div>
  );
}
