import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Numeric cell class for right-aligned tabular numbers
 * Use on TableCell for financial/numeric columns
 */
export const TABLE_NUMERIC_CELL = 'text-right font-mono tabular-nums';

export type TableProps = ComponentPropsWithoutRef<'table'> & {
  /**
   * Optional ref to the scroll container (div wrapper)
   * Useful for scroll sync, indicators, and programmatic scrolling
   */
  containerRef?: React.Ref<HTMLDivElement>;
};

/**
 * Table component with horizontal scroll container
 *
 * The main ref targets the scroll container (most useful for scroll behaviors).
 * Use containerRef if you need both.
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Item</TableHead>
 *       <TableHead className={TABLE_NUMERIC_CELL}>Amount</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Income Tax</TableCell>
 *       <TableCell className={TABLE_NUMERIC_CELL}>£5,000</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */
const Table = forwardRef<HTMLDivElement, TableProps>(
  ({ className, containerRef, ...props }, ref) => (
    <div ref={ref ?? containerRef} className='relative w-full overflow-auto'>
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  ),
);
Table.displayName = 'Table';

export type TableHeaderProps = ComponentPropsWithoutRef<'thead'>;

const TableHeader = forwardRef<ElementRef<'thead'>, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-border [&_tr]:border-b', className)} {...props} />
  ),
);
TableHeader.displayName = 'TableHeader';

export type TableBodyProps = ComponentPropsWithoutRef<'tbody'>;

const TableBody = forwardRef<ElementRef<'tbody'>, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  ),
);
TableBody.displayName = 'TableBody';

export type TableFooterProps = ComponentPropsWithoutRef<'tfoot'>;

const TableFooter = forwardRef<ElementRef<'tfoot'>, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  ),
);
TableFooter.displayName = 'TableFooter';

export type TableRowProps = ComponentPropsWithoutRef<'tr'>;

const TableRow = forwardRef<ElementRef<'tr'>, TableRowProps>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-border border-b transition-colors',
      'hover:bg-muted/50',
      'data-[state=selected]:bg-muted',
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export type TableHeadProps = ComponentPropsWithoutRef<'th'>;

/**
 * Table header cell
 *
 * Defaults to scope="col" for column headers.
 * Override with scope="row" for row headers.
 */
const TableHead = forwardRef<ElementRef<'th'>, TableHeadProps>(
  ({ className, scope = 'col', ...props }, ref) => (
    <th
      ref={ref}
      scope={scope}
      className={cn(
        'h-10 px-2 text-left align-middle font-medium text-muted-foreground',
        // Checkbox column styling (uses :has() - supported in all modern browsers)
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = 'TableHead';

export type TableCellProps = ComponentPropsWithoutRef<'td'>;

const TableCell = forwardRef<ElementRef<'td'>, TableCellProps>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-2 align-middle',
      // Checkbox column styling
      '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

export type TableCaptionProps = ComponentPropsWithoutRef<'caption'>;

const TableCaption = forwardRef<ElementRef<'caption'>, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mt-4 text-muted-foreground text-sm', className)} {...props} />
  ),
);
TableCaption.displayName = 'TableCaption';

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
