// src/components/ui/kbd.tsx

/**
 * Keyboard shortcut display component
 *
 * USAGE PLAN: Reserved for PAYTAX-43 - Table of Contents Component for Blog
 * https://linear.app/payetax/issue/PAYTAX-43/table-of-contents-component-for-blog
 *
 * When implementing the blog TOC feature, this component will be used to display
 * keyboard shortcuts for navigation, such as:
 * - ⌘K or Ctrl+K to open TOC
 * - Arrow keys to navigate sections
 * - Enter to jump to section
 * - Esc to close TOC
 *
 * Example usage in TOC:
 * ```tsx
 * <Kbd>⌘</Kbd>
 * <Kbd>K</Kbd>
 * // or grouped:
 * <KbdGroup>
 *   <Kbd>⌘</Kbd>
 *   <Kbd>K</Kbd>
 * </KbdGroup>
 * ```
 *
 * May also be useful for:
 * - PAYTAX-41: Add Keyboard Shortcuts Documentation
 * - Calculator keyboard shortcuts (Tab navigation tips)
 * - Help modal with keyboard commands
 */

import { TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot='kbd'
      className={cn(
        'pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm bg-muted px-1 font-medium font-sans text-muted-foreground',
        TYPOGRAPHY.TEXT_XS,
        "[&_svg:not([class*='size-'])]:size-3",
        '[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10',
        className
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <kbd
      data-slot='kbd-group'
      className={cn('inline-flex items-center', 'gap-1', className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
