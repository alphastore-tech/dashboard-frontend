/*
 * OverviewPage.tsx – 투자 전략 홈 (목 데이터)
 * ---------------------------------------------------
 * Sections
 * 1. Summary & Asset Allocation (2-cols grid)
 * 2. Portfolio Growth (AreaChart)
 * 3. Strategy (StrategyCard)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import StrategyCard from '@/components/StrategyCard';
import { strategies } from '@/components/strategyList';
import { PieChart, Pie, Cell, Tooltip as RechartTooltip, ResponsiveContainer } from 'recharts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
// ────────────────────────────────────────────────────────────
// 📊   MOCK DATA
// ────────────────────────────────────────────────────────────
const summary = {
  totalAmount: 13_617_690,
  totalPnlAmt: 2_447_572,
  totalPnlPct: 21.95,
  todayPnlAmt: 0,
  todayPnlPct: 0,
};

const allocationStock = [
  { name: '가치투자', value: 28.4 },
  { name: '주식선물차익거래', value: 18.2 },
  { name: '상한가따라잡기', value: 23.4 },
];

const growthData = Array.from({ length: 60 }).map((_, i) => ({
  day: i,
  value: 100 + Math.sin(i / 5) * 5 + i * 0.8,
}));

const PIE_COLORS = [
  '#1e40af',
  '#dc2626',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#db2777',
  '#0891b2',
  '#65a30d',
  '#ea580c',
  '#4338ca',
];

const fmtCur = (n: number) => `₩${n.toLocaleString()}`;
const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
const color = (n: number) => (n >= 0 ? 'text-rose-600' : 'text-blue-600');
// ────────────────────────────────────────────────────────────
// 🖼️   PAGE COMPONENT
// ────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const [viewAs, setViewAs] = useState<'cards' | 'table'>('cards');

  return (
    <main className="mx-auto max-w-7xl p-8 space-y-10">
      <h1 className="text-3xl font-bold">안태찬님의 투자 전략</h1>

      {/* 1️⃣ Summary + Allocation */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Summary */}
        <section className="rounded-xl border border-border bg-white p-6 space-y-6 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-xl font-semibold">Summary</h2>
          <div>
            <p className="text-sm text-slate-500">Total Amount</p>
            <p className="mt-1 text-4xl font-bold">{fmtCur(summary.totalAmount)}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className={`${color(summary.totalPnlPct)} font-medium`}>
                {fmtPct(summary.totalPnlPct)}
              </span>
              <span className={`${color(summary.totalPnlAmt)} font-medium`}>
                +{fmtCur(summary.totalPnlAmt)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Today PNL */}
            <div>
              <p className="text-sm text-slate-500">Today PNL</p>
              <p className="mt-1 text-2xl font-bold {color(summary.todayPnlAmt)}">
                {fmtCur(summary.todayPnlAmt)}
              </p>
              <p className={`text-sm ${color(summary.todayPnlPct)}`}>
                {fmtPct(summary.todayPnlPct)}
              </p>
            </div>
            {/* Total PNL */}
            <div>
              <p className="text-sm text-slate-500">Total PNL</p>
              <p className="mt-1 text-2xl font-bold {color(summary.totalPnlAmt)}">
                +{fmtCur(summary.totalPnlAmt)}
              </p>
              <p className={`text-sm ${color(summary.totalPnlPct)}`}>
                {fmtPct(summary.totalPnlPct)}
              </p>
            </div>
          </div>
        </section>

        {/* Allocation */}
        <section className="rounded-xl border border-border bg-white p-6 space-y-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Asset Allocation</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={allocationStock}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {allocationStock.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartTooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* 2️⃣ Portfolio Growth */}
      <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold">Portfolio Growth</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <AreaChart data={growthData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.05} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#059669"
                fill="url(#growthGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4️⃣ Strategy */}
      <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Strategy</h2>
          <div className="inline-flex overflow-hidden rounded-md border text-sm">
            <button
              onClick={() => setViewAs('cards')}
              className={`px-3 py-1 ${viewAs === 'cards' ? 'bg-slate-100 font-semibold' : 'bg-white'} transition-colors`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewAs('table')}
              className={`px-3 py-1 ${viewAs === 'table' ? 'bg-slate-100 font-semibold' : 'bg-white'} transition-colors`}
            >
              Table
            </button>
          </div>
        </div>

        {viewAs === 'cards' && (
          <div className="grid grid-cols-2 gap-4">
            {strategies.slice(0, 4).map((s) => (
              <StrategyCard key={s.id} strategy={s} />
            ))}
          </div>
        )}

        {viewAs === 'table' && <p className="text-sm text-slate-500">테이블 뷰는 준비 중입니다.</p>}
      </section>
    </main>
  );
}
