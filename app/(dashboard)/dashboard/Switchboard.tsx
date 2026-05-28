"use client";

import * as React from 'react';
import { useDashboardTab } from '../DashboardTabContext';

export default function Switchboard({
  dashboard,
  products,
  orders,
}: {
  dashboard: React.ReactNode;
  products: React.ReactNode;
  orders: React.ReactNode;
}) {
  const { tab } = useDashboardTab();

  return (
    <>
      {tab === 'dashboard' && dashboard}
      {tab === 'products' && products}
      {tab === 'orders' && orders}
    </>
  );
}
