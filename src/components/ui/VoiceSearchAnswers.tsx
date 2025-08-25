// src/components/ui/VoiceSearchAnswers.tsx
/**
 * Voice search optimized answers for AI assistants and smart speakers
 * Designed for conversational queries like "Hey Google, how much tax do I pay on 30k?"
 */

import type React from 'react';

interface VoiceQuery {
  query: string;
  answer: string;
  alternativeQueries?: string[];
}

// Voice search optimized for conversational AI
export const VOICE_SEARCH_ANSWERS: VoiceQuery[] = [
  {
    query: 'How much tax do I pay on 30000 pounds UK',
    answer:
      'On a thirty thousand pound salary in the UK, you would pay five thousand five hundred seventy eight pounds total in tax. This includes three thousand four hundred eighty six pounds in income tax and two thousand ninety two pounds in National Insurance contributions.',
    alternativeQueries: [
      'How much tax on thirty thousand UK',
      'Tax on 30k salary UK',
      'What tax do I pay earning thirty thousand',
    ],
  },
  {
    query: 'What is the UK personal allowance 2025',
    answer:
      'The UK personal allowance for the twenty twenty five to twenty twenty six tax year is twelve thousand five hundred seventy pounds. This means you can earn up to this amount without paying any income tax.',
    alternativeQueries: [
      'UK personal allowance amount',
      'How much can I earn tax free UK',
      'Personal tax allowance 2025',
    ],
  },
  {
    query: 'How much National Insurance do I pay UK',
    answer:
      'You pay National Insurance at twelve percent on earnings between twelve thousand five hundred seventy and fifty thousand two hundred seventy pounds annually, then two percent on earnings above that. You pay nothing on the first twelve thousand five hundred seventy pounds.',
    alternativeQueries: [
      'National Insurance rates UK',
      'How much NI do I pay',
      'National Insurance percentage UK',
    ],
  },
  {
    query: 'What are Scottish tax rates compared to England',
    answer:
      'Scottish taxpayers pay the same as English taxpayers up to twenty six thousand five hundred sixty two pounds. Above this amount, Scottish rates are higher. At forty five thousand pounds, a Scottish taxpayer pays about five hundred pounds more per year than someone in England.',
    alternativeQueries: [
      'Scotland vs England tax rates',
      'Do Scottish people pay more tax',
      'Scottish tax rates higher than England',
    ],
  },
  {
    query: 'How much can I put in my pension tax free 2025',
    answer:
      'For twenty twenty five to twenty twenty six, you can contribute up to sixty thousand pounds to your pension and receive tax relief. This is an increase from forty thousand pounds in previous years.',
    alternativeQueries: [
      'Pension contribution limit 2025',
      'Maximum pension contribution UK',
      'How much pension can I pay in',
    ],
  },
  {
    query: 'When do I start paying student loan repayments',
    answer:
      'Student loan repayments start automatically when your income exceeds the threshold for your plan. Plan Two graduates start paying at twenty seven thousand two hundred ninety five pounds, Plan One at twenty two thousand fifteen pounds.',
    alternativeQueries: [
      'Student loan repayment threshold',
      'When do student loans get deducted',
      'Student loan payment starts when',
    ],
  },
];

/**
 * Voice Search Schema component - invisible but optimized for AI crawling
 * Provides structured data specifically for voice assistants
 */
export function VoiceSearchSchema(): React.ReactNode {
  return (
    <script
      type='application/ld+json'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Schema markup requires JSON-LD injection
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'QAPage',
          mainEntity: VOICE_SEARCH_ANSWERS.flatMap((voice) => [
            {
              '@type': 'Question',
              name: voice.query,
              acceptedAnswer: {
                '@type': 'Answer',
                text: voice.answer,
                speakable: {
                  '@type': 'SpeakableSpecification',
                  cssSelector: '.voice-answer',
                  xpath: '//div[@class="voice-answer"]',
                },
              },
            },
            ...(voice.alternativeQueries?.map((altQuery) => ({
              '@type': 'Question',
              name: altQuery,
              acceptedAnswer: {
                '@type': 'Answer',
                text: voice.answer,
              },
            })) || []),
          ]),
        }),
      }}
    />
  );
}

/**
 * Invisible voice search answers component
 * Optimized for AI crawlers and voice assistants
 */
export function VoiceSearchAnswers(): React.ReactNode {
  return (
    <section className='sr-only' aria-hidden='true'>
      <h2>Voice Search Optimized Answers</h2>
      {VOICE_SEARCH_ANSWERS.map((voice) => (
        <div key={voice.query} className='voice-answer'>
          <h3>{voice.query}</h3>
          <p>{voice.answer}</p>
          {voice.alternativeQueries && (
            <div>
              <h4>Alternative queries:</h4>
              <ul>
                {voice.alternativeQueries.map((alt) => (
                  <li key={alt}>{alt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      <VoiceSearchSchema />
    </section>
  );
}

export default VoiceSearchAnswers;
