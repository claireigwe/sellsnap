import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './StatCardSkeleton.module.css';

export function StatCardSkeleton() {
  return (
    <Card className={styles.card}>
      <CardContent className={styles.content}>
        <Skeleton variant="text" className={styles.title} />
        <Skeleton variant="text" className={styles.value} />
      </CardContent>
    </Card>
  );
}
