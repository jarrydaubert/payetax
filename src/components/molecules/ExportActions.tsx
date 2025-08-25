// src/components/molecules/ExportActions.tsx
/**
 * Export actions component for tax calculation results
 * DESIGN SYSTEM INTEGRATION:
 * - Follows glass morphism design patterns
 * - Uses ToolHubX button variants
 * - Consistent spacing and typography
 */

import { Download, Printer } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props interface for ExportActions component
 * Comprehensive typing for better developer experience
 */
interface ExportActionsProps {
  /** Callback function for print action */
  onPrint: () => void;

  /** Callback function for CSV download action */
  onDownload: () => void;

  /** Additional CSS classes for customization */
  className?: string;

  /** Whether actions are currently disabled */
  disabled?: boolean;

  /** Loading state for print operation */
  printLoading?: boolean;

  /** Loading state for download operation */
  downloadLoading?: boolean;

  /** Custom aria-label for the action group */
  'aria-label'?: string;
}

/**
 * Export actions component for tax calculation results
 *
 * Provides print and CSV export functionality with proper loading states
 * and accessibility features. Uses the standardized Button component
 * for consistency across the application.
 *
 * USAGE EXAMPLES:
 *
 * Basic usage:
 * <ExportActions onPrint={handlePrint} onDownload={handleDownload} />
 *
 * With loading states:
 * <ExportActions
 *   onPrint={handlePrint}
 *   onDownload={handleDownload}
 *   printLoading={isPrinting}
 *   downloadLoading={isDownloading}
 * />
 *
 * Disabled state:
 * <ExportActions
 *   onPrint={handlePrint}
 *   onDownload={handleDownload}
 *   disabled={!hasResults}
 * />
 *
 * @param props - ExportActions component props
 * @returns Accessible export actions component
 */
const ExportActions: React.FC<ExportActionsProps> = ({
  onPrint,
  onDownload,
  className,
  disabled = false,
  printLoading = false,
  downloadLoading = false,
  'aria-label': ariaLabel = 'Export calculation results',
}) => {
  // Local state for handling action feedback
  const [lastAction, setLastAction] = useState<'print' | 'download' | null>(null);

  /**
   * Enhanced print handler with error handling and user feedback
   */
  const handlePrint = async () => {
    if (disabled || printLoading) return;

    try {
      setLastAction('print');
      await onPrint();
    } catch (error) {
      console.error('Print failed:', error);
      // In a real app, you might show a toast notification here
    } finally {
      setLastAction(null);
    }
  };

  /**
   * Enhanced download handler with error handling and user feedback
   */
  const handleDownload = async () => {
    if (disabled || downloadLoading) return;

    try {
      setLastAction('download');
      await onDownload();
    } catch (error) {
      console.error('Download failed:', error);
      // In a real app, you might show a toast notification here
    } finally {
      setLastAction(null);
    }
  };

  return (
    <div
      className={cn('flex justify-center gap-2', className)}
      role='toolbar'
      aria-label={ariaLabel}
    >
      {/* Print Button - Icon Only */}
      <button
        type='button'
        onClick={handlePrint}
        disabled={disabled || printLoading}
        aria-label='Print tax calculation results'
        className={cn(
          'glass rounded-lg border border-white/20 p-2 transition-colors hover:bg-white/10',
          'disabled:cursor-not-allowed disabled:opacity-50',
          lastAction === 'print' && 'ring-2 ring-purple-500/50'
        )}
      >
        <Printer className='h-4 w-4 text-white/80' />
      </button>

      {/* CSV Download Button - Icon Only */}
      <button
        type='button'
        onClick={handleDownload}
        disabled={disabled || downloadLoading}
        aria-label='Download tax calculation results as CSV file'
        className={cn(
          'glass rounded-lg border border-white/20 p-2 transition-colors hover:bg-white/10',
          'disabled:cursor-not-allowed disabled:opacity-50',
          lastAction === 'download' && 'ring-2 ring-purple-500/50'
        )}
      >
        <Download className='h-4 w-4 text-white/80' />
      </button>
    </div>
  );
};

export default ExportActions;
