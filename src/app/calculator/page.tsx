// src/app/calculator/page.tsx
/**
 * Calculator route redirect
 * 
 * /calculator redirects to homepage where the main calculator lives.
 * Dynamic salary routes like /calculator/30000 are handled by [salary]/page.tsx
 */

import { redirect } from 'next/navigation';

export default function CalculatorPage() {
  // Redirect to homepage which has the calculator
  redirect('/');
}
