import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CustomersCursorPagination } from './customers-cursor-pagination';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams('searchText=John')),
}));

describe('CustomersCursorPagination', () => {
  it('renders nothing when itemsCount is 0 and no pagination is possible', () => {
    const { container } = render(
      <CustomersCursorPagination
        hasNext={false}
        hasPrevious={false}
        beforeCursor={null}
        afterCursor={null}
        itemsCount={0}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders showing text and navigation buttons', () => {
    render(
      <CustomersCursorPagination
        hasNext={true}
        hasPrevious={true}
        beforeCursor="before_token"
        afterCursor="after_token"
        itemsCount={20}
      />
    );
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('disables Previous button when hasPrevious is false', () => {
    render(
      <CustomersCursorPagination
        hasNext={true}
        hasPrevious={false}
        beforeCursor={null}
        afterCursor="after_token"
        itemsCount={20}
      />
    );
    const prevLink = screen.getByText('Previous').closest('a');
    expect(prevLink).toHaveClass('pointer-events-none');
    expect(prevLink).toHaveAttribute('aria-disabled', 'true');

    const nextLink = screen.getByText('Next').closest('a');
    expect(nextLink).not.toHaveClass('pointer-events-none');
  });

  it('disables Next button when hasNext is false', () => {
    render(
      <CustomersCursorPagination
        hasNext={false}
        hasPrevious={true}
        beforeCursor="before_token"
        afterCursor={null}
        itemsCount={20}
      />
    );
    const nextLink = screen.getByText('Next').closest('a');
    expect(nextLink).toHaveClass('pointer-events-none');
    expect(nextLink).toHaveAttribute('aria-disabled', 'true');

    const prevLink = screen.getByText('Previous').closest('a');
    expect(prevLink).not.toHaveClass('pointer-events-none');
  });

  it('creates correct URLs for next and previous cursors preserving filters', () => {
    render(
      <CustomersCursorPagination
        hasNext={true}
        hasPrevious={true}
        beforeCursor="before_token"
        afterCursor="after_token"
        itemsCount={20}
      />
    );

    const prevLink = screen.getByText('Previous').closest('a');
    expect(prevLink).toHaveAttribute(
      'href',
      '?searchText=John&before=before_token'
    );

    const nextLink = screen.getByText('Next').closest('a');
    expect(nextLink).toHaveAttribute(
      'href',
      '?searchText=John&after=after_token'
    );
  });
});
