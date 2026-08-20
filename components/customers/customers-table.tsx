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
import type { Customer } from '@/types/customer';
import {
  CustomerFormDialog,
  formatMobileNumber,
  formatDateToDDMMYYYY,
} from '@/components/customers/customer-form-dialog';
import { Pencil } from 'lucide-react';

interface CustomersTableProps {
  customers: Customer[];
  errorMsg?: string;
}

export function CustomersTable({ customers, errorMsg }: CustomersTableProps) {
  const [editingCustomerId, setEditingCustomerId] = React.useState<
    number | null
  >(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleCustomerCodeClick = (customerId: number) => {
    setEditingCustomerId(customerId);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Code</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {errorMsg ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-destructive"
                >
                  {errorMsg}
                </TableCell>
              </TableRow>
            ) : customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    <button
                      type="button"
                      onClick={() => handleCustomerCodeClick(customer.id)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-all duration-150 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden"
                      title="Click to edit customer"
                    >
                      <span>{customer.code}</span>
                      <Pencil className="h-3 w-3 opacity-70 transition-opacity" />
                    </button>
                  </TableCell>
                  <TableCell className="font-medium">
                    {customer.fullName}
                  </TableCell>
                  <TableCell>{formatMobileNumber(customer.mobile)}</TableCell>
                  <TableCell>
                    {customer.birthDay
                      ? formatDateToDDMMYYYY(customer.birthDay)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.createdDateTime).toLocaleString(
                      'vi-VN',
                      {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      }
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {customer.note || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-center text-muted-foreground"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CustomerFormDialog
        mode="edit"
        customerId={editingCustomerId}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingCustomerId(null);
          }
        }}
        trigger={null}
      />
    </>
  );
}
