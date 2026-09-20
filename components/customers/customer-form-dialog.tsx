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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  UserPlus,
  Loader2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/orders/status-badge';
import {
  saveCustomerAction,
  getCustomerAction,
  updateCustomerAction,
  getCustomerOrdersAction,
} from '@/app/actions/customerActions';
import type { CustomerFormData } from '@/types/customer';
import type { Order } from '@/types/order';

/**
 * Formats a raw digit string into the 10-digit mask: ____ ___ ___ (e.g. '0901 234 567')
 */
export function formatMobileNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
}

/**
 * Formats a raw digit or formatted date string into dd/MM/yyyy (e.g. '25082011' -> '25/08/2011')
 */
export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/**
 * Parses dd/MM/yyyy (or dd-MM-yyyy) format to a valid Date object or null if invalid / future date
 */
export function parseDateFromDDMMYYYY(dateStr: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const match = dateStr.trim().match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Formats a Date object or ISO string to dd/MM/yyyy
 */
export function formatDateToDDMMYYYY(
  isoStr: string | null | undefined
): string {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

export interface CustomerFormDialogProps {
  mode?: 'create' | 'edit';
  customerId?: number | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CustomerFormDialog({
  mode = 'create',
  customerId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: CustomerFormDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  // Form field states
  const [customerCode, setCustomerCode] = React.useState<string | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [birthDay, setBirthDay] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [note, setNote] = React.useState('');

  // Validation errors
  const [errors, setErrors] = React.useState<{
    fullName?: string;
    mobile?: string;
    birthDay?: string;
    email?: string;
    form?: string;
  }>({});

  // Loading & Saving states
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Order history states
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = React.useState(false);
  const [ordersError, setOrdersError] = React.useState<string | null>(null);

  // Parse valid date for calendar selection
  const selectedDate = React.useMemo(() => {
    return parseDateFromDDMMYYYY(birthDay);
  }, [birthDay]);

  // Reset form
  const resetForm = React.useCallback(() => {
    setCustomerCode(null);
    setFullName('');
    setMobile('');
    setBirthDay('');
    setEmail('');
    setAddress('');
    setNote('');
    setErrors({});
    setIsCalendarOpen(false);
    setOrders([]);
    setIsLoadingOrders(false);
    setOrdersError(null);
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

  // Fetch customer details and order history if edit mode
  React.useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadData() {
      if (mode === 'edit' && customerId) {
        setIsLoading(true);
        setIsLoadingOrders(true);
        setErrors({});
        setOrdersError(null);

        try {
          const [customerResult, ordersResult] = await Promise.allSettled([
            getCustomerAction(customerId),
            getCustomerOrdersAction(customerId),
          ]);

          if (!isMounted) return;

          if (customerResult.status === 'fulfilled') {
            const customer = customerResult.value;
            setCustomerCode(customer.code || null);
            setFullName(customer.fullName || '');
            setMobile(formatMobileNumber(customer.mobile || ''));
            setBirthDay(formatDateToDDMMYYYY(customer.birthDay));
            setEmail(customer.email || '');
            setAddress(customer.address || '');
            setNote(customer.note || '');
          } else {
            console.error('Failed to load customer:', customerResult.reason);
            setErrors({
              form: 'Failed to load customer details. Please try again.',
            });
          }

          if (ordersResult.status === 'fulfilled') {
            setOrders(ordersResult.value || []);
          } else {
            console.error(
              'Failed to load customer orders:',
              ordersResult.reason
            );
            setOrdersError('Failed to load order history.');
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
            setIsLoadingOrders(false);
          }
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, mode, customerId]);

  const handleOrderClick = (order: Order) => {
    setIsOpen(false);
    router.push(`/orders?orderId=${order.id}`);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setMobile(formatMobileNumber(raw));
    if (errors.mobile) {
      setErrors((prev) => ({ ...prev, mobile: undefined }));
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleBirthDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setBirthDay(formatted);
    if (errors.birthDay) {
      setErrors((prev) => ({ ...prev, birthDay: undefined }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      setBirthDay(`${day}/${month}/${year}`);
      if (errors.birthDay) {
        setErrors((prev) => ({ ...prev, birthDay: undefined }));
      }
    } else {
      setBirthDay('');
    }
    setIsCalendarOpen(false);
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required (at least 2 characters).';
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits.';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (birthDay.trim()) {
      const parsed = parseDateFromDDMMYYYY(birthDay);
      if (!parsed) {
        newErrors.birthDay = 'Please enter a valid date in dd/MM/yyyy format.';
      } else if (parsed > new Date()) {
        newErrors.birthDay = 'Date of birth cannot be in the future.';
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
      const cleanMobile = mobile.replace(/\D/g, '');
      let isoBirthDay: string | null = null;

      if (birthDay.trim()) {
        const parsed = parseDateFromDDMMYYYY(birthDay);
        if (parsed) {
          isoBirthDay = new Date(
            Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
          ).toISOString();
        }
      }

      const payload: CustomerFormData = {
        fullName: fullName.trim(),
        mobile: cleanMobile,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        birthDay: isoBirthDay,
        note: note.trim() || undefined,
      };

      if (mode === 'edit' && customerId) {
        await updateCustomerAction(customerId, payload);
      } else {
        await saveCustomerAction(payload);
      }

      setIsOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      console.error('Failed to save customer:', err);
      setErrors({
        form: 'Failed to save customer. Please check your information and try again.',
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
            <UserPlus className="h-4 w-4" />
            <span>Add Customer</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className={cn(
          'max-w-md sm:max-w-lg',
          mode === 'edit' &&
            'max-h-[90vh] overflow-y-auto sm:max-w-3xl lg:max-w-4xl'
        )}
      >
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-xl font-semibold">
              {mode === 'edit' ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            {mode === 'edit' && customerCode && (
              <Badge variant="secondary" className="font-mono text-xs">
                {customerCode}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {mode === 'edit'
              ? 'Update the client profile details below.'
              : 'Enter customer contact details to create a new profile.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm">Loading customer information...</p>
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
                htmlFor="customer-fullName"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="customer-fullName"
                placeholder="e.g. Nguyen Van A"
                value={fullName}
                onChange={handleFullNameChange}
                disabled={isSaving}
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && (
                <p className="text-[11px] text-destructive">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="customer-mobile"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                >
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <Input
                  id="customer-mobile"
                  placeholder="0901 234 567"
                  value={mobile}
                  onChange={handleMobileChange}
                  disabled={isSaving}
                  maxLength={12} // 10 digits + 2 spaces
                  className={errors.mobile ? 'border-destructive' : ''}
                />
                {errors.mobile && (
                  <p className="text-[11px] text-destructive">
                    {errors.mobile}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="customer-birthDay"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground"
                >
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Date of Birth
                </label>
                <div className="relative flex items-center">
                  <Input
                    id="customer-birthDay"
                    placeholder="dd/MM/yyyy (e.g. 25/08/2011)"
                    value={birthDay}
                    onChange={handleBirthDayChange}
                    disabled={isSaving}
                    maxLength={10}
                    className={cn(
                      'pr-10',
                      errors.birthDay && 'border-destructive'
                    )}
                  />
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isSaving}
                        aria-label="Open calendar"
                        className="absolute right-0 h-full w-9 rounded-l-none text-muted-foreground hover:text-foreground"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        captionLayout="dropdown"
                        selected={selectedDate || undefined}
                        defaultMonth={
                          selectedDate ||
                          new Date(new Date().getFullYear() - 25, 0)
                        }
                        onSelect={handleDateSelect}
                        startMonth={new Date(1900, 0)}
                        endMonth={new Date()}
                        disabled={{ after: new Date() }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.birthDay && (
                  <p className="text-[11px] text-destructive">
                    {errors.birthDay}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="customer-email"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email
              </label>
              <Input
                id="customer-email"
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={handleEmailChange}
                disabled={isSaving}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-[11px] text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="customer-address"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Address
              </label>
              <Input
                id="customer-address"
                placeholder="123 Street Name, District, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="customer-note"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Note
              </label>
              <textarea
                id="customer-note"
                rows={3}
                placeholder="Preferences, allergy alerts, styling notes..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isSaving}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {mode === 'edit' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      Order History
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {orders.length}
                    </Badge>
                  </div>
                </div>

                {isLoadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="mt-2 text-xs">Loading order history...</p>
                  </div>
                ) : ordersError ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    {ordersError}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">
                            Order Code
                          </TableHead>
                          <TableHead className="w-[110px]">
                            Order Date
                          </TableHead>
                          <TableHead className="w-[130px]">Status</TableHead>
                          <TableHead>Note</TableHead>
                          <TableHead className="w-[120px] text-right">
                            Amount
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.length > 0 ? (
                          orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                <button
                                  type="button"
                                  onClick={() => handleOrderClick(order)}
                                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-all duration-150 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden"
                                  title="Click to view order details"
                                >
                                  <span>{order.code}</span>
                                  <Pencil className="h-3 w-3 opacity-70 transition-opacity" />
                                </button>
                              </TableCell>
                              <TableCell>
                                {formatDateToDDMMYYYY(order.orderDate)}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={order.status} />
                              </TableCell>
                              <TableCell
                                className="max-w-[200px] truncate"
                                title={order.description || ''}
                              >
                                {order.description || '-'}
                              </TableCell>
                              <TableCell className="text-right font-medium">
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
                              className="py-6 text-center text-xs text-muted-foreground"
                            >
                              No order history found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

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
                {mode === 'edit' ? 'Save Changes' : 'Save Customer'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AddCustomerDialog({ trigger }: { trigger?: React.ReactNode }) {
  return <CustomerFormDialog mode="create" trigger={trigger} />;
}
