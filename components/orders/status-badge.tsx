'use client';

import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types/order';
import { cn } from '@/lib/utils';
import { getStatusName } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
  statusName?: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.New:
        return 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case OrderStatus.InProgress:
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case OrderStatus.Completed:
        return 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case OrderStatus.Deleted:
        return 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', getStatusStyles(status), className)}
    >
      {getStatusName(status)}
    </Badge>
  );
}
