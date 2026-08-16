'use client';

import { useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface CustomersCursorPaginationProps {
  hasNext: boolean;
  hasPrevious: boolean;
  beforeCursor: string | null;
  afterCursor: string | null;
  itemsCount: number;
  className?: string;
}

export function CustomersCursorPagination({
  hasNext,
  hasPrevious,
  beforeCursor,
  afterCursor,
  itemsCount,
  className,
}: CustomersCursorPaginationProps) {
  const searchParams = useSearchParams();

  const createCursorUrl = (type: 'before' | 'after', cursor: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'before') {
      if (cursor) {
        params.set('before', cursor);
      } else {
        params.delete('before');
      }
      params.delete('after');
    } else {
      if (cursor) {
        params.set('after', cursor);
      } else {
        params.delete('after');
      }
      params.delete('before');
    }
    return `?${params.toString()}`;
  };

  if (itemsCount === 0 && !hasPrevious && !hasNext) return null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row',
        className
      )}
    >
      <div className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">{itemsCount}</span>{' '}
        customers
      </div>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={createCursorUrl('before', beforeCursor)}
              aria-disabled={!hasPrevious}
              className={cn(!hasPrevious && 'pointer-events-none opacity-50')}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              href={createCursorUrl('after', afterCursor)}
              aria-disabled={!hasNext}
              className={cn(!hasNext && 'pointer-events-none opacity-50')}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
