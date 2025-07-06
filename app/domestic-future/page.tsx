'use client';

import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import useBalance from '@/components/useBalance';
import useFoBalance from '@/components/useFoBalance';
import useOrders from '@/components/useOrders';
import useFoOrders from '@/components/useFoOrders';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ResponsiveContainer } from 'recharts';
import { useState, useEffect } from "react";

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

export default function DomesticFuturePage() {
  const [activeTab, setActiveTab] = useState("monitor");

  const tabs = [
    { id: "monitor", label: "Monitor" },
    { id: "performance", label: "Performance" },
  ];

  return (
    <div className="w-full border-b border-gray-200">
      {/* Tab header */}
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative py-4 text-base font-medium outline-none"
          >
            {/* Tab label */}
            <span
              className={
                activeTab === tab.id ? "text-black" : "text-gray-400"
              }
            >
              {tab.label}
            </span>

            {/* Active underline */}
            {activeTab === tab.id && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-black transition-all" />
            )}
          </button>
        ))}
      </nav>

      {/* Tab panel */}
      <section className="p-6">
        {activeTab === "monitor" && <MonitorContent />}
        {activeTab === "performance" && <PerformanceContent />}
      </section>
    </div>
  );
}


const fmtCur = (n: number) => `₩${n.toLocaleString()}`;
const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
const color = (n: number) => (n >= 0 ? 'text-rose-600' : 'text-blue-600');
// ────────────────────────────────────────────────────────────
// 🖼️   PAGE COMPONENT
// ────────────────────────────────────────────────────────────

/* -------------------------------------------------------------------------- */
/*  DATA TABLE + PAGINATION                                                   */
/* -------------------------------------------------------------------------- */
const columns = [
  { key: "date", label: "날짜", align: "left" },
  { key: "amount", label: "실현 금액" },
  { key: "pnl", label: "실현 손익" },
  { key: "trade", label: "거래 횟수" },
  { key: "contango", label: "콘탱고 횟수" },
  { key: "backward", label: "백워데이션 횟수" },
  { key: "cash", label: "입출금" },
];

