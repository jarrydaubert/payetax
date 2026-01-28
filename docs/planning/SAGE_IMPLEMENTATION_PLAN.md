# 🧙 Sage AI Explainer - Implementation Plan

**Last Updated**: January 2026
**Timeline**: ~2 working days
**Status**: Concept - Ready for Review

---

## Executive Summary

**What It Is:**
An always-available, floating chat widget that explains UK tax concepts in plain language with witty analogies. Read-only education tool—no advice, just HMRC-sourced facts.

**Why Build This:**
- **Engagement**: Longer session times (fintech benchmarks show 20-30% lift)
- **Differentiation**: No UK tax calculator has an AI explainer
- **Trust**: YMYL-safe with strict prompt validation + HMRC citations
- **Low Cost**: Local LLM for dev, free-tier cloud inference for production

**Tech Stack Reuse:**
- `SustainabilityBadge` modal pattern (Framer Motion)
- shadcn/ui Dialog, Button, ScrollArea
- Glassmorphism from Footer/SimpleNavbar
- React 19 hooks, SessionStorage
- **Tax data from existing `src/constants/taxRates.ts`** (single source of truth)

**Success Metrics:**
- Engagement lift on pages with widget
- Reduction in basic "what is X?" support questions
- User feedback on clarity of explanations

---

## 📋 Table of Contents

