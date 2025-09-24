'use client';

import RealizedPnlTable from '@/components/RealizedPnlTable';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useDailyPeriodPnl, useMonthlyPeriodPnl } from '@/hooks/usePeriodPnl';
import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ResponsiveContainer } from 'recharts';

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

const columns = [
  { key: 'date', label: '날짜', align: 'left' as const },
  { key: 'totalPnl', label: '총 손익', align: 'right' as const },
  { key: 'stockPnl', label: '주식 손익', align: 'right' as const },
  { key: 'futurePnl', label: '선물 손익', align: 'right' as const },
  { key: 'tradeCount', label: '거래 횟수', align: 'right' as const },
  { key: 'contangoCount', label: '콘탱고 횟수', align: 'right' as const },
  { key: 'backCount', label: '백워데이션 횟수', align: 'right' as const },
  { key: 'cashFlow', label: '입출금', align: 'right' as const },
];

const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
const color = (n: number) => (n >= 0 ? 'text-rose-600' : 'text-blue-600');

export default function Performance() {
  const [view, setView] = useState<'Daily' | 'Monthly'>('Daily');

  const { data: analysisMetrics } = useAnalysis();

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 80);
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
    return { startDate: fmt(start), endDate: fmt(end) };
  }, []);

  const {
    data: dailyApiData = [],
    isLoading: dailyLoading,
    error: dailyError,
  } = useDailyPeriodPnl();

  const {
    data: monthlyApiData = [],
    isLoading: monthlyLoading,
    error: monthlyError,
  } = useMonthlyPeriodPnl();

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold">Analysis (Mock)</h2>
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 sm:grid-cols-3 md:grid-cols-5">
          {analysisMetrics.map((m) => (
            <div key={m.label} className="text-center md:text-left">
              <p className="text-sm text-slate-500">{m.label}</p>
              <p className="mt-1 text-lg font-semibold">{m.value}</p>
            </div>
          ))}
        </div>
      </section>

      <RealizedPnlTable
        data={view === 'Daily' ? dailyApiData : monthlyApiData}
        columns={columns}
        view={view}
        setView={setView}
        loading={view === 'Daily' ? dailyLoading : monthlyLoading}
        error={view === 'Daily' ? dailyError : monthlyError}
      />

      <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold">Growth (Mock)</h2>
        <div className="h-48 sm:h-64 w-full">
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

      <section className="rounded-xl border border-border bg-white shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold">Monthly Details by Year (Mock)</h2>
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
    </main>
  );
}
