'use client';

import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import RealizedPnlTable from '@/components/RealizedPnlTable';
import useBalance from '@/hooks/useBalance';
import useFoBalance from '@/hooks/useFoBalance';
import useOrders from '@/hooks/useOrders';
import useFoOrders from '@/hooks/useFoOrders';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { useDailyPeriodPnl, useMonthlyPeriodPnl } from '@/hooks/usePeriodPnl';
import useLsBalance from '@/hooks/useLsBalance';
import useLSOrder from '@/hooks/useLSOrder';

// ────────────────────────────────────────────────────────────
// 📊 MOCK DATA & UTILITIES
// ────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────
// 🖼️   PAGE COMPONENT
// ────────────────────────────────────────────────────────────

export default function DomesticFuturePage() {
  const [activeTab, setActiveTab] = useState('monitor');

  const tabs = [
    { id: 'monitor', label: 'Monitor' },
    { id: 'performance', label: 'Performance' },
  ];

  return (
    <div className="w-full border-b border-gray-200 dark:border-slate-700">
      {/* Tab header */}
      <nav className="flex space-x-6 px-4 sm:px-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative py-4 text-base font-medium outline-none whitespace-nowrap"
          >
            {/* Tab label */}
            <span className={activeTab === tab.id ? 'text-black' : 'text-gray-400'}>
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
      <section className="-mx-4 sm:mx-0 px-4 sm:px-6 py-4 sm:py-6">
        {activeTab === 'monitor' && <MonitorContent />}
        {activeTab === 'performance' && <PerformanceContent />}
      </section>
    </div>
  );
}