function RealizedPnlTable({ data, view, setView }: { data: any[], view: 'Daily' | 'Monthly', setView: (view: 'Daily' | 'Monthly') => void }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  /* 🔑 view가 바뀔 때마다 page를 1로 리셋 */
  useEffect(() => {
    setPage(1);
  }, [view]);


  const paged = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{view === "Daily" ? "Daily Details" : "Monthly Details"}</h2>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {[
            { id: 'Daily', label: 'Daily' },
            { id: 'Monthly', label: 'Monthly' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              className={`px-3 py-1 text-sm border first:rounded-l-md last:rounded-r-md focus:outline-none ${
                view === btn.id ? 'bg-gray-200 font-semibold' : 'bg-white'
              }`}
              onClick={() => setView(btn.id as 'Daily' | 'Monthly')}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm tracking-tight">
          <thead className="border-b text-slate-500">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-2 ${c.align === "left" ? "text-left" : "text-right"}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} className="border-b last:border-0">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2 ${col.align === "left" ? "text-left" : "text-right"}`}
                  >
                    {renderCell(col.key, row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-10">
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>
    </section>
  );
}


/* -------------------------------------------------------------------------- */
/*  MOCK DATA GENERATORS                                                      */
/* -------------------------------------------------------------------------- */
function generateMonthly(n: number) {
  const res = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    const item = {
      date: d.toISOString().slice(0, 7),
      amount: randomInt(5_000_000, 15_000_000),
      pnl: randomInt(-500_000, 800_000),
      trade: randomInt(15, 60),
      contango: randomInt(0, 10),
      backward: randomInt(0, 10),
      cash: randomInt(-1_000_000, 2_000_000),
    };
    res.push(item);
  }
  return res;
}

function generateDaily(n: number) {
  const res = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const item = {
      date: d.toISOString().slice(0, 10),
      amount: randomInt(200_000, 600_000),
      pnl: randomInt(-50_000, 80_000),
      trade: randomInt(1, 10),
      contango: randomInt(0, 3),
      backward: randomInt(0, 3),
      cash: randomInt(-200_000, 200_000),
    };
    res.push(item);
  }
  return res;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* -------------------------------------------------------------------------- */
/*  CELL RENDER                                                               */
/* -------------------------------------------------------------------------- */
function renderCell(key: string, value: number) {
  if (key === "pnl") {
    const cls = value > 0 ? "text-red-500" : value < 0 ? "text-blue-600" : "text-gray-600";
    const sign = value >= 0 ? "+" : "";
    return <span className={cls}>{`${sign}${value.toLocaleString()}`}</span>;
  }
  if (key === "amount" || key === "cash") return value.toLocaleString();
  return value;
}
interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

export function Pagination({ page, setPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const maxNumbersToShow = 5;

  const pageNumbers = useMemo<(number)[]>(() => {
    if (totalPages <= maxNumbersToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const sibling = Math.floor(maxNumbersToShow / 2);
    let start = Math.max(1, page - sibling);
    let end = Math.min(totalPages, page + sibling);

    if (page - 1 <= sibling) end = maxNumbersToShow;
    if (totalPages - page <= sibling) start = totalPages - maxNumbersToShow + 1;

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
  };

  return (
    <div className="flex items-center justify-center gap-3 text-base select-none">
      {/* 이전 */}
      <PaginateButton label="‹" disabled={page === 1} onClick={() => goTo(page - 1)} />

      {pageNumbers.map((p) => (
        <PaginateButton
          key={p}
          label={p.toString()}
          active={p === page}
          onClick={() => goTo(p)}
        />
      ))}

      {/* 다음 */}
      <PaginateButton
        label="›"
        disabled={page === totalPages}
        onClick={() => goTo(page + 1)}
      />
    </div>
  );
}
function PaginateButton({
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-gray-300 text-black"                   // 선택된 페이지
          : "text-black hover:bg-gray-100",            // 기본 / hover
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </button>
  );
}

function PerformanceContent() {
  const [view, setView] = useState<'Daily' | 'Monthly'>("Daily");

  

  /* -------------------------- HUGE MOCK DATA ---------------------------- */
  const monthlyData = useMemo(() => generateMonthly(36), []); // 3 years
  const dailyData = useMemo(() => generateDaily(180), []);   // 6 months

  return (
    <main className="mx-auto max-w-7xl p-8 space-y-10">
  
    

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

      {/* Data Table (Daily / Monthly) */}
      <RealizedPnlTable data={view === "Daily" ? dailyData : monthlyData} view={view} setView={setView} />

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
   

      
    </main>
  );
}


function MonitorContent() {
  const { data, isLoading, error } = useBalance();
  const { data: futureData, isLoading: futureLoading, error: futureError } = useFoBalance();
  const { data: orderData, isLoading: orderLoading, error: orderError } = useOrders();

  const { data: foOrderData, isLoading: foLoading, error: foError } = useFoOrders();

  let positions = [];
  if (data && data.output1) {
    positions = data.output1
      .map((o: any) => ({
        symbol: o.prdt_name,
        side: o.trad_dvsn_name,
        qty: Number(o.hldg_qty),
        avgPrice: Number(o.pchs_avg_pric).toLocaleString(),
        currentPrice: Number(o.prpr).toLocaleString(),
        purchaseAmount: Number(o.pchs_amt).toLocaleString(),
        evalAmount: Number(o.evlu_amt).toLocaleString(),
        plAmount: Number(o.evlu_pfls_amt).toLocaleString(),
        plPercent: o.evlu_pfls_rt + '%',
      }))
      .filter((o: any) => o.qty > 0)
      .sort((a: any, b: any) => a.symbol.localeCompare(b.symbol));
  }

  let futurePositions = [];
  if (futureData && futureData.output1) {
    futurePositions = futureData.output1
      .map((o: any) => ({
        symbol: o.prdt_name,
        divergence: o.divergence,
        side: o.sll_buy_dvsn_name,
        qty: Number(o.cblc_qty),
        avgPrice: Number(o.ccld_avg_unpr1).toLocaleString(),
        currentPrice: Number(o.idx_clpr).toLocaleString(),
        purchaseAmount: Number(o.pchs_amt).toLocaleString(),
        evalAmount: Number(o.evlu_amt).toLocaleString(),
        plAmount: Number(o.evlu_pfls_amt).toLocaleString(),
        plPercent: ((Number(o.evlu_pfls_amt) / Number(o.pchs_amt)) * 100).toFixed(2) + '%',
      }))
      .filter((o: any) => o.qty > 0)
      .sort((a: any, b: any) => a.symbol.localeCompare(b.symbol));
  }

  const orders =
    orderData?.output1?.map((o: any) => ({
      orderNo: o.odno,
      orderTime: o.ord_tmd,
      symbol: o.prdt_name,
      side: o.sll_buy_dvsn_cd_name,
      orderQty: Number(o.ord_qty),
      filledQty: Number(o.tot_ccld_qty),
      orderPrice: Number(o.ord_unpr).toLocaleString(),
      avgPrice: Number(o.avg_prvs).toLocaleString(),
      totalAmount: Number(o.tot_ccld_amt).toLocaleString(),
    })) ?? [];

  const foOrders =
    foOrderData?.output1?.map((o: any) => ({
      주문번호: o.odno,
      주문시각: o.ord_dt,
      종목: o.prdt_name,
      매수매도: o.trad_dvsn_name,
      주문수량: Number(o.ord_qty).toLocaleString(),
      총체결수량: Number(o.tot_ccld_qty).toLocaleString(),
      주문가격: Number(o.ord_idx).toLocaleString(),
      평균체결가격: Number(o.avg_idx).toLocaleString(),
      총체결금액: Number(o.tot_ccld_amt).toLocaleString(),
    })) ?? [];

  /* --------- KPI 카드 데이터 --------- */
  const stats = useMemo(() => {
    const toNum = (v: unknown) => Number(v ?? NaN);
    const addPlus = (n: number | undefined) =>
      n === undefined ? '?' : (n > 0 ? '+' : '') + n.toLocaleString();

    const addPlusPct = (v: string | number) => {
      if (v === '?') return '?';
      const n = Number(v);
      if (isNaN(n)) return v + '%'; // 이미 문자열(% 포함)
      return (n > 0 ? '+' : '') + n.toFixed(2) + '%';
    };

    /* ───────────── 원본 값 추출 ───────────── */
    const o2 = data?.output2?.[0] ?? {};
    const fo2 = futureData?.output2 ?? {};

    const stockTotalVal = toNum(o2.tot_evlu_amt);
    const futTotalVal = toNum(fo2.prsm_dpast);

    const stockPnl = toNum(o2.evlu_pfls_smtl_amt);
    const stockCost = toNum(o2.pchs_amt_smtl_amt);

    const futPnl = toNum(fo2.evlu_pfls_amt_smtl);
    const futCost = toNum(fo2.pchs_amt_smtl);

    /* ───────────── 수익률 계산 ───────────── */
    const pct = (pnl: number, cost: number) =>
      isFinite(cost) && cost !== 0 ? ((pnl / cost) * 100).toFixed(2) : '?';

    const stockPct = pct(stockPnl, stockCost);
    const futPct = pct(futPnl, futCost);

    /* 전체 합계 */
    const totalPnl = (isFinite(stockPnl) ? stockPnl : 0) + (isFinite(futPnl) ? futPnl : 0);
    const totalCost = (isFinite(stockCost) ? stockCost : 0) + (isFinite(futCost) ? futCost : 0);
    const totalPct = pct(totalPnl, totalCost);

    /* ───────────── KPI 배열 반환 ───────────── */
    return [
      {
        label: '주식 총평가금액(원)',
        value: isFinite(stockTotalVal) ? stockTotalVal.toLocaleString() : '?',
      },
      {
        label: '선물·옵션 총평가금액(원)',
        value: isFinite(futTotalVal) ? futTotalVal.toLocaleString() : '?',
      },

      {
        label: '전체 평가손익(원)',
        value: `${addPlus(totalPnl)} (${addPlusPct(totalPct)})`,
      },
      {
        label: '주식 평가손익(원)',
        value: `${addPlus(stockPnl)} (${addPlusPct(stockPct)})`,
      },
      {
        label: '선물·옵션 평가손익(원)',
        value: `${addPlus(futPnl)} (${addPlusPct(futPct)})`,
      },
    ];
  }, [data, futureData]);

  return (
    <main className="p-8 space-y-8">
      {/* KPI 카드 (Mock Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* 실시간 주식 계좌 잔고 포지션 테이블 (API) */}
      <DataTable
        title={`${process.env.NEXT_PUBLIC_KIS_CANO}-${process.env.NEXT_PUBLIC_KIS_ACNT_PRDT_CD} | 주식 계좌 잔고`}
        columns={[
          { header: '종목', accessor: 'symbol' },
          { header: '매수/매도', accessor: 'side', align: 'center' },
          { header: '수량', accessor: 'qty', align: 'right' },
          { header: '평균단가', accessor: 'avgPrice', align: 'right' },
          { header: '현재가', accessor: 'currentPrice', align: 'right' },
          { header: '매입금액', accessor: 'purchaseAmount', align: 'right' },
          { header: '평가금액', accessor: 'evalAmount', align: 'right' },
          { header: '손익금액', accessor: 'plAmount', align: 'right' },
          { header: '수익률', accessor: 'plPercent', align: 'right' },
        ]}
        data={positions}
        loading={isLoading && !data}
        emptyMessage="보유 종목이 없습니다."
        error={error}
      />
      {/* 실시간 선물옵션 계좌 잔고 포지션 테이블 (API) */}
      <DataTable
        title={`${process.env.NEXT_PUBLIC_KIS_CANO}-${process.env.NEXT_PUBLIC_KIS_FUTURE_ACNT_PRDT_CD} | 선물옵션 계좌 잔고`}
        columns={[
          { header: '종목', accessor: 'symbol' },
          { header: '괴리율', accessor: 'divergence', align: 'center' },
          { header: '매수/매도', accessor: 'side', align: 'center' },
          { header: '수량', accessor: 'qty', align: 'right' },
          { header: '평균단가', accessor: 'avgPrice', align: 'right' },
          { header: '현재가', accessor: 'currentPrice', align: 'right' },
          { header: '매입금액', accessor: 'purchaseAmount', align: 'right' },
          { header: '평가금액', accessor: 'evalAmount', align: 'right' },
          { header: '손익금액', accessor: 'plAmount', align: 'right' },
          { header: '수익률', accessor: 'plPercent', align: 'right' },
        ]}
        data={futurePositions}
        loading={futureLoading && !futureData}
        emptyMessage="보유 종목이 없습니다."
        error={futureError}
      />

      <DataTable
        title={`${process.env.NEXT_PUBLIC_KIS_CANO}-${process.env.NEXT_PUBLIC_KIS_ACNT_PRDT_CD} | 주식 일별주문체결`}
        columns={[
          { header: '주문번호', accessor: 'orderNo' },
          { header: '주문시각', accessor: 'orderTime' },
          { header: '종목', accessor: 'symbol' },
          { header: '매수/매도', accessor: 'side' },
          { header: '주문수량', accessor: 'orderQty', align: 'right' },
          { header: '체결수량', accessor: 'filledQty', align: 'right' },
          { header: '주문가격', accessor: 'orderPrice', align: 'right' },
          { header: '평균체결가격', accessor: 'avgPrice', align: 'right' },
          { header: '총체결금액', accessor: 'totalAmount', align: 'right' },
        ]}
        data={orders}
        loading={orderLoading && !orderData}
        emptyMessage="금일 체결 내역이 없습니다."
        error={orderError}
      />

      <DataTable
        title={`${process.env.NEXT_PUBLIC_KIS_CANO}-${process.env.NEXT_PUBLIC_KIS_FUTURE_ACNT_PRDT_CD} | 선물옵션 일별주문체결`}
        columns={[
          { header: '주문번호', accessor: '주문번호' },
          { header: '주문시각', accessor: '주문시각' },
          { header: '종목', accessor: '종목' },
          { header: '매수/매도', accessor: '매수매도', align: 'center' },
          { header: '주문수량', accessor: '주문수량', align: 'right' },
          { header: '총체결수량', accessor: '총체결수량', align: 'right' },
          { header: '주문가격', accessor: '주문가격', align: 'right' },
          { header: '평균체결가격', accessor: '평균체결가격', align: 'right' },
          { header: '총체결금액', accessor: '총체결금액', align: 'right' },
        ]}
        data={foOrders}
        loading={foLoading && !foOrderData}
        emptyMessage="금일 체결 내역이 없습니다."
        error={foError}
      />
    </main>
  );
}