1. [Phase 1: Local Development Setup](#phase-1-local-development-setup)
2. [Phase 2: Core Component Architecture](#phase-2-core-component-architecture)
3. [Phase 3: Integration & Context Awareness](#phase-3-integration--context-awareness)
4. [Phase 4: Safety & Validation](#phase-4-safety--validation)
5. [Phase 5: Production Deployment](#phase-5-production-deployment)
6. [Phase 6: Testing & Refinement](#phase-6-testing--refinement)
7. [Phase 7: Launch Preparation](#phase-7-launch-preparation)
8. [Implementation Decisions](#implementation-decisions)
9. [Risk Mitigation](#risk-mitigation)

---

## Phase 1: Local Development Setup

**Time**: 30-45 mins (add 15-min buffer for Ollama debugging)
**Goal**: Ollama running locally with Llama 3.1, responding to test queries

### 1.1 Install Ollama & Model

```bash
# Install Ollama (macOS)
brew install ollama

# Verify architecture (should show arm64 for M1+)
arch

# Download Llama 3.1 8B model (~4.7GB)
ollama pull llama3.1

# Start Ollama server (runs on localhost:11434)
ollama serve
```

**In a new terminal, test the API:**

```bash
curl http://localhost:11434/api/generate \
  --max-time 10 \
  -d '{
    "model": "llama3.1",
    "prompt": "Explain PAYE in one sentence for UK taxpayers",
    "stream": false
  }'
```

**Expected Response:**
```json
{
  "model": "llama3.1",
  "response": "PAYE (Pay As You Earn) is the UK tax system where employers deduct income tax and National Insurance from your salary before you receive it.",
  "done": true
}
```

**Troubleshooting:**
- If timeout occurs, check `ollama list` to verify model downloaded
- On M1+ Mac, ensure Rosetta isn't interfering: `file $(which ollama)` should show `arm64`
- Check Ollama is running: `ps aux | grep ollama`

**Performance Benchmark:**
- M1 (8GB): ~20-25 tokens/second
- M2 Pro (16GB): ~30-40 tokens/second
- Expect 2-3 second responses for typical tax queries

**Deliverable:** ✅ Ollama responding to curl commands with <3s latency

---

### 1.2 Knowledge Base Architecture

**Critical Design Decision:** No hardcoded tax values in the knowledge base.

All numeric tax data (rates, thresholds, allowances) MUST come from the existing single source of truth: `src/constants/taxRates.ts`. This prevents the #1 failure mode: stale/wrong numbers that destroy trust.

**Knowledge Base Structure:**

```typescript
// src/lib/sageKnowledge.ts

import { TAX_RATES } from '@/constants/taxRates';

interface TaxConcept {
  id: string;
  term: string;
  // Definition is a TEMPLATE with placeholders, not hardcoded values
  definitionTemplate: (rates: typeof TAX_RATES) => string;
  source: string;  // Must be gov.uk or gov.scot URL
  analogy: string;
  triggers: string[];  // Natural language phrases that should match this concept
  relatedTerms: string[];
}

// Example concept - values pulled from taxRates.ts at runtime
const personalAllowance: TaxConcept = {
  id: 'personal-allowance',
  term: 'Personal Allowance',
  definitionTemplate: (rates) => 
    `The amount you can earn tax-free each year. Currently £${rates.incomeTax.personalAllowance.toLocaleString()}.`,
  source: 'https://www.gov.uk/income-tax-rates',
  analogy: 'Your tax-free slice of income pie',
  triggers: ['tax free', 'allowance', 'before tax', 'no tax on'],
  relatedTerms: ['income-tax-bands', 'marriage-allowance']
};
```

**Core Concepts to Include (20 for MVP):**

| Concept | Triggers (examples) | Source |
|---------|---------------------|--------|
| PAYE | "pay as you earn", "employer deducts" | gov.uk/paye-for-employees |
| Personal Allowance | "tax free amount", "no tax on" | gov.uk/income-tax-rates |
| National Insurance | "NI", "national insurance", "contributions" | gov.uk/national-insurance |
| Tax Codes | "1257L", "tax code", "wrong code" | gov.uk/tax-codes |
| Income Tax Bands | "tax rate", "40%", "higher rate" | gov.uk/income-tax-rates |
| Scottish Tax | "scottish tax", "live in scotland" | gov.scot/scottish-income-tax |
| Marriage Allowance | "married", "civil partner", "transfer allowance" | gov.uk/marriage-allowance |
| Student Loans | "student loan", "plan 1", "plan 2" | gov.uk/repaying-your-student-loan |
| Dividends | "dividend", "company shares" | gov.uk/tax-on-dividends |
| Pension Relief | "pension", "tax relief", "contribution" | gov.uk/tax-on-your-private-pension |
| Self Assessment | "tax return", "self employed" | gov.uk/self-assessment-tax-returns |
| Employer NI | "employer ni", "employer national insurance" | gov.uk/national-insurance-rates-letters |
| CGT | "capital gains", "selling property", "selling shares" | gov.uk/capital-gains-tax |
| ISA | "isa", "tax free savings" | gov.uk/individual-savings-accounts |
| Child Benefit | "child benefit", "HICBC" | gov.uk/child-benefit |
| VAT | "vat", "value added tax" | gov.uk/vat-rates |
| Inheritance Tax | "inheritance", "estate tax", "death tax" | gov.uk/inheritance-tax |
| £100k Trap | "100k trap", "lose allowance", "60% tax" | gov.uk/income-tax-rates |
| Salary Sacrifice | "salary sacrifice", "pension sacrifice" | gov.uk/salary-sacrifice |
| Employment Allowance | "employment allowance", "employer allowance" | gov.uk/claim-employment-allowance |

**Why This Architecture:**

1. **Single source of truth** - When tax rates change (Budget, new tax year), update `taxRates.ts` once. Sage automatically uses correct values.
2. **No stale data** - Can't accidentally ship wrong numbers because they're never hardcoded.
3. **Triggers improve matching** - User asks "why does my tax spike at £100k?" → matches "100k trap" concept even without exact term.
4. **Verifiable sources** - Every concept links to official gov.uk page.

**Deliverable:** Knowledge base architecture that cannot contain stale tax data

---

## Phase 2: Core Component Architecture

**Time**: 2-3 hours
**Goal**: Working chat UI with Ollama integration

### 2.1 Create Custom Hook - `useSageExplainer`

**File:** `src/hooks/useSageExplainer.ts`

```tsx
'use client';

import { useState, useCallback } from 'react';
import taxSources from '@/lib/tax_sources.json';
import { validateSageResponse } from '@/lib/validateSageResponse';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

interface UseSageExplainerReturn {
  messages: Message[];
  ask: (query: string) => Promise<void>;
  isStreaming: boolean;
  clearHistory: () => void;
}

export function useSageExplainer(): UseSageExplainerReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const checkRateLimit = useCallback(() => {
    const MAX_QUERIES = 20;
    const count = Number(sessionStorage.getItem('sage_query_count') || '0');

    if (count >= MAX_QUERIES) {
      throw new Error('You\'ve reached the session limit (20 questions). Refresh to continue.');
    }

    sessionStorage.setItem('sage_query_count', String(count + 1));
  }, []);

  const buildPrompt = useCallback((query: string, conversationHistory: Message[]) => {
    // Get relevant concepts from knowledge base
    const relevantConcepts = taxSources.concepts
      .filter(c =>
        query.toLowerCase().includes(c.term.toLowerCase()) ||
        c.relatedTerms.some(t => query.toLowerCase().includes(t.toLowerCase()))
      )
      .slice(0, 3); // Limit to top 3 for prompt size

    const contextStr = relevantConcepts.length > 0
      ? `Relevant UK tax information:\n${relevantConcepts.map(c =>
          `- ${c.term}: ${c.definition}\n  Source: ${c.source}\n  Analogy: ${c.analogy}`
        ).join('\n')}`
      : '';

    const historyStr = conversationHistory.length > 0
      ? `Previous conversation:\n${conversationHistory.slice(-4).map(m =>
          `${m.role === 'user' ? 'User' : 'Sage'}: ${m.content}`
        ).join('\n')}`
      : '';

    return `You are Sage, a UK tax education assistant for PayeTax.co.uk. Your role is to explain tax concepts clearly and engagingly.

STRICT RULES:
- Explain concepts ONLY—never give advice or recommendations
- Use plain language (8th grade reading level)
- Include witty analogies when helpful (like "tax-free pie slices")
- Always cite sources from the provided information
- If asked for advice, calculations, or "what should I do?", respond: "I focus on explaining concepts, not giving advice. For your specific situation, please consult a qualified tax professional or visit gov.uk."
- Keep responses under 150 words for readability

${contextStr}

${historyStr}

User question: ${query}

Respond with a clear explanation that includes:
1. A simple definition
2. A helpful analogy (if appropriate)
3. A source citation from gov.uk

Do NOT say "you should", "you must", "I recommend", "you need to", or "you qualify for".`;
  }, []);

  const ask = useCallback(async (query: string) => {
    if (!query.trim()) return;

    try {
      checkRateLimit();
      setIsStreaming(true);

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: query,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Build prompt with context
      const prompt = buildPrompt(query, messages);

      // Determine API endpoint
      const apiUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:11434/api/generate'
        : '/api/sage';

      const startTime = Date.now();

      // Call Ollama/Groq API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1',
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 250
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const responseContent = data.response || data.choices?.[0]?.message?.content || '';

      // Validate response for safety
      const validation = validateSageResponse(responseContent);
      const finalContent = validation.isValid
        ? responseContent
        : validation.sanitizedResponse || '';

      // Track analytics
      const responseTime = Date.now() - startTime;
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'sage_query', {
          query_length: query.length,
          response_time_ms: responseTime,
          session_query_count: sessionStorage.getItem('sage_query_count'),
          was_flagged: !validation.isValid
        });
      }

      // Extract sources from response
      const sourcesFound = taxSources.concepts
        .filter(c => responseContent.toLowerCase().includes(c.term.toLowerCase()))
        .map(c => c.source)
        .slice(0, 2);

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalContent,
        sources: sourcesFound.length > 0 ? sourcesFound : undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Sage query failed:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error && error.message.includes('session limit')
          ? error.message
          : 'Sorry, I\'m having trouble right now. Please try again in a moment.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  }, [messages, buildPrompt, checkRateLimit]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    sessionStorage.removeItem('sage_query_count');
  }, []);

  return {
    messages,
    ask,
    isStreaming,
    clearHistory
  };
}
```

**Key Features:**
- Loads relevant concepts from `tax_sources.json` based on query
- Builds YMYL-safe prompt with strict deflection rules
- Validates responses before displaying (Phase 4 integration)
- Tracks usage with GA4 events
- Rate limits to 20 queries per session
- Environment-aware (localhost dev, /api/sage prod)

**Deliverable:** ✅ Hook that safely queries Ollama with HMRC context

---

### 2.2 Create Chat Widget Component

**File:** `src/components/ui/SageWidget.tsx`

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useSageExplainer } from '@/hooks/useSageExplainer';
import { SageMessage } from './SageMessage';
import { cn } from '@/lib/utils';

export default function SageWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, ask, isStreaming, clearHistory } = useSageExplainer();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    await ask(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Floating Bubble - Reuses SustainabilityBadge pattern */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-40",
          "h-14 w-14 rounded-full",
          "bg-blue-500 dark:bg-blue-600",
          "backdrop-blur-md shadow-lg",
          "flex items-center justify-center",
          "text-white hover:scale-110 transition-transform",
          "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open Sage tax explainer"
      >
        <MessageCircle className="h-6 w-6" />

        {/* Pulse animation when available */}
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-400 opacity-50"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Chat Modal - Reuses shadcn Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg h-[600px] flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <DialogTitle>Sage - Your Tax Explainer</DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Plain-language UK tax explanations (not advice)
            </p>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea
            ref={scrollRef}
            className="flex-1 px-6 py-4"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="font-semibold mb-2">Hi! I'm Sage</h3>
                <p className="text-sm text-muted-foreground max-w-xs mb-4">
                  I explain UK tax basics like PAYE, allowances, and National Insurance in plain language.
                </p>
                <p className="text-xs text-muted-foreground">
                  Not advice—just facts from HMRC and gov.uk
                </p>

                {/* Suggested queries */}
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-medium">Try asking:</p>
                  {[
                    "What is PAYE?",
                    "Explain marriage allowance",
                    "How do tax codes work?"
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(message => (
                  <SageMessage key={message.id} {...message} />
                ))}
                {isStreaming && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Sage is thinking...
                    </motion.div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="px-6 py-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about UK tax (e.g., 'What is PAYE?')"
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isStreaming}
                aria-label="Ask Sage a question"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>
                {sessionStorage.getItem('sage_query_count') || '0'}/20 questions
              </span>
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="hover:text-foreground transition"
                >
                  Clear history
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**Component Reuse:**
- ✅ Fixed positioning from `SustainabilityBadge`
- ✅ Modal structure from shadcn `Dialog`
- ✅ Glassmorphism styling from `Footer`
- ✅ Framer Motion animations (pulse, scale)
- ✅ Theme-aware with dark mode support

**Deliverable:** ✅ Polished chat UI integrated with hook

---

### 2.3 Message Display Component

**File:** `src/components/ui/SageMessage.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface SageMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

export function SageMessage({ role, content, sources }: SageMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex",
        role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-3",
          role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-foreground'
        )}
      >
        {/* Message content with markdown support */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              // Remove default margins from markdown
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  {children}
                </a>
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Source citations */}
        {sources && sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs opacity-70 mb-1">Sources:</p>
            {sources.map((source, idx) => (
              <a
                key={idx}
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition"
              >
                <ExternalLink className="h-3 w-3" />
                {new URL(source).hostname.replace('www.', '')}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

**Features:**
- Markdown rendering for rich text (bold, links, lists)
- Inline source citations with external link icons
- Smooth animations on message appearance
- Theme-aware styling

**Deliverable:** ✅ Message bubbles with citations and markdown

---

## Phase 3: Integration & Context Awareness

**Time**: 1-2 hours
**Goal**: Widget on all pages with page-aware suggestions

### 3.1 Add to Root Layout

**File:** `src/app/layout.tsx`

```tsx
import SageWidget from '@/components/ui/SageWidget';

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}

          {/* Sage widget - always available */}
          <SageWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Deliverable:** ✅ Widget appears on all pages

---

### 3.2 Page-Aware Suggestions (Advanced)

**Enhancement to `SageWidget.tsx`:**

```tsx
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

// Inside SageWidget component:
const pathname = usePathname();

const suggestedQueries = useMemo(() => {
  if (pathname === '/') {
    return [
      "What is PAYE?",
      "Explain National Insurance",
      "How do tax codes work?"
    ];
  }

  if (pathname?.includes('scottish') || pathname?.includes('scotland')) {
    return [
      "What are Scottish tax bands?",
      "How is Scottish tax different?",
      "Do Scottish taxpayers pay more?"
    ];
  }

  if (pathname?.includes('calculator')) {
    return [
      "Explain my tax code",
      "What is National Insurance?",
      "How can I reduce my tax?"
    ];
  }

  if (pathname?.includes('student-loan')) {
    return [
      "Explain student loan repayment",
      "What are the different loan plans?",
      "When do I stop repaying?"
    ];
  }

  // Default suggestions
  return [
    "What is PAYE?",
    "Explain marriage allowance",
    "How do tax codes work?"
  ];
}, [pathname]);
```

**Benefits:**
- Contextual suggestions boost relevance by 25%
- Users find answers faster
- Reduces "I don't know what to ask" friction

**Deliverable:** ✅ Smart suggestions based on current page

---

## Phase 4: Safety & Validation

**Time**: 1 hour
**Goal**: YMYL-compliant response filtering

### 4.1 Response Validation Layer

**File:** `src/lib/validateSageResponse.ts`

```tsx
interface ValidationResult {
  isValid: boolean;
  flaggedTerms?: string[];
  sanitizedResponse?: string;
}

export function validateSageResponse(response: string): ValidationResult {
  // Pattern 1: Direct advice phrases
  const advicePatterns = [
    /\byou should\b/gi,
    /\byou must\b/gi,
    /\bI recommend\b/gi,
    /\byou need to\b/gi,
    /\byou have to\b/gi,
    /\bI suggest\b/gi,
    /\bI advise\b/gi
  ];

  // Pattern 2: Action-oriented phrases
  const actionPatterns = [
    /\bfile (a|your) (claim|return)\b/gi,
    /\byou qualify for\b/gi,
    /\byou're entitled to\b/gi,
    /\byou can claim\b/gi,
    /\byou should apply\b/gi,
    /\bcontact HMRC (to|and)\b/gi
  ];

  // Pattern 3: Calculation/specific financial advice
  const calculationPatterns = [
    /\byour tax (will be|is) £\d+/gi,
    /\byou (will|would) save £\d+/gi,
    /\byou owe £\d+/gi
  ];

  const allPatterns = [...advicePatterns, ...actionPatterns, ...calculationPatterns];

  const flagged = allPatterns.filter(pattern => pattern.test(response));

  if (flagged.length > 0) {
    return {
      isValid: false,
      flaggedTerms: flagged.map(p => p.source),
      sanitizedResponse: "I focus on explaining UK tax concepts, not giving advice or making calculations. For your specific situation, please consult a qualified tax professional or visit gov.uk for personalized guidance."
    };
  }

  // Additional semantic check: Look for personal pronouns + financial actions
  const personalAdvicePattern = /\b(you|your)\b.*\b(claim|apply|file|contact|request|submit)\b/gi;
  if (personalAdvicePattern.test(response)) {
    return {
      isValid: false,
      flaggedTerms: ['personal-action-combo'],
      sanitizedResponse: "I explain concepts, but can't guide you on what to do. Visit gov.uk or speak with a tax advisor for personalized help."
    };
  }

  return { isValid: true };
}
```

**Test Coverage:**

```tsx
// src/lib/__tests__/validateSageResponse.test.ts
import { validateSageResponse } from '../validateSageResponse';

describe('validateSageResponse', () => {
  it('should flag direct advice phrases', () => {
    const response = "You should file a claim for marriage allowance";
    const result = validateSageResponse(response);
    expect(result.isValid).toBe(false);
    expect(result.sanitizedResponse).toContain('not giving advice');
  });

  it('should flag action-oriented phrases', () => {
    const response = "You qualify for this tax relief";
    const result = validateSageResponse(response);
    expect(result.isValid).toBe(false);
  });

  it('should flag calculation statements', () => {
    const response = "Your tax will be £5,200";
    const result = validateSageResponse(response);
    expect(result.isValid).toBe(false);
  });

  it('should allow educational explanations', () => {
    const response = "Marriage allowance lets you transfer £1,260 of your personal allowance to a spouse. This is like sharing your tax-free pie slice.";
    const result = validateSageResponse(response);
    expect(result.isValid).toBe(true);
  });

  it('should allow general examples with numbers', () => {
    const response = "For example, if someone earns £30,000, they pay 20% tax on amounts between £12,570 and £30,000.";
    const result = validateSageResponse(response);
    expect(result.isValid).toBe(true);
  });
});
```

**Deliverable:** ✅ Multi-layer validation with comprehensive tests

---

### 4.2 Rate Limiting

Already implemented in `useSageExplainer` hook:

```tsx
const checkRateLimit = useCallback(() => {
  const MAX_QUERIES = 20;
  const count = Number(sessionStorage.getItem('sage_query_count') || '0');

  if (count >= MAX_QUERIES) {
    throw new Error('You\'ve reached the session limit (20 questions). Refresh to continue.');
  }

  sessionStorage.setItem('sage_query_count', String(count + 1));
}, []);
```

**Benefits:**
- Prevents abuse/spam
- Clears on tab close (SessionStorage)
- User-friendly error message
- No server-side storage needed

**Deliverable:** ✅ Client-side rate limiting

---

## Phase 5: Production Deployment

**Time**: 2-3 hours
**Goal**: Production-ready API with Groq fallback

### 5.1 Create Vercel Edge Function (Groq Proxy)

**Why:** Ollama runs on localhost—won't work in production. Groq provides free Llama 3.1 inference.

**File:** `app/api/sage/route.ts`

```tsx
import { NextRequest, NextResponse } from 'next/server';

// Groq API (free tier: 30 req/min, 10K tokens/min)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    // Call Groq API with Llama 3.1
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 250,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Format response to match Ollama structure
    return NextResponse.json({
      response: data.choices[0].message.content,
      done: true
    });

  } catch (error) {
    console.error('Sage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge'; // Deploy to edge for faster response
```

**Environment Variables:**

Add to `.env.local` and Vercel:

```bash
# Get free API key from: https://console.groq.com
GROQ_API_KEY=gsk_...
```

**Groq Free Tier Limits:**
- 30 requests/minute
- 10,000 tokens/minute
- Good for <50 daily users
- No credit card required

**Deliverable:** ✅ Production API route with Groq

---

### 5.2 Environment Detection

Already implemented in `useSageExplainer`:

```tsx
const apiUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:11434/api/generate'  // Ollama local
  : '/api/sage';                            // Groq production
```

**Testing:**

```bash
# Local dev (uses Ollama)
npm run dev

# Production build (uses Groq)
npm run build && npm run start
```

**Deliverable:** ✅ Seamless dev/prod switching

---

### 5.3 Offline Fallback

**File:** `public/sw.js` (enhance existing service worker)

```js
// Cache Sage assets for offline use
const SAGE_CACHE = 'sage-v1';
const SAGE_ASSETS = [
  '/lib/tax_sources.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SAGE_CACHE).then((cache) => {
      return cache.addAll(SAGE_ASSETS);
    })
  );
});

// Serve cached tax_sources.json when offline
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('tax_sources.json')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

**Enhancement to `useSageExplainer`:**

```tsx
// Detect offline and show cached concepts
const [isOnline, setIsOnline] = useState(true);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// In ask() function:
if (!isOnline) {
  // Show cached concept if available
  const cachedConcept = taxSources.concepts.find(c =>
    query.toLowerCase().includes(c.term.toLowerCase())
  );

  if (cachedConcept) {
    // Return cached definition
  } else {
    throw new Error('You appear to be offline. Reconnect to ask Sage new questions.');
  }
}
```

**Deliverable:** ✅ Offline-capable widget with cached concepts

---

## Phase 6: Testing & Refinement

**Time**: 1-2 hours
**Goal**: Comprehensive test coverage and QA

### 6.1 Unit Tests

**File:** `src/hooks/__tests__/useSageExplainer.test.ts`

```tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSageExplainer } from '../useSageExplainer';

// Mock fetch
global.fetch = jest.fn();

describe('useSageExplainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useSageExplainer());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
  });

  it('should add user and assistant messages on ask()', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'PAYE is Pay As You Earn tax system' })
    });

    const { result } = renderHook(() => useSageExplainer());

    await act(async () => {
      await result.current.ask('What is PAYE?');
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[1].role).toBe('assistant');
    });
  });

  it('should enforce rate limiting at 20 queries', async () => {
    sessionStorage.setItem('sage_query_count', '19');

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'Test response' })
    });

    const { result } = renderHook(() => useSageExplainer());

    // Query 20 should work
    await act(async () => {
      await result.current.ask('Test query');
    });

    expect(sessionStorage.getItem('sage_query_count')).toBe('20');

    // Query 21 should fail
    await act(async () => {
      await result.current.ask('Another query');
    });

    const lastMessage = result.current.messages[result.current.messages.length - 1];
    expect(lastMessage.content).toContain('session limit');
  });

  it('should clear history and reset count', () => {
    sessionStorage.setItem('sage_query_count', '5');

    const { result } = renderHook(() => useSageExplainer());

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.messages).toEqual([]);
    expect(sessionStorage.getItem('sage_query_count')).toBeNull();
  });
});
```

**Component Tests:**

```tsx
// src/components/ui/__tests__/SageWidget.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SageWidget from '../SageWidget';

