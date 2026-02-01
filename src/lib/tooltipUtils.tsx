/**
 * Shared Tooltip Utilities
 *
 * DRY principle - extract formatTooltipText() from InputTooltip and LabelTooltip
 * to eliminate code duplication.
 *
 * @module lib/tooltipUtils
 */

import type * as React from 'react';
import type { TooltipContent } from '@/config/inputTooltips';

/**
 * Formats tooltip content into readable React elements
 *
 * Displays:
 * - Title (bold)
 * - Description (small text)
 * - Additional note (if available, with border separator)
 *
 * @param content - Tooltip content object from config
 * @returns Formatted React node for tooltip display
 */
export function formatTooltipText(content: TooltipContent): React.ReactNode {
  return (
    <div className='space-y-1'>
      <div className='font-semibold'>{content.title}</div>
      <div className='text-xs'>{content.description}</div>
      {content.note && (
        <div className='whitespace-pre-line border-primary-foreground/20 border-t pt-1 text-xs opacity-90'>
          {content.note}
        </div>
      )}
    </div>
  );
}
