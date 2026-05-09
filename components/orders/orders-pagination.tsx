'use client';

import { useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface OrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  className?: string;
}

export function OrdersPagination({
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  className,
}: OrdersPaginationProps) {
  const searchParams = useSearchParams();

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  const startResult = (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalResults);

  if (totalResults === 0) return null;

  // Logic to determine which page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row',
        className
      )}
    >
      <div className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">{startResult}</span> to{' '}
        <span className="font-medium text-foreground">{endResult}</span> of{' '}
        <span className="font-medium text-foreground">{totalResults}</span>{' '}
        results
      </div>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={createPageUrl(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage <= 1}
              className={cn(
                currentPage <= 1 && 'pointer-events-none opacity-50'
              )}
            />
          </PaginationItem>

          {getPageNumbers().map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={createPageUrl(page as number)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href={createPageUrl(Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage >= totalPages}
              className={cn(
                currentPage >= totalPages && 'pointer-events-none opacity-50'
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
