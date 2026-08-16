import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerFilter } from './customer-filter';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: vi.fn(() => new URLSearchParams('page=2&before=abc')),
}));

describe('CustomerFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input, apply and clear buttons correctly', () => {
    render(<CustomerFilter />);
    expect(
      screen.getByPlaceholderText('Search customers...')
    ).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('clears pagination parameters and applies searchText when Apply is clicked', () => {
    render(<CustomerFilter />);
    const input = screen.getByPlaceholderText('Search customers...');
    fireEvent.change(input, { target: { value: 'Alice' } });
    fireEvent.click(screen.getByText('Apply'));

    expect(mockPush).toHaveBeenCalledWith('?searchText=Alice');
  });

  it('clears searchText and pagination parameters when Clear is clicked', () => {
    render(<CustomerFilter />);
    fireEvent.click(screen.getByText('Clear'));

    expect(mockPush).toHaveBeenCalledWith('?');
  });
});
