import * as React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth');
  }

  return <>{children}</>;
}
