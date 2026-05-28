import * as React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import styles from './RecentOrdersList.module.css';

type OrderWithProduct = {
  id: string;
  status: string;
  amount: number;
  buyerEmail: string | null;
  createdAt: Date;
  product: {
    name: string;
  };
};

export function RecentOrdersList({ orders }: { orders: OrderWithProduct[] }) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className={styles.empty}>
          <p>No orders yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <div className={styles.list}>
        {orders.map((order) => (
          <div key={order.id} className={styles.row}>
            <div className={styles.info}>
              <p className={styles.productName}>{order.product.name}</p>
              <p className={styles.buyer}>{order.buyerEmail || 'Anonymous'}</p>
            </div>
            <div className={styles.details}>
              <p className={styles.amount}>{formatPrice(order.amount)}</p>
              <Badge variant={order.status === 'paid' ? 'success' : order.status === 'failed' ? 'danger' : 'secondary'}>
                {order.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
