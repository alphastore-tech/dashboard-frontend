"use client";

import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import useBalance from "@/components/useBalance";
import useFoBalance from "@/components/useFoBalance";
import useOrders from "@/components/useOrders";
import { useMemo } from "react";

const orders = [
  {
    order: 1004,
    status: "Filled",
    symbol: "AAPL",
    orderPrice: "150.5",
    filledPrice: "150.75",
    qty: 10,
    date: "01/04/2024",
  },
  {
    order: 1003,
    status: "Canceled",
    symbol: "ES",
    orderPrice: "4,150.00",
    filledPrice: "3",
    qty: 3,
    date: "01/03/2024",
  },
  {
    order: 1002,
    status: "Filled",
    symbol: "CL",
    orderPrice: "70.00",
    filledPrice: "70.30",
    qty: 2,
    date: "01/02/2024",
  },
];

export default function Page() {
  const { data, isLoading, error } = useBalance();
  const {
    data: futureData,
    isLoading: futureLoading,
    error: futureError,
  } = useFoBalance();
  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
  } = useOrders();

  let positions = [];
  if (data && data.output1) {
    positions = data.output1.map((o: any) => ({
      symbol: o.prdt_name,
      qty: Number(o.hldg_qty),
      avgPrice: Number(o.pchs_avg_pric).toLocaleString(),
      plPercent: o.evlu_pfls_rt + "%",
    }));
  }

  let futurePositions = [];
  if (futureData && futureData.output1) {
    futurePositions = futureData.output1.map((o: any) => ({
      symbol: o.prdt_name,
      qty: Number(o.hldg_qty),
      avgPrice: Number(o.pchs_avg_pric).toLocaleString(),
      plPercent: o.evlu_pfls_rt + "%",
    }));
  }

  const orders =
    orderData?.output1?.map((o: any) => ({
      date: o.ord_dt.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
      symbol: o.prdt_name,
      side: o.sll_buy_dvsn_cd === "02" ? "BUY" : "SELL",
      qty: Number(o.ord_qty),
      filledQty: Number(o.tot_ccld_qty),
      avgPrice: Number(o.avg_prvs).toLocaleString(),
      status: o.cncl_yn === "Y" ? "Canceled" : "Filled",
    })) ?? [];

  /* --------- KPI 카드 데이터 --------- */
  const stats = useMemo(() => {
    const totEval =
      data?.output2[0]?.tot_evlu_amt !== undefined
        ? Number(data?.output2[0]?.tot_evlu_amt).toLocaleString()
        : "—"; // 아직 로딩 중이거나 값이 없을 때

    const futureTotEval =
      futureData?.output2.prsm_dpast !== undefined
        ? Number(futureData?.output2.prsm_dpast).toLocaleString()
        : "—"; // 아직 로딩 중이거나 값이 없을 때

    return [
      { label: "주식 잔고 총평가금액(원)", value: totEval },
      { label: "선물옵션 잔고 총평가금액(원)", value: futureTotEval },
      { label: "Return", value: "8.5%" },
      { label: "Sharpe Ratio", value: "1.25" },
      { label: "MDD", value: "-10.2%" },
    ];
  }, [data, futureData]);

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">국내 주식 선물</h1>

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
          { header: "종목", accessor: "symbol" },
          { header: "수량", accessor: "qty", align: "right" },
          { header: "평균단가", accessor: "avgPrice", align: "right" },
          { header: "손익(%)", accessor: "plPercent", align: "right" },
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
          { header: "종목", accessor: "symbol" },
          { header: "수량", accessor: "qty", align: "right" },
          { header: "평균단가", accessor: "avgPrice", align: "right" },
          { header: "손익(%)", accessor: "plPercent", align: "right" },
        ]}
        data={futurePositions}
        loading={futureLoading && !futureData}
        emptyMessage="보유 종목이 없습니다."
        error={futureError}
      />

      {/* 주문내역 (Mock Data) */}
      <DataTable
        title={`${process.env.NEXT_PUBLIC_KIS_CANO}-${process.env.NEXT_PUBLIC_KIS_ACNT_PRDT_CD} | 주식 일별주문체결`}
        columns={[
          { header: "일자", accessor: "date" },
          { header: "종목", accessor: "symbol" },
          { header: "매수/매도", accessor: "side", align: "center" },
          { header: "주문수량", accessor: "qty", align: "right" },
          { header: "체결수량", accessor: "filledQty", align: "right" },
          { header: "평균단가", accessor: "avgPrice", align: "right" },
          { header: "체결상태", accessor: "status" },
        ]}
        data={orders}
        loading={orderLoading && !orderData}
        emptyMessage="금일 체결 내역이 없습니다."
        error={orderError}
      />
    </main>
  );
}
