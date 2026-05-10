import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OrdersPagination } from './orders-pagination';

describe('OrdersPagination', () => {
  it('renders nothing when totalResults is 0', () => {
    const { container } = render(
      <OrdersPagination
        currentPage={1}
        totalPages={0}
        totalResults={0}
        pageSize={20}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correct showing text', () => {
    render(
      <OrdersPagination
        currentPage={2}
        totalPages={5}
        totalResults={100}
        pageSize={20}
      />
    );
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    render(
      <OrdersPagination
        currentPage={1}
        totalPages={5}
        totalResults={100}
        pageSize={20}
      />
    );
    const prevLink = screen.getByText('Previous').closest('a');
    expect(prevLink).toHaveClass('pointer-events-none');
    expect(prevLink).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables Next button on last page', () => {
    render(
      <OrdersPagination
        currentPage={5}
        totalPages={5}
        totalResults={100}
        pageSize={20}
      />
    );
    const nextLink = screen.getByText('Next').closest('a');
    expect(nextLink).toHaveClass('pointer-events-none');
    expect(nextLink).toHaveAttribute('aria-disabled', 'true');
  });

  it('creates correct page URLs', () => {
    render(
      <OrdersPagination
        currentPage={1}
        totalPages={5}
        totalResults={100}
        pageSize={20}
      />
    );
    const page2Link = screen.getByText('2').closest('a');
    expect(page2Link).toHaveAttribute('href', '?page=2');
  });
});
