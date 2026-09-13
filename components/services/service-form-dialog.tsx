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
  Scissors,
  DollarSign,
  Tag,
  Percent,
  FileText,
  CheckCircle,
} from 'lucide-react';
import {
  saveServiceAction,
  getServiceAction,
  updateServiceAction,
} from '@/app/actions/serviceActions';
import type { ServiceFormData } from '@/types/service';

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
  return isNaN(num) ? '' : num.toLocaleString('en-US');
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

export interface ServiceFormDialogProps {
  mode?: 'create' | 'edit';
  serviceId?: number | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ServiceFormDialog({
  mode = 'create',
  serviceId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: ServiceFormDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  // Form field states
  const [serviceCode, setServiceCode] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [discountPrice, setDiscountPrice] = React.useState('');
  const [commission, setCommission] = React.useState('');
  const [isActive, setIsActive] = React.useState<boolean>(true);
  const [description, setDescription] = React.useState('');

  // Validation errors
  const [errors, setErrors] = React.useState<{
    name?: string;
    price?: string;
    discountPrice?: string;
    commission?: string;
    form?: string;
  }>({});

  // Loading & Saving states
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Reset form
  const resetForm = React.useCallback(() => {
    setServiceCode(null);
    setName('');
    setPrice('');
    setDiscountPrice('');
    setCommission('');
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

  // Fetch service details if in edit mode
  React.useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadData() {
      if (mode === 'edit' && serviceId) {
        setIsLoading(true);
        setErrors({});
        try {
          const service = await getServiceAction(serviceId);
          if (!isMounted) return;
          setServiceCode(service.code || null);
          setName(service.name || '');
          setPrice(formatCurrencyInput(service.price));
          setDiscountPrice(formatCurrencyInput(service.discountPrice));
          setCommission(
            service.commission !== null && service.commission !== undefined
              ? String(service.commission)
              : ''
          );
          setIsActive(service.isActive !== false);
          setDescription(service.description || '');
        } catch (err) {
          console.error('Failed to load service:', err);
          if (isMounted) {
            setErrors({
              form: 'Failed to load service details. Please try again.',
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
  }, [isOpen, mode, serviceId]);

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

  const handleDiscountPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const formatted = formatCurrencyInput(e.target.value);
    setDiscountPrice(formatted);
    if (errors.discountPrice) {
      setErrors((prev) => ({ ...prev, discountPrice: undefined }));
    }
  };

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommission(e.target.value);
    if (errors.commission) {
      setErrors((prev) => ({ ...prev, commission: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Service name is required (at least 2 characters).';
    }

    const numPrice = parseCurrencyInput(price);
    if (price.trim() === '' || numPrice === null || numPrice < 0) {
      newErrors.price = 'Price must be a valid non-negative number.';
    }

    if (discountPrice.trim() !== '') {
      const numDiscountPrice = parseCurrencyInput(discountPrice);
      if (numDiscountPrice === null || numDiscountPrice < 0) {
        newErrors.discountPrice =
          'Promotion price must be a valid non-negative number.';
      } else if (numPrice !== null && numDiscountPrice > numPrice) {
        newErrors.discountPrice =
          'Promotion price cannot exceed regular price.';
      }
    }

    if (commission.trim() !== '') {
      const numCommission = Number(commission);
      if (isNaN(numCommission) || numCommission < 0 || numCommission > 100) {
        newErrors.commission =
          'Commission must be a valid percentage between 0 and 100.';
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
      const payload: ServiceFormData = {
        name: name.trim(),
        price: parseCurrencyInput(price) ?? 0,
        discountPrice:
          discountPrice.trim() !== ''
            ? parseCurrencyInput(discountPrice)
            : null,
        commission: commission.trim() !== '' ? parseFloat(commission) : null,
        description: description.trim() || null,
        isActive,
      };

      if (mode === 'edit' && serviceId) {
        await updateServiceAction(serviceId, payload);
      } else {
        await saveServiceAction(payload);
      }

      setIsOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      console.error('Failed to save service:', err);
      setErrors({
        form: 'Failed to save service. Please check your information and try again.',
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
            <span>Add Service</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-xl font-semibold">
              {mode === 'edit' ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            {mode === 'edit' && serviceCode && (
              <Badge variant="secondary" className="font-mono text-xs">
                {serviceCode}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {mode === 'edit'
              ? 'Update the service details, pricing, and commission below.'
              : 'Enter service details and pricing to create a new salon service item.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm">Loading service details...</p>
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
                htmlFor="service-name"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
                Service Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="service-name"
                placeholder="e.g. Deluxe Hair Spa"
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
                  htmlFor="service-price"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                >
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Regular Price (VND){' '}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  id="service-price"
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
                  htmlFor="service-discountPrice"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                >
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Promotion Price (VND)
                </label>
                <Input
                  id="service-discountPrice"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 200,000"
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
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="service-commission"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                >
                  <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                  Staff Commission (%)
                </label>
                <Input
                  id="service-commission"
                  type="number"
                  placeholder="e.g. 10"
                  value={commission}
                  onChange={handleCommissionChange}
                  disabled={isSaving}
                  min={0}
                  max={100}
                  step="any"
                  className={errors.commission ? 'border-destructive' : ''}
                />
                {errors.commission && (
                  <p className="text-[11px] text-destructive">
                    {errors.commission}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="service-status"
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
                  <SelectTrigger id="service-status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      Active (Available for booking)
                    </SelectItem>
                    <SelectItem value="inactive">
                      Inactive (Disabled)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="service-description"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Description
              </label>
              <textarea
                id="service-description"
                rows={3}
                placeholder="Service details, included steps, treatment notes..."
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
                {mode === 'edit' ? 'Save Changes' : 'Save Service'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AddServiceDialog({ trigger }: { trigger?: React.ReactNode }) {
  return <ServiceFormDialog mode="create" trigger={trigger} />;
}