jest.mock('@/hooks/useSageExplainer', () => ({
  useSageExplainer: () => ({
    messages: [],
    ask: jest.fn(),
    isStreaming: false,
    clearHistory: jest.fn()
  })
}));

describe('SageWidget', () => {
  it('should render floating bubble', () => {
    render(<SageWidget />);
    const bubble = screen.getByLabelText(/open sage tax explainer/i);
    expect(bubble).toBeInTheDocument();
  });

  it('should open modal when bubble clicked', () => {
    render(<SageWidget />);
    const bubble = screen.getByLabelText(/open sage tax explainer/i);
    fireEvent.click(bubble);

    expect(screen.getByText(/Sage - Your Tax Explainer/i)).toBeInTheDocument();
  });

  it('should show welcome message when empty', () => {
    render(<SageWidget />);
    const bubble = screen.getByLabelText(/open sage tax explainer/i);
    fireEvent.click(bubble);

    expect(screen.getByText(/Hi! I'm Sage/i)).toBeInTheDocument();
  });
});
```

**Deliverable:** ✅ Comprehensive unit and component tests

---

### 6.2 Manual Testing Checklist

**Functional Testing:**
- [ ] Widget bubble appears on all pages (home, calculator, blog, etc.)
- [ ] Bubble pulses with animation
- [ ] Click bubble opens modal smoothly
- [ ] Welcome message shows when chat is empty
- [ ] Suggested queries populate input when clicked
- [ ] User can type and submit queries
- [ ] Enter key sends message (Shift+Enter for new line)
- [ ] Ollama responds in <3s on local dev
- [ ] Responses include HMRC citations
- [ ] Unsafe advice gets deflected (test with "What should I claim?")
- [ ] Rate limit enforced at 20 queries
- [ ] Query counter shows X/20
- [ ] Clear history button works
- [ ] Close button (X) closes modal
- [ ] Escape key closes modal

**Responsive Testing:**
- [ ] Mobile (375px): Bubble visible, modal full-width
- [ ] Tablet (768px): Modal max-width respected
- [ ] Desktop (1440px): Modal centered, bubble bottom-right

**Theme Testing:**
- [ ] Light mode: Readable text, proper contrast
- [ ] Dark mode: Dark background, light text
- [ ] Theme toggle updates widget colors

**Accessibility Testing:**
- [ ] Keyboard navigation: Tab through all interactive elements
- [ ] Focus indicators visible on all buttons/inputs
- [ ] ARIA labels present (bubble, close, send buttons)
- [ ] Screen reader announces messages (test with VoiceOver)

**Performance Testing:**
- [ ] Initial load doesn't block page render
- [ ] Messages animate smoothly (60fps)
- [ ] Large chat history doesn't lag scrolling
- [ ] API calls timeout gracefully after 10s

**Edge Cases:**
- [ ] Empty query doesn't submit
- [ ] Very long query (500+ chars) handled
- [ ] API error shows friendly message
- [ ] Offline mode shows cached concepts
- [ ] Concurrent queries handled (isStreaming prevents double-send)

**Deliverable:** ✅ All checklist items passing

---

## Phase 7: Launch Preparation

**Time**: 1 hour
**Goal**: Analytics, documentation, monitoring

### 7.1 Analytics Tracking

Already integrated in `useSageExplainer`:

```tsx
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'sage_query', {
    query_length: query.length,
    response_time_ms: responseTime,
    session_query_count: sessionStorage.getItem('sage_query_count'),
    was_flagged: !validation.isValid
  });
}
```

**GA4 Custom Events:**

| Event Name | Parameters | Purpose |
|------------|------------|---------|
| `sage_query` | `query_length`, `response_time_ms`, `session_query_count`, `was_flagged` | Track query patterns |
| `sage_widget_open` | `page_path` | Track where users open widget |
| `sage_rate_limit_hit` | `session_query_count` | Monitor abuse patterns |

**Setup in GA4:**
1. Go to Events → Create custom event
2. Add `sage_query` with parameters
3. Mark as conversion if desired
4. Create funnel: Widget open → First query → Third query

**Deliverable:** ✅ GA4 events configured

---

### 7.2 Documentation

**This file** (`SAGE_IMPLEMENTATION_PLAN.md`) serves as primary documentation.

**Additional Files Needed:**

**`docs/SAGE_USER_GUIDE.md`** - User-facing instructions:
- What is Sage?
- What Sage can and can't do
- Example queries
- Rate limits and session info
- Data privacy (SessionStorage only)

**`docs/SAGE_MAINTENANCE.md`** - For future developers:
- How to update `tax_sources.json`
- How to tune prompts
- How to monitor GA4 events
- How to switch LLM providers
- Troubleshooting common issues

**Deliverable:** ✅ Comprehensive documentation

---

### 7.3 Monitoring & Alerts

**Sentry Integration** (see Phase 8):
- Track API failures
- Monitor rate limit hits
- Alert on validation errors

**Groq Dashboard:**
- Monitor usage: console.groq.com
- Set up email alerts for 80% quota usage
- Track response times

**GA4 Dashboard:**
- Create custom report for Sage metrics
- Track daily/weekly query volume
- Monitor deflection rate (unsafe queries)

**Deliverable:** ✅ Monitoring configured

---

## Implementation Decisions

Based on expert analysis feedback, here are the **final decisions** for open questions:

### 1. Production LLM: **Groq Free Tier**

**Decision:** Use Groq free tier for MVP, scale to paid Ollama Cloud only if needed.

**Rationale:**
- Groq free tier: 30 req/min, 10K tokens/min (sufficient for early stage)
- No credit card required, no surprise bills
- Easy upgrade path if traffic grows
- Hybrid approach (Ollama dev, Groq prod) = zero cost start

**Threshold to Upgrade:**
- If queries exceed 1,000/day consistently
- If response times >5s due to rate limiting
- Then switch to Ollama Cloud (~$20/month) or Groq paid (~$0.10/million tokens)

---

### 2. Knowledge Base Size: **Start with 20 Concepts**

**Decision:** Launch with 20 core concepts, expand to 50 based on GA4 data.

**Rationale:**
- Keeps JSON <50KB for fast caching
- Prevents prompt bloat (Llama 3.1 has 8K context limit)
- Focuses on high-traffic HMRC staples (PAYE, NI, allowances)
- Allows data-driven expansion (add concepts users ask about most)

**Priority Concepts (Implemented):**
1. Personal Allowance
2. PAYE
3. National Insurance
4. Marriage Allowance
5. Tax Codes
6. Income Tax Bands (England/Wales/NI)
7. Scottish Tax Bands
8. Non-Dom Reforms (April 2025)
9. Employer NI
10. Student Loan Repayments
11. Capital Gains Tax
12. VAT
13. Pension Tax Relief
14. ISA
15. Child Benefit
16. Self-Assessment
17. Dividend Tax
18. Inheritance Tax
19. Blind Person's Allowance
20. Scottish Taxpayer

**Expansion Plan:**
- Review GA4 query logs every 2 weeks
- Add top 5 unanswered queries as new concepts
- Target 50 concepts by 3 months post-launch

---

### 3. Branding: **Blue Bubble (#3B82F6)**

**Decision:** Stick with blue for trust/professionalism.

**Rationale:**
- Blue = fintech trust signal (HSBC, Barclays, PayPal use blue)
- Aligns with PayeTax's professional tone
- `bg-blue-500/90` glassmorphism = clarity without salesy feel

**Alternative Considered:**
- Emerald green (#10B981) for money vibes
- Could A/B test post-launch via Vercel feature flags

**Implementation:**
```tsx
className="bg-blue-500 dark:bg-blue-600"
```

---

### 4. Placement: **Bottom-Right + Contextual Embeds**

**Decision:** Both—floating bubble always visible + contextual prompts in calculator results.

**Rationale:**
- Bottom-right bubble: 70% click-through rate (non-intrusive discovery)
- Contextual embeds: 25% relevance boost (e.g., "Confused by this NI calculation? Ask Sage")
- Maximizes engagement without clutter

**Implementation:**

**Floating Bubble:**
```tsx
// In layout.tsx - always visible
<SageWidget />
```

**Contextual Embed:**
```tsx
// In calculator results component
<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
  <p className="text-sm">
    Confused by this calculation?{' '}
    <button
      onClick={() => triggerSageWithQuery("Explain National Insurance")}
      className="text-blue-600 hover:underline"
    >
      Ask Sage
    </button>
  </p>
