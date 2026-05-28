import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import styles from './page.module.css';

export default async function LandingPage() {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className={styles.root}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logo}>
            <Image src="/logo.svg" alt="SellSnap" width={160} height={43} />
          </div>
          <h1 className={styles.headline}>
            <span>Sell in seconds.</span>
            <span>One link is all it takes</span>
          </h1>
          <p className={styles.subheadline}>
            Upload your product, get a link, share and get paid instantly.
          </p>
          <div className={styles.ctas}>
            <Link href="/auth?mode=signup" className={styles.primaryCta}>Get Started</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
