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
import type { Order } from '@/types/order';
import { StatusBadge } from '@/components/orders/status-badge';
import { formatDateTime } from '@/lib/utils';
import { OrderFormDialog } from '@/components/orders/order-form-dialog';
import { Pencil } from 'lucide-react';

interface OrdersTableProps {
  orders: Order[];
  errorMsg?: string;
}

export function OrdersTable({ orders, errorMsg }: OrdersTableProps) {
  const [editingOrderId, setEditingOrderId] = React.useState<number | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleOrderCodeClick = (orderId: number) => {
    setEditingOrderId(orderId);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Code</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {errorMsg ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-destructive"
                >
                  {errorMsg}
                </TableCell>
              </TableRow>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <button
                      type="button"
                      onClick={() => handleOrderCodeClick(order.id)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-all duration-150 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden"
                      title="Click to edit order"
                    >
                      <span>{order.code}</span>
                      <Pencil className="h-3 w-3 opacity-70 transition-opacity" />
                    </button>
                  </TableCell>
                  <TableCell>{formatDateTime(order.orderDate)}</TableCell>
                  <TableCell>
                    {order.customerName || order.customerMobile || 'Guest'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.amount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <OrderFormDialog
        mode="edit"
        orderId={editingOrderId}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingOrderId(null);
          }
        }}
        trigger={null}
      />
    </>
  );
}
