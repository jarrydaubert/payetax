import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { ICON_SIZES, TYPOGRAPHY } from '@/constants/designTokens';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

// Animation classes extracted for maintainability and reduced-motion support
const OVERLAY_ANIMATION =
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

const CONTENT_ANIMATION = cn(
  'data-[state=closed]:animate-out data-[state=open]:animate-in',
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
);

/**
 * Dialog overlay - darkened backdrop behind the dialog
 */
const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80',
      // Reduced motion: disable animations
      'motion-safe:duration-300',
      OVERLAY_ANIMATION,
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

/**
 * Dialog content - the modal panel itself
 *
 * Note: This component always renders DialogOverlay internally.
 * For advanced use cases requiring custom overlay behavior, use
 * DialogPrimitive.Content directly with your own overlay.
 */
const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Positioning
        'fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
        // Size and layout
        'grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
        // Reduced motion: disable animations
        'motion-safe:duration-300',
        CONTENT_ANIMATION,
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          'absolute top-2 right-2 inline-flex h-11 w-11 items-center justify-center rounded-md opacity-70 ring-offset-background transition-opacity sm:top-4 sm:right-4 sm:h-8 sm:w-8',
          'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:pointer-events-none',
        )}
      >
        <X className={ICON_SIZES.SIZE_4} aria-hidden='true' />
        <span className='sr-only'>Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

/**
 * Dialog header - container for title and description
 */
const DialogHeader = forwardRef<ElementRef<'div'>, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  ),
);
DialogHeader.displayName = 'DialogHeader';

/**
 * Dialog footer - container for action buttons
 */
const DialogFooter = forwardRef<ElementRef<'div'>, ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...props}
    />
  ),
);
DialogFooter.displayName = 'DialogFooter';

/**
 * Dialog title - accessible title for the dialog
 */
const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', TYPOGRAPHY.TEXT_LG, className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

/**
 * Dialog description - accessible description for the dialog
 */
const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground', TYPOGRAPHY.TEXT_SM, className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
