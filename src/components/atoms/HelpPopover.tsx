'use client';

import * as Popover from '@radix-ui/react-popover';
import { X } from 'lucide-react';
import { type ReactElement, type ReactNode, useEffect, useId, useRef, useState } from 'react';

interface HelpPopoverProps {
  label: string;
  trigger: ReactElement;
  children: ReactNode;
  side?: 'top' | 'right';
  align?: 'start' | 'center';
  testId?: string;
}

/** Click-to-open help, with native popover focus and dismissal behaviour. */
export function HelpPopover({
  label,
  trigger,
  children,
  side = 'top',
  align = 'center',
  testId,
}: HelpPopoverProps) {
  const [triggerElement, setTriggerElement] = useState<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const descriptionId = useId();
  const [open, setOpen] = useState(false);
  const dismissedOutside = useRef(false);

  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: PointerEvent) => {
      const target = event.target;
      if (
        !(target instanceof Node) ||
        triggerElement?.contains(target) ||
        contentRef.current?.contains(target)
      )
        return;
      // Amount fields can suppress the later click on touch; dismiss on pointerdown instead.
      dismissedOutside.current = true;
      setOpen(false);
    };
    document.addEventListener('pointerdown', dismissOutside, true);
    return () => document.removeEventListener('pointerdown', dismissOutside, true);
  }, [open, triggerElement]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        asChild
        ref={setTriggerElement}
        aria-haspopup={false}
        aria-describedby={open ? descriptionId : undefined}
        aria-keyshortcuts={open ? 'ArrowDown' : undefined}
        onKeyDown={(event) => {
          if (open && event.key === 'ArrowDown') {
            event.preventDefault();
            contentRef.current?.focus({ preventScroll: true });
          }
        }}
        onMouseDown={(event) => {
          // Safari otherwise blurs this button before click, changing calculator scroll padding.
          if (document.activeElement === event.currentTarget) event.preventDefault();
        }}
      >
        {trigger}
      </Popover.Trigger>
      <Popover.Portal container={triggerElement?.closest<HTMLElement>('[role="dialog"]')}>
        <Popover.Content
          ref={contentRef}
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={12}
          role='region'
          aria-label={label}
          aria-describedby={descriptionId}
          tabIndex={-1}
          data-testid={testId}
          className='relative z-50 max-h-[var(--radix-popover-content-available-height)] w-80 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-md border border-border bg-popover p-3 pr-11 text-popover-foreground text-sm leading-relaxed shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          onCloseAutoFocus={(event) => {
            if (dismissedOutside.current) event.preventDefault();
            dismissedOutside.current = false;
          }}
          onEscapeKeyDown={() => triggerElement?.focus({ preventScroll: true })}
          onOpenAutoFocus={(event) => {
            // Keep focus on the disclosure button; its description exposes the open explanation.
            event.preventDefault();
          }}
        >
          <div id={descriptionId}>{children}</div>
          <Popover.Close
            type='button'
            aria-label='Close help'
            onMouseDown={(event) => {
              if (document.activeElement === triggerElement) event.preventDefault();
            }}
            className='absolute top-1 right-1 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <X className='size-4' aria-hidden='true' />
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
