'use client';
import DataTable from '@/components/DataTable';
import SummarySection from '@/components/SummarySection';
import AssetAllocationSection from '@/components/AssetAllocationSection';
import { useState, useMemo } from 'react';
import useKisForeignBalance from '@/hooks/useKisForeignBalance';
import { OverseasBalanceResponse } from '@/types/api/kis/overseas-balance';

// ─────────────────────────────────────────────────────────────────────────────
// 🎨  CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const parseNumber = (v?: string | number): number => Number(v ?? 0);

/**
 * Remove all non-numeric characters except minus and dot and return a number.
 */
const cleanNum = (v: string | number): number =>
  typeof v === 'number' ? v : Number(String(v).replace(/[^\d.-]/g, ''));

const fmtPct = (n: number) => `${n > 0 ? '+' : n < 0 ? '-' : ''}${Math.abs(n).toFixed(2)}%`;

// ─────────────────────────────────────────────────────────────────────────────
// 🖼️   PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Page() {
  // ---------------- Hooks ----------------
  const [viewMode, setViewMode] = useState<'stock' | 'sector'>('stock');
  const [tableTab, setTableTab] = useState<'portfolio' | 'holdings'>('holdings');

  const { data: kisData, isLoading: kisLoading, error: kisError } = useKisForeignBalance();

  // ---------------- Summary computation ----------------
  const summary = useMemo(() => {
    const kisOutput2 = (kisData as OverseasBalanceResponse)?.output2;
    const kisTotAmt = parseNumber(kisOutput2?.tot_evlu_pfls_amt);
    const kisPurchaseAmt = parseNumber(kisOutput2?.frcr_pchs_amt1);
    const kisPnlAmt = kisTotAmt - kisPurchaseAmt;
    const kisPnlPct = parseNumber(kisOutput2?.tot_pftrt);
    const kisTodayPnlAmt = parseNumber(kisOutput2?.ovrs_rlzt_pfls_amt);
    const kisTodayPnlPct = parseNumber(kisOutput2?.rlzt_erng_rt);

    return {
      totalAmount: kisTotAmt,
      amountChange: kisPnlAmt,
      amountChangePct: kisPnlPct,
      todayPnlAmt: kisTodayPnlAmt,
      todayPnlPct: kisTodayPnlPct,
      totalPnlAmt: kisPnlAmt,
      totalPnlPct: kisPnlPct,
    };
  }, [kisData]);

  // ---------------- Positions ----------------
  const positions = useMemo(() => {
    const pos: {
      symbol: string;
      broker: string;
      sector: string;
      side: string;
      qty: number;
      avgPrice: string;
      currentPrice: string;
      purchaseAmount: string;
      evalAmount: string;
      plAmount: string;
      plPercent: string;
      holdingPercent: number | string;
    }[] = [];

    // ------- KIS positions -------
    if (kisData && Array.isArray((kisData as OverseasBalanceResponse).output1)) {
      (kisData as OverseasBalanceResponse).output1
        .filter((o) => parseNumber(o.ovrs_cblc_qty) > 0)
        .forEach((o) => {
          const qty = parseNumber(o.ovrs_cblc_qty);
          const avg = parseNumber(o.pchs_avg_pric);
          const current = parseNumber(o.now_pric2);
          const purchaseAmt = parseNumber(o.frcr_pchs_amt1);
          const evalAmt = parseNumber(o.ovrs_stck_evlu_amt);
          const pnlAmt = parseNumber(o.frcr_evlu_pfls_amt);
          const pnlPct = parseNumber(o.evlu_pfls_rt);
          const sector = '—'; // KIS does not provide sector info in this endpoint

          pos.push({
            symbol: o.ovrs_item_name ?? '—',
            broker: '한국투자', // Assuming KIS is the broker name
            sector,
            side: '—', // No trade division name in overseas balance
            qty,
            avgPrice: avg.toLocaleString(),
            currentPrice: current.toLocaleString(),
            purchaseAmount: purchaseAmt.toLocaleString(),
            evalAmount: evalAmt.toLocaleString(),
            plAmount: pnlAmt.toLocaleString(),
            plPercent: fmtPct(pnlPct),
            holdingPercent: 0, // will be filled later
          });
        });
    }

    // ------- Calculate holding percentages based on evaluation amount -------
    const totalEvalAmt = pos.reduce((acc, p) => acc + cleanNum(p.evalAmount), 0);
    const posWithPct = pos.map((p) => ({
      ...p,
      holdingPercent:
        totalEvalAmt > 0
          ? `${((cleanNum(p.evalAmount) / totalEvalAmt) * 100).toFixed(2)}%`
          : '0.00%',
    }));

    // Sort by symbol for stable UI
    return posWithPct.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [kisData]);

  // ---------------- Allocation ----------------
  const allocationData = useMemo(() => {
    if (!positions.length) return [];

    if (viewMode === 'sector') {
      // By sector
      const bySector: Record<string, number> = {};
      positions.forEach((p) => {
        const holdingPct =
          typeof p.holdingPercent === 'string'
            ? parseFloat(p.holdingPercent.replace('%', ''))
            : p.holdingPercent;
        bySector[p.sector] = (bySector[p.sector] ?? 0) + holdingPct;
      });
      return Object.entries(bySector).map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
      }));
    }

    // By stock symbol
    return positions.map((p) => {
      const holdingPct =
        typeof p.holdingPercent === 'string'
          ? parseFloat(p.holdingPercent.replace('%', ''))
          : p.holdingPercent;
      return {
        name: p.symbol,
        value: Number(holdingPct.toFixed(2)),
      };
    });
  }, [positions, viewMode]);

  // ---------------- Render ----------------
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">해외 주식 포트폴리오</h1>

      {/* Summary + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummarySection data={summary} currency="USD" />
        <AssetAllocationSection
          data={allocationData}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
        />
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

      {/* ------------------------ Positions Table ------------------------ */}
      <DataTable
        title={`${process.env.NEXT_PUBLIC_KIS_CANO}-${process.env.NEXT_PUBLIC_KIS_ACNT_PRDT_CD}`}
        columns={[
          { header: '종목', accessor: 'symbol' },
          { header: '증권사', accessor: 'broker' },
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
        loading={kisLoading}
        emptyMessage="보유 종목이 없습니다."
        error={kisError}
      />
    </main>
  );
}
