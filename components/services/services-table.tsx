'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Service } from '@/types/service';

interface ServicesTableProps {
  services: Service[];
  errorMsg?: string;
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '-';
  }
  return currencyFormatter.format(amount);
}

export function ServicesTable({ services, errorMsg }: ServicesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Service Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Promotion Price</TableHead>
            <TableHead className="text-center">Commission</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {errorMsg ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-6 text-center text-destructive"
              >
                {errorMsg}
              </TableCell>
            </TableRow>
          ) : services.length > 0 ? (
            services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {service.code}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(service.price)}
                </TableCell>
                <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                  {formatPrice(service.discountPrice)}
                </TableCell>
                <TableCell className="text-center">
                  {service.commission !== null &&
                  service.commission !== undefined
                    ? `${service.commission}%`
                    : '-'}
                </TableCell>
                <TableCell className="text-center">
                  {service.isActive ? (
                    <Badge
                      variant="outline"
                      className="border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    >
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell
                  className="max-w-xs truncate text-muted-foreground"
                  title={service.description || undefined}
                >
                  {service.description || '-'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-muted-foreground"
              >
                No services found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
