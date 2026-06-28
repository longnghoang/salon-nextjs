'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  startMonth?: Date;
  endMonth?: Date;
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years';
}

export function DatePicker({
  date,
  onChange,
  placeholder = 'Pick a date',
  className,
  startMonth,
  endMonth,
  captionLayout = 'dropdown',
}: DatePickerProps) {
  const defaultStartMonth =
    startMonth || new Date(new Date().getFullYear() - 100, 0);
  const defaultEndMonth =
    endMonth || new Date(new Date().getFullYear() + 10, 11);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[200px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'LLL dd, y') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          defaultMonth={date}
          captionLayout={captionLayout}
          startMonth={defaultStartMonth}
          endMonth={defaultEndMonth}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
