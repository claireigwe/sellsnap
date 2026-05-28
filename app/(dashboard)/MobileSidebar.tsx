"use client";

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './layout.module.css';
import { useDashboardTab } from './DashboardTabContext';

type MobileSidebarProps = {
  userName: string;
  userEmail: string;
  initials: string;
  signOutButton: React.ReactNode;
};

const links = [
  {
    key: 'dashboard' as const,
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1"></rect>
        <rect x="14" y="3" width="7" height="5" rx="1"></rect>
        <rect x="14" y="12" width="7" height="9" rx="1"></rect>
        <rect x="3" y="16" width="7" height="5" rx="1"></rect>
      </svg>
    ),
  },
  {
    key: 'products' as const,
    label: 'Products',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    ),
  },
  {
    key: 'orders' as const,
    label: 'Orders',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    ),
  },
];

export function MobileSidebar({ userName, userEmail, initials, signOutButton }: MobileSidebarProps) {
  const { tab, setTab } = useDashboardTab();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [tab]);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className={styles.mobileHeader}>
        <a href="/dashboard" className={styles.mobileLogo} onClick={(e) => { e.preventDefault(); setTab('dashboard'); router.push('/dashboard'); }}>
          <Image src="/logo.svg" alt="SellSnap" width={120} height={32} />
        </a>
        <button
          className={styles.hamburger}
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {open && (
        <div
          className={styles.overlay}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <a href="/dashboard" className={styles.mobileLogo} onClick={(e) => { e.preventDefault(); setTab('dashboard'); router.push('/dashboard'); }}>
            <Image src="/logo.svg" alt="SellSnap" width={120} height={32} />
          </a>
          <button
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {links.map(link => (
            <button
              key={link.key}
              onClick={() => { setTab(link.key); setOpen(false); }}
              className={`${styles.navLink} ${tab === link.key ? styles.navLinkActive : ''}`}
            >
              <span className={styles.navIcon}>{link.icon}</span>
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userEmail}>{userEmail}</span>
            </div>
          </div>
          <div className={styles.signOut}>{signOutButton}</div>
        </div>
      </aside>
    </>
  );
}
