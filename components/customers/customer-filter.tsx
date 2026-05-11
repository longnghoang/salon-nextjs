'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RotateCcw } from 'lucide-react';

export function CustomerFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = React.useState(
    searchParams.get('searchText') || ''
  );

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchText) {
      params.set('searchText', searchText);
    } else {
      params.delete('searchText');
    }
    params.delete('page'); // Reset to page 1 on new search
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchText('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('searchText');
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4">
      <div className="flex w-full max-w-sm items-center gap-2">
        <Input
          type="text"
          placeholder="Search customers..."
          value={searchText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              handleApply();
            }
          }}
        />
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
