"use client";

import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import useBalance from "@/components/useBalance";
import useFoBalance from "@/components/useFoBalance";
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

  let positions = [];
  if (data && data.output1) {
    positions = data.output1.map((o: any) => ({
      symbol: o.prdt_name,
      qty: Number(o.hldg_qty),
      avgPrice: Number(o.pchs_avg_pric).toLocaleString(),
      plPercent: o.evlu_pfls_rt + "%",
    }));
  }

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
      { label: "Volatility", value: "12.8%" },
    ];
  }, [data, futureData]);

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Stock Spot & Future</h1>

      {/* KPI 카드 (Mock Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* 실시간 포지션 테이블 (API) */}
      {error ? (
        <p className="p-8 text-red-600">API 오류: {error.message}</p>
      ) : (
        <DataTable
          title="Current Positions"
          columns={[
            { header: "종목", accessor: "symbol" },
            { header: "수량", accessor: "qty", align: "right" },
            { header: "평균단가", accessor: "avgPrice", align: "right" },
            { header: "손익(%)", accessor: "plPercent", align: "right" },
          ]}
          data={positions}
          loading={isLoading && !data}
          emptyMessage="보유 종목이 없습니다."
        />
      )}

      {/* 주문내역 (Mock Data) */}
      <DataTable
        title="Order History"
        columns={[
          { header: "Order #", accessor: "order" },
          { header: "Status", accessor: "status" },
          { header: "Symbol", accessor: "symbol" },
          { header: "Order Price", accessor: "orderPrice" },
          { header: "Filled Price", accessor: "filledPrice" },
          { header: "Qty", accessor: "qty" },
          { header: "Date", accessor: "date" },
        ]}
        data={orders}
      />
    </main>
  );
}
