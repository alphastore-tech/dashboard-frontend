'use client';

import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import useBalance from '@/hooks/useBalance';
import useFoBalance from '@/hooks/useFoBalance';
import useOrders from '@/hooks/useOrders';
import useFoOrders from '@/hooks/useFoOrders';
import useLsBalance from '@/hooks/useLsBalance';
import useLSOrder from '@/hooks/useLSOrder';
import { useMemo } from 'react';

export default function Monitor() {
  const { data, isLoading, error } = useBalance();
  const { data: futureData, isLoading: futureLoading, error: futureError } = useFoBalance();

  const { data: lsData, isLoading: lsLoading, error: lsError } = useLsBalance();

  const { data: orderData, isLoading: orderLoading, error: orderError } = useOrders();
  const { data: lsOrderData, isLoading: lsOrderLoading, error: lsOrderError } = useLSOrder();

  const { data: foOrderData, isLoading: foLoading, error: foError } = useFoOrders();

  let positions: any[] = [];
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

  let futurePositions: any[] = [];
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
        side: o.BnsTpNm,
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

  const stats = useMemo(() => {
    const toNum = (v: unknown) => Number(v ?? NaN);
    const addPlus = (n: number | undefined) =>
      n === undefined ? '?' : (n > 0 ? '+' : '') + n.toLocaleString();

    const addPlusPct = (v: string | number) => {
      if (v === '?') return '?';
      const n = Number(v);
      if (isNaN(n)) return v + '%';
      return (n > 0 ? '+' : '') + n.toFixed(2) + '%';
    };

    const o2 = data?.output2?.[0] ?? {};
    const fo2 = futureData?.output2 ?? {};

    const stockTotalVal = toNum(o2.tot_evlu_amt);
    const futTotalVal = toNum(fo2.prsm_dpast);

    const stockPnl = toNum(o2.evlu_pfls_smtl_amt);
    const stockCost = toNum(o2.pchs_amt_smtl_amt);

    const futPnl = toNum(fo2.evlu_pfls_amt_smtl);
    const futCost = toNum(fo2.pchs_amt_smtl);

    const pct = (pnl: number, cost: number) =>
      isFinite(cost) && cost !== 0 ? ((pnl / cost) * 100).toFixed(2) : '?';

    const stockPct = pct(stockPnl, stockCost);
    const futPct = pct(futPnl, futCost);

    const totalPnl = (isFinite(stockPnl) ? stockPnl : 0) + (isFinite(futPnl) ? futPnl : 0);
    const totalCost = (isFinite(stockCost) ? stockCost : 0) + (isFinite(futCost) ? futCost : 0);
    const totalPct = pct(totalPnl, totalCost);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat: any) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

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
