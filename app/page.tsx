import { auth } from '@/auth';
import { getOrders } from '@/lib/api/orderApi';
import { getCustomers } from '@/lib/api/customerApi';
import { toLocalDateString } from '@/lib/utils';
import { OrderStatus } from '@/types/order';
import { DashboardHeader } from '@/components/salon/dashboard/dashboard-header';
import { MetricCard } from '@/components/salon/dashboard/metric-card';
import { RecentOrders } from '@/components/salon/dashboard/recent-orders';
import { RecentCustomers } from '@/components/salon/dashboard/recent-customers';

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

export default async function SalonDashboard() {
  const today = new Date();
  const todayStr = toLocalDateString(today);

  const [
    session,
    todayOrdersResult,
    recentOrdersResult,
    recentCustomersResult,
  ] = await Promise.all([
    auth().catch(() => null),
    getOrders({
      startDate: todayStr,
      endDate: todayStr,
      pageSize: 100,
    }).catch(() => ({ items: [] })),
    getOrders({
      pageSize: 5,
    }).catch(() => ({ items: [] })),
    getCustomers({
      pageSize: 5,
    }).catch(() => ({ items: [] })),
  ]);

  const todayOrders = todayOrdersResult?.items || [];
  const recentOrders = recentOrdersResult?.items || [];
  const recentCustomers = recentCustomersResult?.items || [];

  const todayRevenue = todayOrders
    .filter((order) => order.status !== OrderStatus.Deleted)
    .reduce(
      (sum, order) => sum + (order.paymentAmount || order.amount || 0),
      0
    );

  const completedOrdersCount = todayOrders.filter(
    (order) => order.status === OrderStatus.Completed
  ).length;

  const newCustomersToday = recentCustomers.filter((customer) => {
    if (!customer.createdDateTime) return false;
    const createdDate = toLocalDateString(new Date(customer.createdDateTime));
    return createdDate === todayStr;
  }).length;

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-10 duration-700 fade-in slide-in-from-bottom-2">
      {/* Header Section */}
      <DashboardHeader userName={session?.user?.name} />

      {/* Metrics Section */}
      <section className="grid grid-cols-1 gap-8 py-2 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
        <MetricCard
          title="Today's Revenue"
          value={formatCurrency(todayRevenue)}
          trend={
            todayOrders.length > 0
              ? `${completedOrdersCount}/${todayOrders.length} completed`
              : 'No orders yet'
          }
          trendUp={todayRevenue > 0 ? true : null}
        />
        <MetricCard
          title="Today's Orders"
          value={String(todayOrders.length)}
          trend={
            todayOrders.length > 0
              ? `${todayOrders.length - completedOrdersCount} pending payment`
              : 'No active orders'
          }
          trendUp={null}
        />
        <MetricCard
          title="New Customers"
          value={String(newCustomersToday)}
          trend="Registered today"
          trendUp={newCustomersToday > 0 ? true : null}
        />
      </section>

      {/* Main Operational Feed Section */}
      <section className="grid grid-cols-1 gap-8 border-t border-border/40 pt-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RecentOrders orders={recentOrders} />
        </div>
        <div className="lg:col-span-5">
          <RecentCustomers customers={recentCustomers} />
        </div>
      </section>
    </div>
  );
}
