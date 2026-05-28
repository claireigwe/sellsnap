import * as React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import styles from './OrdersTable.module.css';

type OrderWithProduct = {
  id: string;
  status: string;
  amount: number;
  buyerEmail: string | null;
  transactionReference: string;
  createdAt: Date;
  product: {
    name: string;
  };
};

export function OrdersTable({ 
  orders, 
  totalPages = 1, 
  currentPage = 1 
}: { 
  orders: OrderWithProduct[];
  totalPages?: number;
  currentPage?: number;
}) {
  return (
    <Card className={styles.card}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Product</th>
              <th>Buyer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className={styles.mono}>{order.transactionReference.slice(0, 12)}...</td>
                <td>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(order.createdAt)}</td>
                <td className={styles.bold}>{order.product.name}</td>
                <td>{order.buyerEmail || 'Anonymous'}</td>
                <td className={styles.bold}>{formatPrice(order.amount)}</td>
                <td>
                  <Badge variant={order.status === 'paid' ? 'success' : order.status === 'failed' ? 'danger' : 'secondary'}>
                    {order.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <div className={styles.pageControls}>
            {currentPage > 1 ? (
              <Link href={`/dashboard?tab=orders&page=${currentPage - 1}`} className={styles.pageBtn}>
                Previous
              </Link>
            ) : (
              <span className={styles.pageBtn} aria-disabled="true">Previous</span>
            )}
            
            {currentPage < totalPages ? (
              <Link href={`/dashboard?tab=orders&page=${currentPage + 1}`} className={styles.pageBtn}>
                Next
              </Link>
            ) : (
              <span className={styles.pageBtn} aria-disabled="true">Next</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
