import * as React from 'react';
import Image from 'next/image';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SignOutButton } from './SignOutButton';
import { UserMenu } from './UserMenu';
import { NavLinks } from './NavLinks';
import { LogoLink } from './LogoLink';
import { MobileSidebar } from './MobileSidebar';
import { DashboardTabProvider } from './DashboardTabContext';
import styles from './layout.module.css';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth');
  }

  const userName = session.user?.name ?? '';
  const userEmail = session.user?.email ?? '';
  const initials = getInitials(userName) || userEmail.charAt(0).toUpperCase();

  return (
    <DashboardTabProvider>
      <div className={styles.root}>
        {/* Desktop sidebar — hidden on mobile */}
        <aside className={styles.sidebar}>
          <LogoLink className={styles.logo}>
            <div className={styles.logoImageWrapper}>
              <Image src="/logo.svg" alt="SellSnap" width={160} height={43} />
            </div>
          </LogoLink>
          <nav className={styles.nav}>
            <NavLinks />
          </nav>
          <div className={styles.userSection}>
            <UserMenu 
              userName={userName}
              userEmail={userEmail}
              initials={initials}
              signOutButton={<SignOutButton />}
            />
          </div>
        </aside>

        {/* Mobile header + drawer — hidden on desktop */}
        <MobileSidebar
          userName={userName}
          userEmail={userEmail}
          initials={initials}
          signOutButton={<SignOutButton />}
        />

        <main className={styles.main}>
          {children}
        </main>
      </div>
    </DashboardTabProvider>
  );
}