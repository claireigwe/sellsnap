import * as React from 'react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { OrdersTable } from '@/components/features/OrdersTable';
import { AutoRefresh } from '@/components/features/AutoRefresh';
import { EmptyState } from '@/components/ui/EmptyState';
import styles from '../../orders/page.module.css';

export default async function OrdersView({ page = 1 }: { page?: number }) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) return null;

  const take = 10;
  const skip = (page - 1) * take;

  const orders = await prisma.order.findMany({
    where: { product: { userId } },
    orderBy: { createdAt: 'desc' },
    include: { product: true },
    take,
    skip,
  });

  const totalOrders = await prisma.order.count({
    where: { product: { userId } }
  });

  const totalPages = Math.ceil(totalOrders / take);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orders</h1>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Share your product links to start receiving orders."
        />
      ) : (
        <OrdersTable orders={orders} totalPages={totalPages} currentPage={page} />
      )}

      <AutoRefresh />
    </div>
  );
}