function MonitorContent() {
  const { data, isLoading, error } = useBalance();
  const { data: futureData, isLoading: futureLoading, error: futureError } = useFoBalance();

  const { data: lsData, isLoading: lsLoading, error: lsError } = useLsBalance();

  const { data: orderData, isLoading: orderLoading, error: orderError } = useOrders();
  const { data: lsOrderData, isLoading: lsOrderLoading, error: lsOrderError } = useLSOrder();

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

  // LS 주식 잔고 → KIS 테이블과 동일한 형태로 매핑
  let lsPositions: any[] = [];
  if (lsData && lsData.t0424OutBlock1) {
    lsPositions = lsData.t0424OutBlock1
      .map((o: any) => ({
        symbol: o.hname,
        side: o.jangb,
        qty: Number(o.janqty),
        avgPrice: Number(o.pamt).toLocaleString(),
        currentPrice: Number(o.price).toLocaleString(),
        purchaseAmount: Number(o.mamt).toLocaleString(),
        evalAmount: Number(o.appamt).toLocaleString(),
        plAmount: Number(o.dtsunik).toLocaleString(),
        plPercent: (Number(o.sunikrt) || 0).toFixed(2) + '%',
      }))
      .filter((o: any) => o.qty !== 0)
      .sort((a: any, b: any) => a.symbol.localeCompare(b.symbol));
  }

  let lsOrders: any[] = [];
  if (lsOrderData && lsOrderData.CSPAQ13700OutBlock3) {
    lsOrders = lsOrderData.CSPAQ13700OutBlock3.map((o: any) => {
      const hh = o.OrdTime?.slice(0, 2) ?? '';
      const mm = o.OrdTime?.slice(2, 4) ?? '';
      const ss = o.OrdTime?.slice(4, 6) ?? '';

      const orderQty = Number(o.OrdQty ?? 0);
      const filledQty = Number(o.ExecQty ?? 0);
      const orderPriceNum = Number(o.OrdPrc ?? 0);
      const execPriceNum = Number(o.ExecPrc ?? 0);
      const totalAmountNum = filledQty * execPriceNum;

      return {
        orderNo: o.OrdNo,
        orderTime: o.OrdTime ? `${hh}:${mm}:${ss}` : '',
        symbol: o.IsuNm,
        side: o.BnsTpNm, // 매수/매도
        orderQty,
        filledQty,
        orderPrice: orderPriceNum.toLocaleString(),
        avgPrice: execPriceNum.toLocaleString(),
        totalAmount: totalAmountNum.toLocaleString(),
      };
    });
  }

  const orders =
    orderData?.output1?.map((o: any) => ({
      orderNo: o.odno,
      orderTime: o.ord_tmd
        ? `${o.ord_tmd.slice(0, 2)}:${o.ord_tmd.slice(2, 4)}:${o.ord_tmd.slice(4, 6)}`
        : '',
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
      주문시각: o.ord_tmd
        ? `${o.ord_tmd.slice(0, 2)}:${o.ord_tmd.slice(2, 4)}:${o.ord_tmd.slice(4, 6)}`
        : '',
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
    <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* KPI 카드 (Mock Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
      {/* 실시간 LS 주식 계좌 잔고 포지션 테이블 (API) */}
      <div className="overflow-x-auto">
        <DataTable
          title={`${process.env.NEXT_PUBLIC_LS_ACCOUNT_NUMBER}-${process.env.NEXT_PUBLIC_LS_ACCOUNT_PROD_CODE} | 주식 계좌 잔고`}
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
          data={lsPositions}
          loading={lsLoading && !lsData}
          emptyMessage="보유 종목이 없습니다."
          error={lsError}
        />
      </div>

      {/* 실시간 주식 계좌 잔고 포지션 테이블 (API) */}
      <div className="overflow-x-auto">
        <DataTable
          title={`${process.env.NEXT_PUBLIC_KIS_SPOT_CANO}-${process.env.NEXT_PUBLIC_KIS_ACNT_PRDT_CD} | 주식 계좌 잔고`}
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
      </div>
      {/* 실시간 선물옵션 계좌 잔고 포지션 테이블 (API) */}
      <div className="overflow-x-auto">
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
      </div>

      <div className="overflow-x-auto">
        <DataTable
          title={`${process.env.NEXT_PUBLIC_KIS_SPOT_CANO}-${process.env.NEXT_PUBLIC_KIS_ACNT_PRDT_CD} | 주식 일별주문체결`}
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
      </div>

      <div className="overflow-x-auto">
        <DataTable
          title={`${process.env.NEXT_PUBLIC_LS_ACCOUNT_NUMBER}-${process.env.NEXT_PUBLIC_LS_ACCOUNT_PROD_CODE} | 주식 일별주문체결`}
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
          data={lsOrders}
          loading={lsOrderLoading && !lsOrderData}
          emptyMessage="금일 체결 내역이 없습니다."
          error={lsOrderError}
        />
      </div>

      <div className="overflow-x-auto">
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
      </div>
    </main>
  );
}

function PerformanceContent() {
  const [view, setView] = useState<'Daily' | 'Monthly'>('Daily');

  // Use the new useAnalysis hook
  const { data: analysisMetrics, isLoading: analysisLoading, error: analysisError } = useAnalysis();

  /* -------------------------- HUGE MOCK DATA ---------------------------- */
  // const monthlyData = useMemo(() => generateMonthly(36), []); // 3 years
  // const dailyData = useMemo(() => generateDaily(180), []); // 6 months
  /* ---------------- "Daily" → 실제 API ---------------------- */
  const { startDate, endDate } = useMemo(() => {
    const end = new Date(); // 오늘
    const start = new Date(end);
    start.setDate(start.getDate() - 80); // 180일 전(오늘 포함)
    const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
    return { startDate: fmt(start), endDate: fmt(end) };
  }, []);

  const {
    data: dailyApiData = [], // API 결과
    isLoading: dailyLoading,
    error: dailyError,
  } = useDailyPeriodPnl(); // 🔹 여기서 호출

  const {
    data: monthlyApiData = [], // API 결과
    isLoading: monthlyLoading,
    error: monthlyError,
  } = useMonthlyPeriodPnl(); // 🔹 여기서 호출

  console.log('monthlyApiData', monthlyApiData);
  console.log('dailyApiData', dailyApiData);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 2️⃣ Portfolio Analysis */}
      <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-xl font-semibold">Analysis (Mock)</h2>
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
      <RealizedPnlTable
        data={view === 'Daily' ? dailyApiData : monthlyApiData}
        columns={columns}
        view={view}
        setView={setView}
        loading={view === 'Daily' ? dailyLoading : monthlyLoading}
        error={view === 'Daily' ? dailyError : monthlyError}
      />

      {/* 2️⃣ Growth */}
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

      {/* 4️⃣ Monthly Details by Year */}
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
