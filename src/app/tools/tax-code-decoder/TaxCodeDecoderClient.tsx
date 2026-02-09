// src/app/tools/tax-code-decoder/TaxCodeDecoderClient.tsx
'use client';

import { AlertCircle, ArrowRight, CheckCircle, HelpCircle, Info, Search } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ICON_SIZES, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { decodeTaxCode, formatAllowance, type TaxCodeDecoded } from '@/lib/taxCodeDecoder';
import { cn } from '@/lib/utils';

const EXAMPLE_CODES = ['1257L', 'BR', 'S1257L', 'K100', '1000M', 'D0', '0T', '1257L W1'];

export function TaxCodeDecoderClient() {
  const inputId = useId();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<TaxCodeDecoded | null>(null);

  const handleDecode = (codeToUse?: string) => {
    const inputCode = codeToUse || code;
    // Normalize: trim, collapse whitespace, uppercase
    const normalized = inputCode.trim().replace(/\s+/g, ' ').toUpperCase();
    if (!normalized) return;
    setCode(normalized);
    setResult(decodeTaxCode(normalized));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDecode();
  };

  return (
    <div className={cn('mx-auto max-w-4xl', SPACING.PX_4, SPACING.PY_12)}>
      {/* Header */}
      <div className='mb-12 text-center'>
        <h1
          className={cn(
            'mb-4 bg-gradient-to-r from-brand-gradient-start via-brand-accent to-brand-gradient-end bg-clip-text font-bold text-transparent',
            TYPOGRAPHY.TEXT_4XL,
          )}
        >
          UK Tax Code Decoder
        </h1>
        <p className={cn('mx-auto max-w-2xl text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
          Enter your tax code to understand what it means, your personal allowance, and how it
          affects your take-home pay.
        </p>
      </div>

      {/* Decoder Input */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Search className={ICON_SIZES.SIZE_5} />
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
              maxLength={10}
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
            <p className={cn('mb-2 text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>Try an example:</p>
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
          className={cn('mb-8', result.isValid ? 'border-emerald/30' : 'border-destructive/30')}
        >
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  {result.isValid ? (
                    <CheckCircle className={cn(ICON_SIZES.SIZE_5, 'text-emerald')} />
                  ) : (
                    <AlertCircle className={cn(ICON_SIZES.SIZE_5, 'text-destructive')} />
                  )}
                  <span className='font-mono text-2xl'>{result.code}</span>
                </CardTitle>
                <CardDescription className='mt-1 text-base'>{result.meaning}</CardDescription>
              </div>
              {result.allowance !== null && (
                <div className='text-right'>
                  <p className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM)}>
                    Personal Allowance
                  </p>
                  <p
                    className={cn(
                      'font-bold',
                      TYPOGRAPHY.TEXT_2XL,
                      result.allowance < 0 ? 'text-destructive' : 'text-emerald',
                    )}
                  >
                    {formatAllowance(result.allowance)}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Region Badges */}
            {(result.isScottish || result.isWelsh || result.isEmergency) && (
              <div className='flex flex-wrap gap-2'>
                {result.isScottish && (
                  <span className='rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 text-sm dark:bg-blue-900/30 dark:text-blue-300'>
                    Scottish Tax Rates
                  </span>
                )}
                {result.isWelsh && (
                  <span className='rounded-full bg-red-100 px-3 py-1 font-medium text-red-800 text-sm dark:bg-red-900/30 dark:text-red-300'>
                    Welsh Tax Rates
                  </span>
                )}
                {result.isEmergency && (
                  <span className='rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800 text-sm dark:bg-amber-900/30 dark:text-amber-300'>
                    Emergency Code
                  </span>
                )}
              </div>
            )}

            {/* Details */}
            {result.details.length > 0 && (
              <div className='space-y-2'>
                {result.details.map((detail, index) => (
                  <div
                    key={`detail-${index}-${detail.slice(0, 20)}`}
                    className='flex items-start gap-2 text-muted-foreground'
                  >
                    <Info className={cn(ICON_SIZES.SIZE_4, 'mt-0.5 flex-shrink-0 text-primary')} />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className='space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20'>
                {result.warnings.map((warning, index) => (
                  <div
                    key={`warning-${index}-${warning.slice(0, 20)}`}
                    className='flex items-start gap-2 text-amber-800 dark:text-amber-200'
                  >
                    <AlertCircle className={cn(ICON_SIZES.SIZE_4, 'mt-0.5 flex-shrink-0')} />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA to Calculator */}
            {result.isValid && result.allowance !== null && result.allowance > 0 && (
              <div className='pt-4'>
                <Link
                  href={`/?taxCode=${encodeURIComponent(result.code)}`}
                  className='inline-flex items-center gap-2 text-primary hover:underline'
                >
                  Use this tax code in the calculator
                  <ArrowRight className={ICON_SIZES.SIZE_4} />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Common Codes Reference */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HelpCircle className={ICON_SIZES.SIZE_5} />
            Common Tax Code Letters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            {[
              { code: 'L', desc: 'Standard Personal Allowance (most common)' },
              { code: 'M', desc: 'Marriage Allowance - receiving 10% from partner' },
              { code: 'N', desc: 'Marriage Allowance - transferring 10% to partner' },
              { code: 'T', desc: 'Other calculations apply to your allowance' },
              { code: 'BR', desc: 'All income taxed at basic rate (20%)' },
              { code: 'D0', desc: 'All income taxed at higher rate (40%)' },
              { code: 'D1', desc: 'All income taxed at additional rate (45%)' },
              { code: 'K', desc: 'You have income that must be taxed, more than your allowance' },
              { code: 'S', desc: 'Scottish Income Tax rates apply' },
              { code: 'C', desc: 'Welsh Income Tax rates apply' },
              { code: 'W1/M1', desc: 'Emergency code - non-cumulative basis' },
              { code: '0T', desc: 'No Personal Allowance available' },
            ].map(({ code: letterCode, desc }) => (
              <div
                key={letterCode}
                className='flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50'
              >
                <span className='rounded bg-primary/10 px-2 py-1 font-bold font-mono text-primary'>
                  {letterCode}
                </span>
                <span className='text-muted-foreground text-sm'>{desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calculator CTA */}
      <div className='mt-12 text-center'>
        <p className={cn('mb-4 text-muted-foreground', TYPOGRAPHY.TEXT_LG)}>
          Know your tax code? Calculate your take-home pay.
        </p>
        <Link href='/'>
          <Button size='lg' variant='brandOutline'>
            Open Tax Calculator
            <ArrowRight className={cn('ml-2', ICON_SIZES.SIZE_4)} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
