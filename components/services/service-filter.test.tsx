import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceFilter } from './service-filter';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: vi.fn(() => new URLSearchParams('page=2&before=cursor123')),
}));

describe('ServiceFilter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input, apply and clear buttons correctly', () => {
    render(<ServiceFilter />);
    expect(
      screen.getByPlaceholderText('Search by name or code...')
    ).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('clears pagination parameters and applies searchText when Apply is clicked', () => {
    render(<ServiceFilter />);
    const input = screen.getByPlaceholderText('Search by name or code...');
    fireEvent.change(input, { target: { value: 'Haircut' } });
    fireEvent.click(screen.getByText('Apply'));

    expect(mockPush).toHaveBeenCalledWith('?searchText=Haircut');
  });

  it('triggers apply when Enter key is pressed in the search input', () => {
    render(<ServiceFilter />);
    const input = screen.getByPlaceholderText('Search by name or code...');
    fireEvent.change(input, { target: { value: 'SRV-001' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockPush).toHaveBeenCalledWith('?searchText=SRV-001');
  });

  it('clears searchText and pagination parameters when Clear is clicked', () => {
    render(<ServiceFilter />);
    fireEvent.click(screen.getByText('Clear'));

    expect(mockPush).toHaveBeenCalledWith('?');
  });
});
