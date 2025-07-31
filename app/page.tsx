/*
 * OverviewPage.tsx – 투자 전략 홈 (목 데이터)
 * ---------------------------------------------------
 * Sections
 * 1. Summary & Asset Allocation (2-cols grid)
 * 2. Growth (AreaChart)
 * 3. Strategy (StrategyCard)
 */

'use client';

import { useState, useMemo } from 'react';
import StrategyCard from '@/components/StrategyCard';
import SummarySection from '@/components/SummarySection';
import AssetAllocationSection from '@/components/AssetAllocationSection';
import { strategies } from '@/components/strategyList';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
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

// Mock holdings data
const mockHoldings = [
  { symbol: '국내 장기 투자', amount: 3_200_000, currency: 'KRW' },
  { symbol: '해외 장기 투자', amount: 2_800, currency: 'USD' },
  { symbol: '국내 주식 선물 차익거래', amount: 1_900_000, currency: 'KRW' },
];

// Mock currency exchange rates
const exchangeRates = {
  USD: 1350, // 1 USD = 1350 KRW
  KRW: 1,
};

const analysisMetrics = [
  { label: 'Total Return', value: '37.77%' },
  { label: 'CAGR(Annualized)', value: '20.09' },
  { label: 'Max Drawdown', value: '-10.60%' },
  { label: 'Volatility', value: '3.53' },
  { label: 'Sharpe Ratio', value: '1.25' },
];

const growthData = Array.from({ length: 60 }).map((_, i) => ({
  day: i,
  value: 100 + Math.sin(i / 5) * 5 + i * 0.8,
}));

const MONTHLY_MOCK = [
  {
    year: 2025,
    months: [-8.31, 8.69, 9.48, -5.26, 12.34, 11.73, -3.22, -8.91, 3.59, 2.05, 9.21, 11.4],
    annual: 40.0,
  },
  {
    year: 2024,
    months: [2.39, 12.96, -0.61, -3.32, 12.25, 3.44, -8.11, -4.76, -1.05, -5.46, 9.59, 7.3],
    annual: 22.33,
  },
  {
    year: 2023,
    months: [1.6, -9.63, -0.2, 1.56, 12.54, -1.92, 0.57, -1.65, -2.69, -8.16, 2.05, 5.38],
    annual: -3.13,
  },
  {
    year: 2022,
    months: [13.4, 11.25, 5.91, -4.72, 0.42, 10.99, 7.94, 14.24, 6.12, -6.9, 4.61, 7.13],
    annual: 40.0,
  },
];

const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
const color = (n: number) => (n >= 0 ? 'text-rose-600' : 'text-blue-600');
// ────────────────────────────────────────────────────────────
// 🖼️   PAGE COMPONENT
// ────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const [viewAs, setViewAs] = useState<'cards' | 'table'>('cards');
  const [viewMode, setViewMode] = useState<'holdings' | 'currency'>('holdings');

  // Calculate allocation data based on viewMode
  const allocationData = useMemo(() => {
    if (viewMode === 'currency') {
      // Group by currency and calculate total amounts
      const currencyTotals: Record<string, number> = {};

      mockHoldings.forEach((holding) => {
        const amountInKRW =
          holding.amount * exchangeRates[holding.currency as keyof typeof exchangeRates];
        currencyTotals[holding.currency] = (currencyTotals[holding.currency] || 0) + amountInKRW;
      });

      const totalAmount = Object.values(currencyTotals).reduce((sum, amount) => sum + amount, 0);

      return Object.entries(currencyTotals).map(([currency, amount]) => ({
        name: currency,
        value: totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(2)) : 0,
      }));
    } else {
      // Group by holdings (stock symbols)
      const totalAmount = mockHoldings.reduce((sum, holding) => {
        const amountInKRW =
          holding.amount * exchangeRates[holding.currency as keyof typeof exchangeRates];
        return sum + amountInKRW;
      }, 0);

      return mockHoldings.map((holding) => {
        const amountInKRW =
          holding.amount * exchangeRates[holding.currency as keyof typeof exchangeRates];
        return {
          name: holding.symbol,
          value: totalAmount > 0 ? Number(((amountInKRW / totalAmount) * 100).toFixed(2)) : 0,
        };
      });
    }
  }, [viewMode]);

  return (
    <main className="mx-auto max-w-7xl p-8 space-y-10">
      <h1 className="text-3xl font-bold">안태찬님의 투자 전략</h1>

      {/* 1️⃣ Summary + Allocation */}
      <div className="grid gap-6 md:grid-cols-2">
        <SummarySection data={summary} />
        <AssetAllocationSection
          data={allocationData}
          title="Strategy Allocation"
          viewMode={viewMode}
          onViewModeChange={setViewMode as any}
          showViewToggle={true}
          viewModeGroup="group2"
        />
      </div>

      {/* 2️⃣ Portfolio Analysis */}
      <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold">Analysis</h2>
        {/* 주요 지표 5-col 그리드 */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 sm:grid-cols-3 md:grid-cols-5">
          {analysisMetrics.map((m) => (
            <div key={m.label} className="text-center md:text-left">
              <p className="text-sm text-slate-500">{m.label}</p>
              <p className="mt-1 text-lg font-semibold">{m.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2️⃣ Growth */}
      <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold">Growth</h2>
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

      {/* 4️⃣ Monthly Details by Year */}
      <section className="rounded-xl border border-border bg-white shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold">Monthly Details by Year</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm tracking-tight">
            <thead className="text-slate-500 border-b">
              <tr>
                <th className="px-4 py-2 text-left">년도</th>
                {[
                  '1월',
                  '2월',
                  '3월',
                  '4월',
                  '5월',
                  '6월',
                  '7월',
                  '8월',
                  '9월',
                  '10월',
                  '11월',
                  '12월',
                ].map((m) => (
                  <th key={m} className="px-4 py-2 text-right">
                    {m}
                  </th>
                ))}
                <th className="px-4 py-2 text-right">ANNUAL</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_MOCK.map((row) => (
                <tr key={row.year} className="border-b last:border-0">
                  <td className="px-4 py-2 font-semibold text-black-600">{row.year}</td>
                  {row.months.map((v, idx) => (
                    <td
                      key={idx}
                      className={`px-4 py-2 text-right ${Math.abs(v) > 15 ? 'font-semibold' : Math.abs(v) > 10 ? 'font-medium' : 'font-light'} ${color(v)}`}
                    >
                      {fmtPct(v)}
                    </td>
                  ))}
                  <td className={`px-4 py-2 text-right font-semibold ${color(row.annual)}`}>
                    {fmtPct(row.annual)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
