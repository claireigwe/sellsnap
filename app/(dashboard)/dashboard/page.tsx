import * as React from 'react';
import DashboardView from './views/DashboardView';
import ProductsView from './views/ProductsView';
import OrdersView from './views/OrdersView';
import Switchboard from './Switchboard';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageParam = params.page;
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;

  return (
    <Switchboard
      dashboard={<DashboardView />}
      products={<ProductsView />}
      orders={<OrdersView page={page} />}
    />
  );
}
