import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductsCursorPagination } from './products-cursor-pagination';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(
    () => new URLSearchParams('searchText=Shampoo&before=old_before')
  ),
}));

describe('ProductsCursorPagination Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when itemsCount is 0 and hasNext/hasPrevious are false', () => {
    const { container } = render(
      <ProductsCursorPagination
        hasNext={false}
        hasPrevious={false}
        beforeCursor={null}
        afterCursor={null}
        itemsCount={0}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders products count and active pagination buttons', () => {
    render(
      <ProductsCursorPagination
        hasNext={true}
        hasPrevious={true}
        beforeCursor="cur_before_123"
        afterCursor="cur_after_456"
        itemsCount={20}
      />
    );

    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText(/products/)).toBeInTheDocument();

    const prevLink = screen.getByLabelText(/Go to previous page/i);
    const nextLink = screen.getByLabelText(/Go to next page/i);

    expect(prevLink).not.toHaveClass('pointer-events-none');
    expect(nextLink).not.toHaveClass('pointer-events-none');

    expect(prevLink.getAttribute('href')).toContain('before=cur_before_123');
    expect(prevLink.getAttribute('href')).toContain('searchText=Shampoo');
    expect(prevLink.getAttribute('href')).not.toContain('after=');

    expect(nextLink.getAttribute('href')).toContain('after=cur_after_456');
    expect(nextLink.getAttribute('href')).toContain('searchText=Shampoo');
    expect(nextLink.getAttribute('href')).not.toContain('before=');
  });

  it('disables previous button when hasPrevious is false', () => {
    render(
      <ProductsCursorPagination
        hasNext={true}
        hasPrevious={false}
        beforeCursor={null}
        afterCursor="cur_after_456"
        itemsCount={15}
      />
    );

    const prevLink = screen.getByLabelText(/Go to previous page/i);
    expect(prevLink).toHaveClass('pointer-events-none');
    expect(prevLink).toHaveClass('opacity-50');
  });

  it('disables next button when hasNext is false', () => {
    render(
      <ProductsCursorPagination
        hasNext={false}
        hasPrevious={true}
        beforeCursor="cur_before_123"
        afterCursor={null}
        itemsCount={10}
      />
    );

    const nextLink = screen.getByLabelText(/Go to next page/i);
    expect(nextLink).toHaveClass('pointer-events-none');
    expect(nextLink).toHaveClass('opacity-50');
  });
});