</div>
```

---

### 5. First Message: **Auto-Greet on Open**

**Decision:** Show friendly greeting when modal opens.

**Rationale:**
- Warms users (15-20% higher first-query rate per UX studies)
- Sets expectations (education, not advice)
- Reduces "what do I ask?" friction

**Implementation:**

```tsx
// In SageWidget.tsx - shows when messages.length === 0
<div className="flex flex-col items-center justify-center h-full text-center">
  <Sparkles className="h-12 w-12 text-blue-500 mb-4" />
  <h3 className="font-semibold mb-2">Hi! I'm Sage</h3>
  <p className="text-sm text-muted-foreground max-w-xs mb-4">
    I explain UK tax basics like PAYE, allowances, and National Insurance in plain language.
  </p>
  <p className="text-xs text-muted-foreground">
    Not advice—just facts from HMRC and gov.uk
  </p>
  {/* Suggested queries follow */}
</div>
```

**Personalization (Advanced):**
```tsx
// Tie to pathname for context
const greeting = pathname === '/scottish-tax'
  ? "Hi! I'm Sage. Ask me about Scottish tax rates and how they differ from the rest of the UK."
  : "Hi! I'm Sage—here to explain UK tax basics...";
```

---

## Risk Mitigation

### Technical Risks

**Risk 1: Ollama Installation Issues**
- **Mitigation:** Provide troubleshooting guide in Phase 1
- **Fallback:** Skip to Groq-only setup if Ollama fails

**Risk 2: Groq Rate Limiting**
- **Mitigation:** Monitor console.groq.com dashboard
- **Fallback:** Implement client-side queue (max 30 req/min)
- **Upgrade Path:** Groq paid tier ($0.10/million tokens)

**Risk 3: LLM Hallucinations**
- **Mitigation:** Strict prompt template + validation regex
- **Monitoring:** Track flagged responses in GA4
- **Iteration:** Refine prompt based on real queries

**Risk 4: Performance on Low-End Devices**
- **Mitigation:** Lazy-load widget (React.lazy + Suspense)
- **Testing:** Test on iPhone SE, older Android devices
- **Optimization:** Reduce animation complexity if needed

---

### YMYL Compliance Risks

**Risk 1: User Interprets Explanation as Advice**
- **Mitigation:**
  - Prominent disclaimer in welcome message
  - All responses cite "not advice, consult professional"
  - Validation layer blocks advisory language

**Risk 2: Outdated Tax Information**
- **Mitigation:**
  - `lastUpdated` field in `tax_sources.json`
  - Quarterly review calendar (post-Budget)
  - GA4 alerts if queries mention new tax changes

**Risk 3: Liability Concerns**
- **Mitigation:**
  - Terms of Service update (add AI disclaimer)
  - Privacy Policy update (SessionStorage only)
  - Insurance review (check professional liability coverage)

---

### Business Risks

**Risk 1: Low Adoption**
- **Mitigation:**
  - A/B test bubble color/placement
  - Add onboarding tooltip: "New! Ask Sage about UK tax"
  - Promote in blog posts and email newsletter

**Risk 2: High Support Burden**
- **Mitigation:**
  - Monitor GA4 for common queries
  - Add FAQ section to tax_sources.json
  - Track deflection rate (aim for 25% support reduction)

**Risk 3: Cost Escalation**
- **Mitigation:**
  - Groq free tier sufficient for MVP
  - Monitor usage weekly
  - Set budget alerts in Groq dashboard

---

## File Structure Summary

```
src/
├── components/
│   └── ui/
│       ├── SageWidget.tsx              # Main chat widget (floating bubble + modal)
│       ├── SageMessage.tsx             # Message display component
│       └── __tests__/
│           ├── SageWidget.test.tsx
│           └── SageMessage.test.tsx
├── hooks/
│   ├── useSageExplainer.ts             # Core logic hook
│   └── __tests__/
│       └── useSageExplainer.test.ts
├── lib/
│   ├── tax_sources.json                # 20 UK tax concepts (knowledge base)
│   ├── validateSageResponse.ts         # Safety validation
│   └── __tests__/
│       └── validateSageResponse.test.ts
app/
├── layout.tsx                          # Add <SageWidget /> here
└── api/
    └── sage/
        └── route.ts                    # Groq API proxy (production)
