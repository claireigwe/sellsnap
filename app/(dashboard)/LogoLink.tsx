"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardTab } from './DashboardTabContext';

export function LogoLink({ children, className }: { children: React.ReactNode; className?: string }) {
  const router = useRouter();
  const { setTab } = useDashboardTab();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    setTab('dashboard');
    router.push('/dashboard');
  }

  return (
    <a href="/dashboard" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
