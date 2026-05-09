'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderStatus } from '@/types/order';

export function OrderFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoize defaults so they don't change on every render
  const defaultStart = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);
  const defaultEnd = React.useMemo(() => new Date(), []);

  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');
  const statusParam = searchParams.get('status');

  const [startDate, setStartDate] = React.useState<Date | undefined>(
    startDateParam ? new Date(startDateParam) : defaultStart
  );

  const [endDate, setEndDate] = React.useState<Date | undefined>(
    endDateParam ? new Date(endDateParam) : defaultEnd
  );

  const [status, setStatus] = React.useState<string>(statusParam || 'all');

  React.useEffect(() => {
    // If URL lacks date parameters, immediately populate it with defaults
    // so the server component fetches using the explicit defaults
    if (!startDateParam || !endDateParam) {
      const params = new URLSearchParams(searchParams.toString());
      if (!startDateParam) params.set('startDate', defaultStart.toISOString());
      if (!endDateParam) params.set('endDate', defaultEnd.toISOString());
      router.replace(`?${params.toString()}`);
    }
  }, [
    startDateParam,
    endDateParam,
    router,
    searchParams,
    defaultStart,
    defaultEnd,
  ]);

  // Sync internal state with URL params when they change (e.g. back/forward nav)
  // We use the "Adjusting state when a prop changes" pattern to avoid useEffect lints/renders
  const [lastParams, setLastParams] = React.useState({
    start: startDateParam,
    end: endDateParam,
    status: statusParam,
  });

  if (
    startDateParam !== lastParams.start ||
    endDateParam !== lastParams.end ||
    statusParam !== lastParams.status
  ) {
    setLastParams({
      start: startDateParam,
      end: endDateParam,
      status: statusParam,
    });
    setStartDate(startDateParam ? new Date(startDateParam) : defaultStart);
    setEndDate(endDateParam ? new Date(endDateParam) : defaultEnd);
    setStatus(statusParam || 'all');
  }

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (startDate) {
      params.set('startDate', startDate.toISOString());
    } else {
      params.delete('startDate');
    }

    if (endDate) {
      params.set('endDate', endDate.toISOString());
    } else {
      params.delete('endDate');
    }

    if (status && status !== 'all') {
      params.set('status', status);
    } else {
      params.delete('status');
    }

    // Reset pagination to page 1 when applying new filters
    params.delete('page');

    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setStatus('all');
    const params = new URLSearchParams();
    params.set('startDate', defaultStart.toISOString());
    params.set('endDate', defaultEnd.toISOString());
    // Pagination is implicitly reset as we're creating a fresh URLSearchParams
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Start:
        </span>
        <DatePicker
          date={startDate}
          onChange={setStartDate}
          placeholder="Pick start date"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">End:</span>
        <DatePicker
          date={endDate}
          onChange={setEndDate}
          placeholder="Pick end date"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Status:
        </span>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={String(OrderStatus.New)}>New</SelectItem>
            <SelectItem value={String(OrderStatus.InProgress)}>
              In Progress
            </SelectItem>
            <SelectItem value={String(OrderStatus.Completed)}>
              Completed
            </SelectItem>
            <SelectItem value={String(OrderStatus.Deleted)}>Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleApply}
          className="group relative flex items-center gap-2 overflow-hidden px-6 transition-all duration-300 active:scale-95"
        >
          <Search className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
          <span>Apply</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          className="group flex items-center gap-2 px-4 transition-all duration-300 hover:bg-muted active:scale-95"
        >
          <RotateCcw className="h-4 w-4 transition-all duration-300 group-hover:-rotate-180" />
          <span>Clear</span>
        </Button>
      </div>
    </div>
  );
}
