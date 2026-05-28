"use client";

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

export type Tab = 'dashboard' | 'products' | 'orders';

type TabContextType = {
  tab: Tab;
  setTab: (tab: Tab) => void;
};

const TabContext = React.createContext<TabContextType | null>(null);

function TabSync({ setTab }: { setTab: (tab: Tab) => void }) {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab') as Tab;
  
  React.useEffect(() => {
    if (urlTab && ['dashboard', 'products', 'orders'].includes(urlTab)) {
      setTab(urlTab);
    } else {
      setTab('dashboard');
    }
  }, [urlTab, setTab]);

  return null;
}

export function DashboardTabProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = React.useState<Tab>('dashboard');

  return (
    <TabContext.Provider value={{ tab, setTab }}>
      <React.Suspense fallback={null}>
        <TabSync setTab={setTab} />
      </React.Suspense>
      {children}
    </TabContext.Provider>
  );
}

export function useDashboardTab() {
  const ctx = React.useContext(TabContext);
  if (!ctx) throw new Error('useDashboardTab must be used within DashboardTabProvider');
  return ctx;
}
