'use client';
import DataTable from '@/components/DataTable';
import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import useKiwoomBalance from '@/hooks/useKiwoomBalance';
import { KiwoomBalanceItem } from '@/lib/kiwoom';
// ─────────────────────────────────────────────────────────────────────────────
// 📊   MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_SUMMARY = {
  totalAmount: 1_550_523.12,
  amountChange: 0,
  amountChangePct: 0,
  todayPnlAmt: 894.37,
  todayPnlPct: 0,
  totalPnlAmt: -894.37,
  totalPnlPct: 0,
};

const PI_CHART_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#8dd1e1',
  '#d0ed57',
  '#a4de6c',
];

// ─────────────────────────────────────────────────────────────────────────────
// 📚   HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) =>
  `₩${n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const fmtSignedCurrency = (n: number) =>
  `${n > 0 ? '+' : n < 0 ? '' : ''}${fmtCurrency(Math.abs(n))}`;

const fmtPct = (n: number) => `${n > 0 ? '+' : n < 0 ? '-' : ''}${Math.abs(n).toFixed(2)}%`;

const arrow = (n: number) => (n >= 0 ? '▲' : '▼');
const colorClass = (n: number) =>
  n > 0 ? 'text-red-600' : n < 0 ? 'text-blue-600' : 'text-gray-600';

// ─────────────────────────────────────────────────────────────────────────────
// 🖼️   PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Page() {
  // ---------------- Allocation logic ----------------
  const [viewMode, setViewMode] = useState<'stock' | 'sector'>('stock');
  const [tableTab, setTableTab] = useState<'portfolio' | 'holdings'>('holdings');
  const { data, isLoading, error } = useKiwoomBalance();

  const positions = useMemo(() => {
    if (!data || !Array.isArray(data.acnt_evlt_remn_indv_tot)) return [];

    return data.acnt_evlt_remn_indv_tot
      .map((o: KiwoomBalanceItem) => {
        // ⚠️ Adjust the field names below to match Kiwoom’s exact payload.
        const qty = Number(o.rmnd_qty ?? 0);
        const avg = Number(o.pur_pric ?? 0);
        const current = Number(o.cur_prc ?? 0);
        const purchaseAmt = Number(avg * qty);
        const evalAmt = Number(current * qty);
        const pnlAmt = Number(o.evltv_prft);
        const pnlPct = Number(o.prft_rt);
        const holdingPercent = Number(o.poss_rt);

        return {
          // Render‑ready fields (strings)
          symbol: o.stk_nm ?? '—',
          sector: o.upName ?? '—',
          side: '—',
          qty,
          avgPrice: avg.toLocaleString(),
          currentPrice: current.toLocaleString(),
          purchaseAmount: purchaseAmt.toLocaleString(),
          evalAmount: evalAmt.toLocaleString(),
          plAmount: pnlAmt.toLocaleString(),
          plPercent: fmtPct(pnlPct),
          holdingPercent: holdingPercent,
        };
      })
      .filter((p) => p.qty > 0)
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [data]);

  const cleanNum = (v: string | number) =>
    typeof v === 'number' ? v : Number(String(v).replace(/[^\d.-]/g, ''));

  const allocationStock = positions.map((p) => ({
    name: p.symbol,
    value: Number(p.holdingPercent.toFixed(2)),
  }));

  const allocationSector = (() => {
    const bySector: Record<string, number> = {};
    positions.forEach((p) => {
      bySector[p.sector] = (bySector[p.sector] ?? 0) + cleanNum(p.holdingPercent);
    });
    return Object.entries(bySector).map(([sector, holdingPercent]) => ({
      name: sector,
      value: Number(holdingPercent.toFixed(2)),
    }));
  })();

  const allocationData = viewMode === 'stock' ? allocationStock : allocationSector;

  // ---------------- Render -------------------------
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">한국 주식 포트폴리오</h1>

      {/* Summary + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary */}
        <section className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold">Summary</h2>

          {/* Total Amount */}
          <div>
            <p className="text-sm font-medium text-gray-600">Total Amount</p>
            <p className="text-4xl font-bold mt-1">{fmtCurrency(MOCK_SUMMARY.totalAmount)}</p>
            <div className="flex gap-4 text-sm mt-2">
              <span className={colorClass(MOCK_SUMMARY.amountChangePct)}>
                {arrow(MOCK_SUMMARY.amountChangePct)} {fmtPct(MOCK_SUMMARY.amountChangePct)}
              </span>
              <span className={colorClass(MOCK_SUMMARY.amountChange)}>
                {fmtSignedCurrency(MOCK_SUMMARY.amountChange)}
              </span>
            </div>
          </div>

          {/* Today + Total PNL grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Today PNL */}
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                Today PNL <span className="text-gray-400 text-xs">?</span>
              </p>
              <p className={`text-2xl font-bold mt-1 ${colorClass(MOCK_SUMMARY.todayPnlAmt)}`}>
                {fmtSignedCurrency(MOCK_SUMMARY.todayPnlAmt)}
              </p>
              <div className={`text-sm mt-1 ${colorClass(MOCK_SUMMARY.todayPnlPct)}`}>
                {arrow(MOCK_SUMMARY.todayPnlPct)} {fmtPct(MOCK_SUMMARY.todayPnlPct)}
              </div>
            </div>

            {/* Total PNL */}
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                Total PNL <span className="text-gray-400 text-xs">?</span>
              </p>
              <p className={`text-2xl font-bold mt-1 ${colorClass(MOCK_SUMMARY.totalPnlAmt)}`}>
                {fmtSignedCurrency(MOCK_SUMMARY.totalPnlAmt)}
              </p>
              <div className={`text-sm mt-1 ${colorClass(MOCK_SUMMARY.totalPnlPct)}`}>
                {arrow(MOCK_SUMMARY.totalPnlPct)} {fmtPct(MOCK_SUMMARY.totalPnlPct)}
              </div>
            </div>
          </div>
        </section>

        {/* Asset Allocation */}
        <section className="bg-white shadow rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Asset Allocation</h2>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              {[
                { id: 'stock', label: 'Stock' },
                { id: 'sector', label: 'Sector' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  className={`px-3 py-1 text-sm border first:rounded-l-md last:rounded-r-md focus:outline-none ${
                    viewMode === btn.id ? 'bg-gray-200 font-semibold' : 'bg-white'
                  }`}
                  onClick={() => setViewMode(btn.id as 'stock' | 'sector')}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={allocationData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {allocationData.map((_, idx) => (
                    <Cell key={idx} fill={PI_CHART_COLORS[idx % PI_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      {/* ------------------------ Portfolio / Holdings Header ------------------------ */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Portfolio</h2>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {[
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'holdings', label: 'Holdings' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              className={`px-4 py-1 text-sm border first:rounded-l-md last:rounded-r-md focus:outline-none ${
                tableTab === btn.id ? 'bg-gray-200 font-semibold' : 'bg-white'
              }`}
              onClick={() => setTableTab(btn.id as 'portfolio' | 'holdings')}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Positions Table */}
      <DataTable
        title={`키움증권 | ${process.env.NEXT_PUBLIC_KIWOOM_CANO}-${process.env.NEXT_PUBLIC_KIWOOM_ACNT_PRDT_CD}`}
        columns={[
          { header: '종목', accessor: 'symbol' },
          { header: '수량', accessor: 'qty', align: 'right' },
          { header: '평균단가', accessor: 'avgPrice', align: 'right' },
          { header: '현재가', accessor: 'currentPrice', align: 'right' },
          { header: '매입금액', accessor: 'purchaseAmount', align: 'right' },
          { header: '평가금액', accessor: 'evalAmount', align: 'right' },
          { header: '손익금액', accessor: 'plAmount', align: 'right' },
          { header: '수익률', accessor: 'plPercent', align: 'right' },
          { header: '비중', accessor: 'holdingPercent', align: 'right' },
        ]}
        data={positions}
        loading={false}
        emptyMessage="보유 종목이 없습니다."
        error={undefined}
      />
    </main>
  );
}
