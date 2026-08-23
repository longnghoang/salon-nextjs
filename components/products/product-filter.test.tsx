import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductFilter } from './product-filter';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: vi.fn(() => new URLSearchParams('page=2&before=cursor123')),
}));

describe('ProductFilter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input, apply and clear buttons correctly', () => {
    render(<ProductFilter />);
    expect(
      screen.getByPlaceholderText('Search by name or code...')
    ).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('clears pagination parameters and applies searchText when Apply is clicked', () => {
    render(<ProductFilter />);
    const input = screen.getByPlaceholderText('Search by name or code...');
    fireEvent.change(input, { target: { value: 'Shampoo' } });
    fireEvent.click(screen.getByText('Apply'));

    expect(mockPush).toHaveBeenCalledWith('?searchText=Shampoo');
  });

  it('triggers apply when Enter key is pressed in the search input', () => {
    render(<ProductFilter />);
    const input = screen.getByPlaceholderText('Search by name or code...');
    fireEvent.change(input, { target: { value: 'PROD-001' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockPush).toHaveBeenCalledWith('?searchText=PROD-001');
  });

  it('clears searchText and pagination parameters when Clear is clicked', () => {
    render(<ProductFilter />);
    fireEvent.click(screen.getByText('Clear'));

    expect(mockPush).toHaveBeenCalledWith('?');
  });
});
