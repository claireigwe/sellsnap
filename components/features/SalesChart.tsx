'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DataPoint = {
  date: string;
  sales: number;
};

export function SalesChart({ data }: { data: DataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-surface-variant)', background: 'var(--color-surface)', borderRadius: 16 }}>
        No sales data for the last 7 days.
      </div>
    );
  }

  return (
    <div style={{ height: 300, width: '100%', background: 'var(--color-surface)', borderRadius: 16, padding: '24px 16px 16px 0', border: '1px solid var(--color-outline-variant)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12, fontFamily: 'var(--body-medium-font-family)' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12, fontFamily: 'var(--body-medium-font-family)' }}
            dx={0}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', borderRadius: 8, border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)', fontFamily: 'var(--body-medium-font-family)' }}
            itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
            formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Sales']}
          />
          <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
