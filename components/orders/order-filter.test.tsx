import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderFilter } from './order-filter';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

describe('OrderFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<OrderFilter />);
    expect(screen.getByText('Start:')).toBeInTheDocument();
    expect(screen.getByText('End:')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('replaces URL with default dates if params are empty on mount', () => {
    render(<OrderFilter />);
    expect(mockReplace).toHaveBeenCalled();
    const url = mockReplace.mock.calls[0][0];
    expect(url).toContain('startDate=');
    expect(url).toContain('endDate=');
  });

  it('calls router.push when Apply is clicked', () => {
    render(<OrderFilter />);
    fireEvent.click(screen.getByText('Apply'));
    expect(mockPush).toHaveBeenCalled();
  });

  it('calls router.push with defaults when Clear is clicked', () => {
    render(<OrderFilter />);
    fireEvent.click(screen.getByText('Clear'));
    expect(mockPush).toHaveBeenCalled();
    const url = mockPush.mock.calls[0][0];
    expect(url).toContain('startDate=');
    expect(url).toContain('endDate=');
  });
});
