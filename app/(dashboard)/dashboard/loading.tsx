import { Skeleton } from '@/components/ui/Skeleton';
import styles from './loading.module.css';

export default function DashboardLoading() {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Skeleton variant="text" className={styles.title} />
        <Skeleton className={styles.button} />
      </div>

      <div className={styles.statsGrid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.statCard}>
            <Skeleton variant="text" className={styles.statTitle} />
            <Skeleton variant="text" className={styles.statValue} />
          </div>
        ))}
      </div>

      <div className={styles.recentOrders}>
        <Skeleton variant="text" className={styles.sectionTitle} />
        <div className={styles.ordersCard}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.orderRow}>
              <div className={styles.orderInfo}>
                <Skeleton variant="text" className={styles.orderProduct} />
                <Skeleton variant="text" className={styles.orderBuyer} />
              </div>
              <div className={styles.orderDetails}>
                <Skeleton variant="text" className={styles.orderAmount} />
                <Skeleton className={styles.orderBadge} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
