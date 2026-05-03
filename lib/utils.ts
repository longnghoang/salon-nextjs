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
