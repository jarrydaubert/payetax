import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

export type SelectTriggerProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>;

/**
 * Select trigger button
 */
const SelectTrigger = forwardRef<ElementRef<typeof SelectPrimitive.Trigger>, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        // Layout
        'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-sm px-3 py-2 shadow-none',
        // Border - neutral by default
        'border border-border',
        // Background
        'bg-background',
        // Typography
        TYPOGRAPHY.TEXT_SM,
        // Focus
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Placeholder styling
        'data-[placeholder]:text-muted-foreground',
        // Invalid state (for form validation)
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive',
        // Truncate long values
        '[&>span]:line-clamp-1',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className='size-4 opacity-50' aria-hidden='true' />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  ),
);
SelectTrigger.displayName = 'SelectTrigger';

export type SelectScrollUpButtonProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.ScrollUpButton
>;

/**
 * Scroll up button for long option lists
 */
const SelectScrollUpButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  SelectScrollUpButtonProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    aria-label='Scroll up'
    {...props}
  >
    <ChevronUp className='size-4' aria-hidden='true' />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = 'SelectScrollUpButton';

export type SelectScrollDownButtonProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.ScrollDownButton
>;

/**
 * Scroll down button for long option lists
 */
const SelectScrollDownButton = forwardRef<
  ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  SelectScrollDownButtonProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    aria-label='Scroll down'
    {...props}
  >
    <ChevronDown className='size-4' aria-hidden='true' />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = 'SelectScrollDownButton';

export type SelectContentProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;

/**
 * Select dropdown content container
 */
const SelectContent = forwardRef<ElementRef<typeof SelectPrimitive.Content>, SelectContentProps>(
  ({ className, children, position = 'popper', ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          // Base
          'relative z-50 overflow-hidden rounded-sm shadow-none',
          // Border - neutral
          'border border-border',
          // Background
          'bg-popover text-popover-foreground',
          // Size constraints - use Radix CSS vars for responsive sizing
          'max-h-[--radix-select-content-available-height] min-w-[8rem]',
          // Transform origin for animations
          'origin-[--radix-select-content-transform-origin]',
          // Animations
          'data-[state=closed]:animate-out data-[state=open]:animate-in',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
          // Popper position offsets
          position === 'popper' && [
            'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
            'data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1',
          ],
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            // Match trigger width in popper mode
            position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)]',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);
SelectContent.displayName = 'SelectContent';

export type SelectLabelProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Label>;

/**
 * Label for a group of select options
 */
const SelectLabel = forwardRef<ElementRef<typeof SelectPrimitive.Label>, SelectLabelProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Label
      ref={ref}
      className={cn('py-1.5 font-semibold', SPACING.PX_2, TYPOGRAPHY.TEXT_SM, className)}
      {...props}
    />
  ),
);
SelectLabel.displayName = 'SelectLabel';

export type SelectItemProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;

/**
 * Individual select option
 */
const SelectItem = forwardRef<ElementRef<typeof SelectPrimitive.Item>, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        // Layout
        'relative flex w-full cursor-default select-none items-center rounded-sm py-2 pr-8 pl-3 outline-none',
        // Typography
        TYPOGRAPHY.TEXT_SM,
        // Highlighted state (Radix uses data-highlighted for keyboard navigation)
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        // Checked state styling
        'data-[state=checked]:font-medium',
        // Disabled
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className='absolute right-2 flex size-6 items-center justify-center'>
        <SelectPrimitive.ItemIndicator>
          <Check className='size-4' aria-hidden='true' />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  ),
);
SelectItem.displayName = 'SelectItem';

export type SelectSeparatorProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>;

/**
 * Visual separator between option groups
 */
const SelectSeparator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  SelectSeparatorProps
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = 'SelectSeparator';

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
