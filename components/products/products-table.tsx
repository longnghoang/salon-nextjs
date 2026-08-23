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
import type { Product } from '@/types/product';
import { ProductFormDialog } from '@/components/products/product-form-dialog';
import { Pencil } from 'lucide-react';

interface ProductsTableProps {
  products: Product[];
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

export function ProductsTable({ products, errorMsg }: ProductsTableProps) {
  const [editingProductId, setEditingProductId] = React.useState<number | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleProductCodeClick = (productId: number) => {
    setEditingProductId(productId);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Code</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Buying Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Description</TableHead>
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
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <button
                      type="button"
                      onClick={() => handleProductCodeClick(product.id)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-all duration-150 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden"
                      title="Click to edit product"
                    >
                      <span>{product.code}</span>
                      <Pencil className="h-3 w-3 opacity-70 transition-opacity" />
                    </button>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatPrice(product.buyingPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {product.quantity}
                  </TableCell>
                  <TableCell className="text-center">
                    {product.isActive ? (
                      <Badge
                        variant="outline"
                        className="border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-transparent bg-muted text-muted-foreground"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {product.description || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        mode="edit"
        productId={editingProductId}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingProductId(null);
          }
        }}
        trigger={null}
      />
    </>
  );
}
