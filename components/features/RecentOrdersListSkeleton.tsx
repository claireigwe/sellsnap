import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './RecentOrdersListSkeleton.module.css';

export function RecentOrdersListSkeleton() {
  return (
    <Card className={styles.card}>
      <div className={styles.list}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.row}>
            <div className={styles.info}>
              <Skeleton variant="text" className={styles.productName} />
              <Skeleton variant="text" className={styles.buyer} />
            </div>
            <div className={styles.details}>
              <Skeleton variant="text" className={styles.amount} />
              <Skeleton className={styles.badge} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
