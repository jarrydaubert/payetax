// src/app/tools/tax-code-decoder/TaxCodeDecoderClient.tsx
'use client';

import { AlertCircle, ArrowRight, CheckCircle, HelpCircle, Info, Search } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  CURRENT_TAX_YEAR_DISPLAY,
  decodeTaxCode,
  formatTaxCodeAmount,
  normalizeTaxCode,
  TAX_CODE_MAX_LENGTH,
  TAX_CODE_REFERENCE_ENTRIES,
  type TaxCodeDecoded,
} from '@/lib/tax-code-decoder';
import { cn } from '@/lib/utils';

const EXAMPLE_CODES = [
  '1257L',
  '1383M',
  '1131N',
  'K475',
  'SD0',
  'CD0',
  '0T',
  '1257L W1',
  '1257L NONCUM',
];

export function TaxCodeDecoderClient() {
  const inputId = useId();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<TaxCodeDecoded | null>(null);

  const handleDecode = (codeToUse?: string) => {
    const inputCode = codeToUse || code;
    // Normalize: trim, collapse whitespace, uppercase
    const normalized = normalizeTaxCode(inputCode, 'display');
    if (!normalized) return;
    setCode(normalized);
    setResult(decodeTaxCode(normalized));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDecode();
  };

  return (
    <div className={cn('mx-auto max-w-4xl', 'px-4', 'py-12')}>
      {/* Header */}
      <div className='mb-12 text-center'>
        <h1
          className={cn(
            'mb-4 font-display font-semibold text-foreground leading-tight',
            'text-4xl',
          )}
        >
          UK Tax Code Decoder
        </h1>
        <p className={cn('mx-auto max-w-2xl text-muted-foreground', 'text-lg')}>
          Enter a tax code to see what its numbers, letters and payroll basis mean for that
          employment or pension. Rate explanations use the current {CURRENT_TAX_YEAR_DISPLAY} tax
          year.
        </p>
      </div>

      {/* Decoder Input */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Search className={'size-5'} />
            Enter Your Tax Code
          </CardTitle>
          <CardDescription>
            You can find your tax code on your payslip, P45, P60, or HMRC letters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='flex gap-3'>
            <label htmlFor={inputId} className='sr-only'>
              Tax code
            </label>
            <Input
              id={inputId}
              type='text'
              placeholder='e.g., 1257L'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className='flex-1 font-mono text-lg uppercase'
              maxLength={TAX_CODE_MAX_LENGTH}
              autoComplete='off'
              autoCorrect='off'
              spellCheck={false}
            />
            <Button type='submit' size='lg' disabled={!code.trim()}>
              Decode
            </Button>
          </form>

          {/* Example Codes */}
          <div className='mt-4'>
            <p className={cn('mb-2 text-muted-foreground', 'text-sm')}>Try an example:</p>
            <div className='flex flex-wrap gap-2'>
              {EXAMPLE_CODES.map((exampleCode) => (
                <button
                  key={exampleCode}
                  type='button'
                  onClick={() => handleDecode(exampleCode)}
                  className={cn(
                    'rounded-full border border-border/50 px-3 py-1 font-mono text-sm transition-colors',
                    'hover:border-primary hover:bg-primary/5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  )}
                >
                  {exampleCode}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card
          className={cn(
            'mb-8',
            !result.isValid
              ? 'border-destructive/30'
              : result.requiresHmrcCheck
                ? 'border-warning/30'
                : 'border-success/30',
          )}
        >
          <CardHeader>
            <div className='flex flex-col items-start gap-4 sm:flex-row sm:justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  {result.isValid && !result.requiresHmrcCheck ? (
                    <CheckCircle className={cn('size-5', 'text-success')} />
                  ) : (
                    <AlertCircle
                      className={cn('size-5', result.isValid ? 'text-warning' : 'text-destructive')}
                    />
                  )}
                  <span className='font-mono text-2xl'>{result.code}</span>
                </CardTitle>
                <CardDescription className='mt-1 text-base'>{result.meaning}</CardDescription>
              </div>
              {result.amountLabel !== null && result.amount !== null && (
                <div className='text-left sm:text-right'>
                  <p className={cn('text-muted-foreground', 'text-sm')}>{result.amountLabel}</p>
                  <p className={cn('font-bold', 'text-2xl', 'text-foreground')}>
                    {formatTaxCodeAmount(result.amount)}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Region Badges */}
            {(result.isScottish ||
              result.isWelsh ||
              result.isEmergency ||
              result.requiresHmrcCheck) && (
              <div className='flex flex-wrap gap-2'>
                {result.isScottish && (
                  <span className='rounded-full bg-primary/15 px-3 py-1 font-medium text-primary text-sm'>
                    Scottish Tax Rates
                  </span>
                )}
                {result.isWelsh && (
                  <span className='rounded-full bg-destructive/15 px-3 py-1 font-medium text-destructive text-sm'>
                    Welsh Tax Rates
                  </span>
                )}
                {result.isEmergency && (
                  <span className='rounded-full bg-warning/15 px-3 py-1 font-medium text-foreground text-sm'>
                    Emergency Code
                  </span>
                )}
                {result.requiresHmrcCheck && (
                  <span className='rounded-full bg-warning/15 px-3 py-1 font-medium text-foreground text-sm'>
                    Check with HMRC
                  </span>
                )}
              </div>
            )}

            {/* Details */}
            {result.details.length > 0 && (
              <div className='space-y-2'>
                {result.details.map((detail) => (
                  <div
                    key={`detail-${detail}`}
                    className='flex items-start gap-2 text-muted-foreground'
                  >
                    <Info className={cn('size-4', 'mt-0.5 flex-shrink-0 text-primary')} />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className='space-y-2 rounded-lg border border-warning/30 bg-warning/10 p-4'>
                {result.warnings.map((warning) => (
                  <div
                    key={`warning-${warning}`}
                    className='flex items-start gap-2 text-foreground'
                  >
                    <AlertCircle className={cn('size-4', 'mt-0.5 flex-shrink-0 text-warning')} />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Check the code with HMRC</CardTitle>
          <CardDescription>
            This decoder explains the format. Only HMRC can confirm why a particular code was
            assigned to you.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 text-muted-foreground'>
          <p>
            Compare the code with your payslip, P45, P60 or HMRC coding notice. If it is unexpected,
            check the calculation and the employment or pension it applies to before changing any
            payroll assumptions.
          </p>
          <div className='flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6'>
            <Link
              href='https://www.gov.uk/guidance/check-what-your-tax-code-means'
              className='inline-flex min-h-11 items-center gap-2 rounded-md py-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            >
              Use HMRC&apos;s tax-code checker
              <ArrowRight className='size-4' />
            </Link>
            <Link
              href='https://www.gov.uk/tax-codes/how-to-update-your-tax-code'
              className='inline-flex min-h-11 items-center gap-2 rounded-md py-2 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            >
              What to do if the code looks wrong
              <ArrowRight className='size-4' />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Common Codes Reference */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HelpCircle className={'size-5'} />
            Common Tax Code Letters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            {TAX_CODE_REFERENCE_ENTRIES.map(({ code: letterCode, description }) => (
              <div
                key={letterCode}
                className='flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50'
              >
                <span className='rounded bg-primary/10 px-2 py-1 font-bold font-mono text-primary'>
                  {letterCode}
                </span>
                <span className='text-muted-foreground text-sm'>{description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calculator CTA */}
      <div className='mt-12 text-center'>
        <p className={cn('mb-4 text-muted-foreground', 'text-lg')}>
          Want an estimate? Open the calculator and enter the code yourself.
        </p>
        <Link href='/'>
          <Button size='lg' variant='outline'>
            Open Tax Calculator
            <ArrowRight className={cn('ml-2', 'size-4')} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
