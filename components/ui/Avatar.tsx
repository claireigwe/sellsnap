import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './Avatar.module.css';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  fallback: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, fallback, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.avatar, className)} {...props}>
        {src ? (
          <img src={src} alt="Avatar" className={styles.image} />
        ) : (
          <span className={styles.fallback}>{fallback}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
