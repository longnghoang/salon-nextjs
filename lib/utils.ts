import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OrderStatus } from '@/types/order';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusName = (status: number): string => {
  switch (status) {
    case OrderStatus.InProgress:
      return 'Ghi nợ';
    case OrderStatus.Completed:
      return 'Đã thanh toán';
    case OrderStatus.Deleted:
      return 'Đã trả lại';
    default:
      return 'Chờ thanh toán';
  }
};

export function formatDateTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}
