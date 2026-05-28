import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './Skeleton.module.css';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
};

export function Skeleton({ className, variant = 'rectangular', width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        styles.skeleton,
        styles[variant],
        className,
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}