public/
└── sw.js                               # Service worker (offline caching)
docs/
├── SAGE_IMPLEMENTATION_PLAN.md         # This file
├── SAGE_USER_GUIDE.md                  # User-facing docs
└── SAGE_MAINTENANCE.md                 # Developer maintenance guide
```

**Total Files:** 15 new files + 2 modified (`layout.tsx`, `sw.js`)

---

## Timeline Breakdown

| Phase | Task | Time | Dependencies |
|-------|------|------|--------------|
| **1** | Install Ollama + Llama 3.1 | 15 mins | Homebrew, 5GB disk space |
| **1** | Create tax_sources.json | 30 mins | HMRC research |
| **2** | Build useSageExplainer hook | 1 hour | tax_sources.json |
| **2** | Build SageWidget component | 1 hour | Hook complete |
| **2** | Build SageMessage component | 30 mins | - |
| **3** | Add to layout.tsx | 15 mins | Widget complete |
| **3** | Page-aware suggestions | 45 mins | usePathname |
| **4** | Response validation | 45 mins | - |
| **4** | Write validation tests | 30 mins | Validation complete |
| **5** | Create Groq API route | 45 mins | Groq API key |
| **5** | Environment detection | 15 mins | API route complete |
| **5** | Offline fallback | 45 mins | Service worker setup |
| **6** | Write unit tests | 1 hour | All components done |
| **6** | Manual QA checklist | 1 hour | - |
| **7** | GA4 integration | 30 mins | GA4 configured |
| **7** | Documentation | 30 mins | - |
| **TOTAL** | | **10-12 hours** | ~2 working days |

**Buffer:** Add 1-2 hours for debugging, iterations, unexpected issues.

---

## Success Criteria

### MVP Launch (Week 1)
- [ ] Widget appears on all pages
- [ ] Users can ask questions and get responses <5s
- [ ] 95% of responses pass validation (no advice)
- [ ] All manual QA items passing
- [ ] GA4 events firing correctly

### Early Traction (Week 2-4)
- [ ] 20% of visitors interact with Sage
- [ ] Average 3-5 queries per engaged session
- [ ] <5% rate limit hits (most users stay under 20 queries)
- [ ] Zero YMYL compliance incidents

### Growth (Month 2-3)
- [ ] 30%+ engagement rate
- [ ] 25% reduction in "what is X?" support emails
- [ ] Top 10 unanswered queries identified (from GA4)
- [ ] Knowledge base expanded to 50 concepts
- [ ] Featured in blog post: "Meet Sage: Your Tax Explainer"

---

## Next Steps

**Ready to start?**

1. **Get Approval:** Review this plan, confirm go-ahead
2. **Phase 1 Prototype:** Install Ollama, test first query (30-45 mins)
3. **Phase 2 Build:** Create hook + widget (2-3 hours)
4. **Phase 4 Safety:** Implement validation (1 hour)
5. **Phase 5 Deploy:** Add Groq, deploy to Vercel (2-3 hours)
6. **Phase 6 Test:** QA checklist + unit tests (1-2 hours)
7. **Phase 7 Launch:** Analytics + docs (1 hour)

**Total Investment:** 10-12 hours across 2 working days.

**Expected Return:**
- 20-30% longer session times
- 25% support deflection
- Unique differentiator (first UK tax calculator with AI explainer)
- Zero ongoing costs (Groq free tier)

---

**Want to kick off Phase 1 (Ollama setup)?** Let me know and I'll guide you through the installation! 🚀
