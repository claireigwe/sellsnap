import * as React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { StatCard } from '@/components/features/StatCard';
import { RecentOrdersList } from '@/components/features/RecentOrdersList';
import { SalesChart } from '@/components/features/SalesChart';
import { AutoRefresh } from '@/components/features/AutoRefresh';
import { Card } from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';
import { cn, formatPrice } from '@/lib/utils';
import styles from '../page.module.css';

export default async function DashboardView() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return null;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [productsCount, orders, paidOrders, totalViewsAgg, recentPaidOrders] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.order.findMany({
      where: { product: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { product: true },
    }),
    prisma.order.aggregate({
      where: { product: { userId }, status: 'paid' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.product.aggregate({
      where: { userId },
      _sum: { views: true },
    }),
    prisma.order.findMany({
      where: { 
        product: { userId }, 
        status: 'paid',
        createdAt: { gte: sevenDaysAgo }
      },
      select: { amount: true, createdAt: true },
    })
  ]);

  const totalRevenueKobo = paidOrders._sum.amount || 0;
  const totalSalesCount = paidOrders._count || 0;
  const totalViews = totalViewsAgg._sum.views || 0;
  
  const conversionRate = totalViews > 0 ? ((totalSalesCount / totalViews) * 100).toFixed(1) : '0.0';

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartDataMap = new Map<string, number>();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = days[d.getDay()];
    chartDataMap.set(dayStr, 0);
  }

  recentPaidOrders.forEach((order: { amount: number; createdAt: Date }) => {
    const dayStr = days[order.createdAt.getDay()];
    const current = chartDataMap.get(dayStr) || 0;
    chartDataMap.set(dayStr, current + (order.amount / 100));
  });

  const chartData = Array.from(chartDataMap.entries()).map(([date, sales]) => ({
    date,
    sales
  }));

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.actions}>
          <Link href="/products/new" className={cn(buttonVariants({ variant: 'primary' }))}>
            Add New Product
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard title="Total Revenue" value={formatPrice(totalRevenueKobo)} />
        <StatCard title="Total Sales" value={totalSalesCount.toString()} />
        <StatCard title="Total Views" value={totalViews.toString()} />
        <StatCard title="Conversion Rate" value={`${conversionRate}%`} />
      </div>

      <Card className={styles.chartSection}>
        <h2 className={styles.sectionTitle}>Sales Trend (Last 7 Days)</h2>
        <SalesChart data={chartData} />
      </Card>

      <Card className={styles.recentOrders}>
        <h2 className={styles.sectionTitle}>Recent Orders</h2>
        <RecentOrdersList orders={orders} />
      </Card>

      <AutoRefresh />
    </div>
  );
}
