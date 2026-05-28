"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './UserMenu.module.css';

interface UserMenuProps {
  userName: string;
  userEmail: string;
  initials: string;
  signOutButton: React.ReactNode;
}

export function UserMenu({ userName, userEmail, initials, signOutButton }: UserMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.container} ref={menuRef}>
      {/* Popover Menu */}
      <div className={cn(styles.popover, isOpen && styles.popoverOpen)}>
        <div className={styles.popoverHeader}>
          <span className={styles.popoverName}>{userName}</span>
          <span className={styles.popoverEmail}>{userEmail}</span>
        </div>
        <div className={styles.popoverDivider} />
        <div className={styles.signOutWrapper} onClick={() => setIsOpen(false)}>
          {signOutButton}
        </div>
      </div>

      {/* Trigger Button */}
      <button 
        className={cn(styles.trigger, isOpen && styles.triggerActive)}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userEmail}>{userEmail}</span>
        </div>
        <svg 
          className={cn(styles.chevron, isOpen && styles.chevronRotated)} 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </button>
    </div>
  );
}
