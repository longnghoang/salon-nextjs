'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

export function DatePickerFilter() {
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

  const [startDate, setStartDate] = React.useState<Date | undefined>(
    startDateParam ? new Date(startDateParam) : defaultStart
  );

  const [endDate, setEndDate] = React.useState<Date | undefined>(
    endDateParam ? new Date(endDateParam) : defaultEnd
  );

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

    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    const params = new URLSearchParams();
    params.set('startDate', defaultStart.toISOString());
    params.set('endDate', defaultEnd.toISOString());
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

      <Button onClick={handleApply}>Apply</Button>
      <Button variant="ghost" onClick={handleClear}>
        Clear
      </Button>
    </div>
  );
}
