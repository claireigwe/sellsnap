import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './ProductCardSkeleton.module.css';

export function ProductCardSkeleton() {
  return (
    <Card className={styles.card}>
      <div className={styles.imageWrapper}>
        <Skeleton className={styles.image} />
      </div>
      <CardContent className={styles.content}>
        <div className={styles.info}>
          <Skeleton variant="text" className={styles.name} />
          <Skeleton variant="text" className={styles.description} />
          <Skeleton variant="text" className={styles.price} />
        </div>
        <div className={styles.actionBar}>
          <Skeleton className={styles.button} />
          <Skeleton className={styles.iconButton} />
        </div>
      </CardContent>
    </Card>
  );
}
