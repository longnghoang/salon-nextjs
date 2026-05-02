"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

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
      if (!startDateParam) params.set("startDate", defaultStart.toISOString());
      if (!endDateParam) params.set("endDate", defaultEnd.toISOString());
      router.replace(`?${params.toString()}`);
    }
  }, [startDateParam, endDateParam, router, searchParams, defaultStart, defaultEnd]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (startDate) {
      params.set("startDate", startDate.toISOString());
    } else {
      params.delete("startDate");
    }
    
    if (endDate) {
      params.set("endDate", endDate.toISOString());
    } else {
      params.delete("endDate");
    }

    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    const params = new URLSearchParams();
    params.set("startDate", defaultStart.toISOString());
    params.set("endDate", defaultEnd.toISOString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Start:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "LLL dd, y") : <span>Pick start date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">End:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "LLL dd, y") : <span>Pick end date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button onClick={handleApply}>Apply</Button>
      <Button variant="ghost" onClick={handleClear}>Clear</Button>
    </div>
  );
}
