import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './auth-layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <main className={styles.main}>
        <div className={styles.logo}>
          <Link href="/">
            <Image src="/logo.svg" alt="SellSnap" width={160} height={43} />
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}