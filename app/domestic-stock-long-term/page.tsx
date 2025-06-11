"use client";

// -----------------------------------------------------------------------------
//  Korean Equity Dashboard (mock-data version)
// -----------------------------------------------------------------------------
//  • Summary panel: colours (+ red / – blue) with automatic ▲ / ▼ arrows.
//  • Asset-allocation donut with Stock / Sector toggle (mock data).
//  • Positions table at the bottom (mock data).
// -----------------------------------------------------------------------------

import DataTable from "@/components/DataTable";
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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

const MOCK_POSITIONS = [
  {
    symbol: "삼성전자",
    sector: "반도체",
    side: "매수",
    qty: 100,
    avgPrice: "72,500",
    currentPrice: "75,200",
    purchaseAmount: "7,250,000",
    evalAmount: "7,520,000",
    plAmount: "+270,000",
    plPercent: "+3.72%",
  },
  {
    symbol: "SK하이닉스",
    sector: "반도체",
    side: "매수",
    qty: 50,
    avgPrice: "128,000",
    currentPrice: "132,500",
    purchaseAmount: "6,400,000",
    evalAmount: "6,625,000",
    plAmount: "+225,000",
    plPercent: "+3.52%",
  },
  {
    symbol: "NAVER",
    sector: "인터넷/콘텐츠",
    side: "매수",
    qty: 30,
    avgPrice: "185,000",
    currentPrice: "178,500",
    purchaseAmount: "5,550,000",
    evalAmount: "5,355,000",
    plAmount: "-195,000",
    plPercent: "-3.51%",
  },
];

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#d0ed57",
  "#a4de6c",
];

// ─────────────────────────────────────────────────────────────────────────────
// 📚   HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) =>
  `₩${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtSignedCurrency = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "-" : ""}${fmtCurrency(Math.abs(n))}`;

const fmtPct = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "-" : ""}${Math.abs(n).toFixed(2)}%`;

const arrow = (n: number) => (n >= 0 ? "▲" : "▼");
const colorClass = (n: number) =>
  n > 0 ? "text-red-600" : n < 0 ? "text-blue-600" : "text-gray-600";

// ─────────────────────────────────────────────────────────────────────────────
// 🖼️   PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Page() {
  // ---------------- Allocation logic ----------------
  const [viewMode, setViewMode] = useState<"stock" | "sector">("stock");
  const [tableTab, setTableTab] = useState<"portfolio" | "holdings">(
    "holdings"
  );

  const cleanNum = (v: string | number) =>
    typeof v === "number" ? v : Number(String(v).replace(/[^\d.-]/g, ""));

  const totalEvalAmt = MOCK_POSITIONS.reduce(
    (acc, p) => acc + cleanNum(p.evalAmount),
    0
  );

  const allocationStock = MOCK_POSITIONS.map((p) => ({
    name: p.symbol,
    value: Number(((cleanNum(p.evalAmount) / totalEvalAmt) * 100).toFixed(2)),
  }));

  const allocationSector = (() => {
    const bySector: Record<string, number> = {};
    MOCK_POSITIONS.forEach((p) => {
      bySector[p.sector] = (bySector[p.sector] ?? 0) + cleanNum(p.evalAmount);
    });
    return Object.entries(bySector).map(([sec, amt]) => ({
      name: sec,
      value: Number(((amt / totalEvalAmt) * 100).toFixed(2)),
    }));
  })();

  const allocationData =
    viewMode === "stock" ? allocationStock : allocationSector;

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
            <p className="text-4xl font-bold mt-1">
              {fmtCurrency(MOCK_SUMMARY.totalAmount)}
            </p>
            <div className="flex gap-4 text-sm mt-2">
              <span className={colorClass(MOCK_SUMMARY.amountChangePct)}>
                {arrow(MOCK_SUMMARY.amountChangePct)}{" "}
                {fmtPct(MOCK_SUMMARY.amountChangePct)}
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
              <p
                className={`text-2xl font-bold mt-1 ${colorClass(
                  MOCK_SUMMARY.todayPnlAmt
                )}`}
              >
                {fmtSignedCurrency(MOCK_SUMMARY.todayPnlAmt)}
              </p>
              <div
                className={`text-sm mt-1 ${colorClass(
                  MOCK_SUMMARY.todayPnlPct
                )}`}
              >
                {arrow(MOCK_SUMMARY.todayPnlPct)}{" "}
                {fmtPct(MOCK_SUMMARY.todayPnlPct)}
              </div>
            </div>

            {/* Total PNL */}
            <div>
              <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                Total PNL <span className="text-gray-400 text-xs">?</span>
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${colorClass(
                  MOCK_SUMMARY.totalPnlAmt
                )}`}
              >
                {fmtSignedCurrency(MOCK_SUMMARY.totalPnlAmt)}
              </p>
              <div
                className={`text-sm mt-1 ${colorClass(
                  MOCK_SUMMARY.totalPnlPct
                )}`}
              >
                {arrow(MOCK_SUMMARY.totalPnlPct)}{" "}
                {fmtPct(MOCK_SUMMARY.totalPnlPct)}
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
                { id: "stock", label: "Stock" },
                { id: "sector", label: "Sector" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  className={`px-3 py-1 text-sm border first:rounded-l-md last:rounded-r-md focus:outline-none ${
                    viewMode === btn.id
                      ? "bg-gray-200 font-semibold"
                      : "bg-white"
                  }`}
                  onClick={() => setViewMode(btn.id as "stock" | "sector")}
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
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {allocationData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
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
            { id: "portfolio", label: "Portfolio" },
            { id: "holdings", label: "Holdings" },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              className={`px-4 py-1 text-sm border first:rounded-l-md last:rounded-r-md focus:outline-none ${
                tableTab === btn.id ? "bg-gray-200 font-semibold" : "bg-white"
              }`}
              onClick={() => setTableTab(btn.id as "portfolio" | "holdings")}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Positions Table */}
      <DataTable
        title="모의 계좌 | 주식 잔고"
        columns={[
          { header: "종목", accessor: "symbol" },
          { header: "매수/매도", accessor: "side" },
          { header: "수량", accessor: "qty", align: "right" },
          { header: "평균단가", accessor: "avgPrice", align: "right" },
          { header: "현재가", accessor: "currentPrice", align: "right" },
          { header: "매입금액", accessor: "purchaseAmount", align: "right" },
          { header: "평가금액", accessor: "evalAmount", align: "right" },
          { header: "손익금액", accessor: "plAmount", align: "right" },
          { header: "손익률", accessor: "plPercent", align: "right" },
        ]}
        data={MOCK_POSITIONS}
        loading={false}
        emptyMessage="보유 종목이 없습니다."
        error={undefined}
      />
    </main>
  );
}
