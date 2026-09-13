import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServicesCursorPagination } from './services-cursor-pagination';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(
    () => new URLSearchParams('searchText=Haircut&before=old_before')
  ),
}));

describe('ServicesCursorPagination Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when itemsCount is 0 and hasNext/hasPrevious are false', () => {
    const { container } = render(
      <ServicesCursorPagination
        hasNext={false}
        hasPrevious={false}
        beforeCursor={null}
        afterCursor={null}
        itemsCount={0}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders services count and active pagination buttons', () => {
    render(
      <ServicesCursorPagination
        hasNext={true}
        hasPrevious={true}
        beforeCursor="cur_before_123"
        afterCursor="cur_after_456"
        itemsCount={20}
      />
    );

    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText(/services/)).toBeInTheDocument();

    const prevLink = screen.getByLabelText(/Go to previous page/i);
    const nextLink = screen.getByLabelText(/Go to next page/i);

    expect(prevLink).not.toHaveClass('pointer-events-none');
    expect(nextLink).not.toHaveClass('pointer-events-none');

    expect(prevLink.getAttribute('href')).toContain('before=cur_before_123');
    expect(prevLink.getAttribute('href')).toContain('searchText=Haircut');
    expect(prevLink.getAttribute('href')).not.toContain('after=');

    expect(nextLink.getAttribute('href')).toContain('after=cur_after_456');
    expect(nextLink.getAttribute('href')).toContain('searchText=Haircut');
    expect(nextLink.getAttribute('href')).not.toContain('before=');
  });

  it('disables previous button when hasPrevious is false', () => {
    render(
      <ServicesCursorPagination
        hasNext={true}
        hasPrevious={false}
        beforeCursor={null}
        afterCursor="cur_after_456"
        itemsCount={10}
      />
    );

    const prevLink = screen.getByLabelText(/Go to previous page/i);
    const nextLink = screen.getByLabelText(/Go to next page/i);

    expect(prevLink).toHaveClass('pointer-events-none');
    expect(prevLink).toHaveClass('opacity-50');
    expect(nextLink).not.toHaveClass('pointer-events-none');
  });

  it('disables next button when hasNext is false', () => {
    render(
      <ServicesCursorPagination
        hasNext={false}
        hasPrevious={true}
        beforeCursor="cur_before_123"
        afterCursor={null}
        itemsCount={10}
      />
    );

    const prevLink = screen.getByLabelText(/Go to previous page/i);
    const nextLink = screen.getByLabelText(/Go to next page/i);

    expect(prevLink).not.toHaveClass('pointer-events-none');
    expect(nextLink).toHaveClass('pointer-events-none');
    expect(nextLink).toHaveClass('opacity-50');
  });
});
