import * as React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import styles from './StatCard.module.css';

export function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className={styles.card}>
      <CardContent className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{value}</p>
      </CardContent>
    </Card>
  );
}
