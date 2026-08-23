'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Loader2,
  Package,
  DollarSign,
  Tag,
  Boxes,
  FileText,
  CheckCircle,
} from 'lucide-react';
import {
  saveProductAction,
  getProductAction,
  updateProductAction,
} from '@/app/actions/productActions';
import type { ProductFormData } from '@/types/product';

/**
 * Formats a raw number or string into a thousand-separated currency string (e.g. 250000 -> '250,000')
 */
export function formatCurrencyInput(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === '') return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US');
}

/**
 * Parses a thousand-separated currency string into a raw numeric value or null
 */
export function parseCurrencyInput(
  value: string | null | undefined
): number | null {
  if (value === null || value === undefined || value === '') return null;
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return null;
  const num = parseInt(digits, 10);
  return isNaN(num) ? null : num;
}

export interface ProductFormDialogProps {
  mode?: 'create' | 'edit';
  productId?: number | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ProductFormDialog({
  mode = 'create',
  productId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: ProductFormDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  // Form field states
  const [productCode, setProductCode] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [buyingPrice, setBuyingPrice] = React.useState('');
  const [discountPrice, setDiscountPrice] = React.useState('');
  const [quantity, setQuantity] = React.useState('0');
  const [isActive, setIsActive] = React.useState<boolean>(true);
  const [description, setDescription] = React.useState('');

  // Validation errors
  const [errors, setErrors] = React.useState<{
    name?: string;
    price?: string;
    buyingPrice?: string;
    discountPrice?: string;
    quantity?: string;
    form?: string;
  }>({});

  // Loading & Saving states
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Reset form
  const resetForm = React.useCallback(() => {
    setProductCode(null);
    setName('');
    setPrice('');
    setBuyingPrice('');
    setDiscountPrice('');
    setQuantity('0');
    setIsActive(true);
    setDescription('');
    setErrors({});
  }, []);

  const setIsOpen = React.useCallback(
    (open: boolean) => {
      if (!open) {
        resetForm();
      }
      if (isControlled) {
        controlledOnOpenChange?.(open);
      } else {
        setInternalOpen(open);
      }
    },
    [isControlled, controlledOnOpenChange, resetForm]
  );

  // Fetch product details if in edit mode
  React.useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadData() {
      if (mode === 'edit' && productId) {
        setIsLoading(true);
        setErrors({});
        try {
          const product = await getProductAction(productId);
          if (!isMounted) return;
          setProductCode(product.code || null);
          setName(product.name || '');
          setPrice(formatCurrencyInput(product.price));
          setBuyingPrice(formatCurrencyInput(product.buyingPrice));
          setDiscountPrice(formatCurrencyInput(product.discountPrice));
          setQuantity(
            product.quantity !== null && product.quantity !== undefined
              ? String(product.quantity)
              : '0'
          );
          setIsActive(product.isActive !== false);
          setDescription(product.description || '');
        } catch (err) {
          console.error('Failed to load product:', err);
          if (isMounted) {
            setErrors({
              form: 'Failed to load product details. Please try again.',
            });
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, mode, productId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setPrice(formatted);
    if (errors.price) {
      setErrors((prev) => ({ ...prev, price: undefined }));
    }
  };

  const handleBuyingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setBuyingPrice(formatted);
    if (errors.buyingPrice) {
      setErrors((prev) => ({ ...prev, buyingPrice: undefined }));
    }
  };

  const handleDiscountPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const formatted = formatCurrencyInput(e.target.value);
    setDiscountPrice(formatted);
    if (errors.discountPrice) {
      setErrors((prev) => ({ ...prev, discountPrice: undefined }));
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value);
    if (errors.quantity) {
      setErrors((prev) => ({ ...prev, quantity: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Product name is required (at least 2 characters).';
    }

    const numPrice = parseCurrencyInput(price);
    if (price.trim() === '' || numPrice === null || numPrice < 0) {
      newErrors.price = 'Selling price must be a valid non-negative number.';
    }

    if (buyingPrice.trim() !== '') {
      const numBuyingPrice = parseCurrencyInput(buyingPrice);
      if (numBuyingPrice === null || numBuyingPrice < 0) {
        newErrors.buyingPrice =
          'Buying price must be a valid non-negative number.';
      }
    }

    if (discountPrice.trim() !== '') {
      const numDiscountPrice = parseCurrencyInput(discountPrice);
      if (numDiscountPrice === null || numDiscountPrice < 0) {
        newErrors.discountPrice =
          'Discount price must be a valid non-negative number.';
      } else if (numPrice !== null && numDiscountPrice > numPrice) {
        newErrors.discountPrice = 'Discount price cannot exceed selling price.';
      }
    }

    if (quantity.trim() !== '') {
      const numQuantity = Number(quantity);
      if (
        isNaN(numQuantity) ||
        numQuantity < 0 ||
        !Number.isInteger(numQuantity)
      ) {
        newErrors.quantity = 'Quantity must be a non-negative whole number.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setErrors({});

    try {
      const payload: ProductFormData = {
        name: name.trim(),
        price: parseCurrencyInput(price) ?? 0,
        buyingPrice:
          buyingPrice.trim() !== '' ? parseCurrencyInput(buyingPrice) : null,
        discountPrice:
          discountPrice.trim() !== ''
            ? parseCurrencyInput(discountPrice)
            : null,
        quantity: quantity.trim() !== '' ? parseInt(quantity, 10) : 0,
        description: description.trim() || null,
        isActive,
      };

      if (mode === 'edit' && productId) {
        await updateProductAction(productId, payload);
      } else {
        await saveProductAction(payload);
      }

      setIsOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      console.error('Failed to save product:', err);
      setErrors({
        form: 'Failed to save product. Please check your information and try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger !== undefined ? (
        trigger
      ) : (
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-xl font-semibold">
              {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            {mode === 'edit' && productCode && (
              <Badge variant="secondary" className="font-mono text-xs">
                {productCode}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {mode === 'edit'
              ? 'Update the product details and inventory levels below.'
              : 'Enter product inventory details to create a new product item.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm">Loading product details...</p>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="space-y-4 pt-2">
            {errors.form && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {errors.form}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="product-name"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                Product Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="product-name"
                placeholder="e.g. Organic Argan Oil Shampoo"
                value={name}
                onChange={handleNameChange}
                disabled={isSaving}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="product-price"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                >
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Selling Price (VND){' '}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  id="product-price"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 250,000"
                  value={price}
                  onChange={handlePriceChange}
                  disabled={isSaving}
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && (
                  <p className="text-[11px] text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="product-buyingPrice"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                >
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Buying Price / Cost (VND)
                </label>
                <Input
                  id="product-buyingPrice"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 150,000"
                  value={buyingPrice}
                  onChange={handleBuyingPriceChange}
                  disabled={isSaving}
                  className={errors.buyingPrice ? 'border-destructive' : ''}
                />
                {errors.buyingPrice && (
                  <p className="text-[11px] text-destructive">
                    {errors.buyingPrice}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="product-discountPrice"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                >
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Discount Price (VND)
                </label>
                <Input
                  id="product-discountPrice"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 220,000"
                  value={discountPrice}
                  onChange={handleDiscountPriceChange}
                  disabled={isSaving}
                  className={errors.discountPrice ? 'border-destructive' : ''}
                />
                {errors.discountPrice && (
                  <p className="text-[11px] text-destructive">
                    {errors.discountPrice}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="product-quantity"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                >
                  <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
                  Stock Quantity
                </label>
                <Input
                  id="product-quantity"
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={isSaving}
                  min={0}
                  step={1}
                  className={errors.quantity ? 'border-destructive' : ''}
                />
                {errors.quantity && (
                  <p className="text-[11px] text-destructive">
                    {errors.quantity}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="product-status"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
                Status
              </label>
              <Select
                value={isActive ? 'active' : 'inactive'}
                onValueChange={(val) => setIsActive(val === 'active')}
                disabled={isSaving}
              >
                <SelectTrigger id="product-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    Active (Available for sale)
                  </SelectItem>
                  <SelectItem value="inactive">Inactive (Disabled)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="product-description"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Description
              </label>
              <textarea
                id="product-description"
                rows={3}
                placeholder="Product details, usage notes, ingredients..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'edit' ? 'Save Changes' : 'Save Product'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AddProductDialog({ trigger }: { trigger?: React.ReactNode }) {
  return <ProductFormDialog mode="create" trigger={trigger} />;
}
