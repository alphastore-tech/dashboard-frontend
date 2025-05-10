"use client";

import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import useBalance from "@/components/useBalance";
import useFoBalance from "@/components/useFoBalance";
import useOrders from "@/components/useOrders";
import { useMemo } from "react";

const futureOrders = [
  {
    주문번호: 2004,
    호가유형코드: "00",
    상품번호: "005930",
    상품명: "삼성전자 F06",
    주문수량: 2,
    총체결수량: 2,
    주문가격: "75,000",
    평균체결가격: "75,100",
    총체결금액: "150,200",
    주문시각: "2024/04/01 09:15:00",
  },
  {
    주문번호: 2003,
    호가유형코드: "01",
    상품번호: "373220",
    상품명: "LG에너지솔루션 F06",
    주문수량: 1,
    총체결수량: 0,
    주문가격: "420,000",
    평균체결가격: "422,000",
    총체결금액: "0",
    주문시각: "2024/03/28 10:05:00",
  },
  {
    주문번호: 2002,
    호가유형코드: "00",
    상품번호: "035420",
    상품명: "NAVER F06",
    주문수량: 3,
    총체결수량: 3,
    주문가격: "210,000",
    평균체결가격: "210,500",
    총체결금액: "631,500",
    주문시각: "2024/03/25 13:22:00",
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
      side: o.trad_dvsn_name,
      qty: Number(o.hldg_qty),
      avgPrice: Number(o.pchs_avg_pric).toLocaleString(),
      currentPrice: Number(o.prpr).toLocaleString(),
      purchaseAmount: Number(o.pchs_amt).toLocaleString(),
      evalAmount: Number(o.evlu_amt).toLocaleString(),
      plPercent: o.evlu_pfls_rt + "%",
      plAmount: Number(o.evlu_pfls_amt).toLocaleString(),
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
          { header: "매수/매도", accessor: "side" },
          { header: "수량", accessor: "qty", align: "right" },
          { header: "평균단가", accessor: "avgPrice", align: "right" },
          { header: "현재가", accessor: "currentPrice", align: "right" },
          { header: "매입금액", accessor: "purchaseAmount", align: "right" },
          { header: "평가금액", accessor: "evalAmount", align: "right" },
          { header: "손익률", accessor: "plPercent", align: "right" },
          { header: "손익금액", accessor: "plAmount", align: "right" },
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

      {/* 주문내역 (Mock Data) */}
      <DataTable
        title={`${process.env.NEXT_PUBLIC_KIS_CANO}-${process.env.NEXT_PUBLIC_KIS_FUTURE_ACNT_PRDT_CD} | 선물옵션 일별주문체결`}
        columns={[
          { header: "주문번호", accessor: "주문번호" },
          { header: "호가유형코드", accessor: "호가유형코드" },
          { header: "상품번호", accessor: "상품번호" },
          { header: "상품명", accessor: "상품명" },
          { header: "주문수량", accessor: "주문수량" },
          { header: "총체결수량", accessor: "총체결수량" },
          { header: "주문가격", accessor: "주문가격" },
          { header: "평균체결가격", accessor: "평균체결가격" },
          { header: "총체결금액", accessor: "총체결금액" },
          { header: "주문시각", accessor: "주문시각" },
        ]}
        data={futureOrders}
      />
    </main>
  );
}
