import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type * as React from 'react';
import { SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  ref?: React.Ref<React.ElementRef<typeof SelectPrimitive.Trigger>>;
}

function SelectTrigger({ ref, className, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        // Standardized to border-primary/20 to match Card and Input components
        'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-primary/20 bg-secondary/80 px-3 py-2 shadow-sm ring-offset-background backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1',
        TYPOGRAPHY.TEXT_SM,
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className='size-4 opacity-50' />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export interface SelectScrollUpButtonProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> {
  ref?: React.Ref<React.ElementRef<typeof SelectPrimitive.ScrollUpButton>>;
}

function SelectScrollUpButton({ ref, className, ...props }: SelectScrollUpButtonProps) {
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn('flex cursor-default items-center justify-center', 'py-1', className)}
      {...props}
    >
      <ChevronUp className='size-4' />
    </SelectPrimitive.ScrollUpButton>
  );
}
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

export interface SelectScrollDownButtonProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> {
  ref?: React.Ref<React.ElementRef<typeof SelectPrimitive.ScrollDownButton>>;
}

function SelectScrollDownButton({ ref, className, ...props }: SelectScrollDownButtonProps) {
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn('flex cursor-default items-center justify-center', 'py-1', className)}
      {...props}
    >
      <ChevronDown className='size-4' />
    </SelectPrimitive.ScrollDownButton>
  );
}
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

export interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  ref?: React.Ref<React.ElementRef<typeof SelectPrimitive.Content>>;
}

function SelectContent({
  ref,
  className,
  children,
  position = 'popper',
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          // Standardized to border-primary/20 to match trigger and other form inputs
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] origin-[--radix-select-content-transform-origin] overflow-y-auto overflow-x-hidden rounded-md border border-primary/20 bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in',
          position === 'popper' &&
            'data-[side=left]:-translate-x-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}
SelectContent.displayName = SelectPrimitive.Content.displayName;

export interface SelectLabelProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {
  ref?: React.Ref<React.ElementRef<typeof SelectPrimitive.Label>>;
}

function SelectLabel({ ref, className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn('font-semibold', SPACING.PX_2, 'py-1.5', TYPOGRAPHY.TEXT_SM, className)}
      {...props}
    />
  );
}
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  ref?: React.Ref<React.ElementRef<typeof SelectPrimitive.Item>>;
}

function SelectItem({ ref, className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-2 pr-8 pl-3 outline-none hover:bg-accent/50 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        TYPOGRAPHY.TEXT_SM,
        className
      )}
      {...props}
    >
      <span className='absolute right-2 flex h-6 w-6 items-center justify-center'>
        <SelectPrimitive.ItemIndicator>
          <Check className='size-4' />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className='font-medium'>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
SelectItem.displayName = SelectPrimitive.Item.displayName;

export interface SelectSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {
  ref?: React.Ref<React.ElementRef<typeof SelectPrimitive.Separator>>;
}

function SelectSeparator({ ref, className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  );
}
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
