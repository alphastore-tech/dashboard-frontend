"use client";

import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import useBalance from "@/components/useBalance";
import useFoBalance from "@/components/useFoBalance";
import useOrders from "@/components/useOrders";
import useFoOrders from "@/components/useFoOrders";
import { useMemo } from "react";

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

  const {
    data: foOrderData,
    isLoading: foLoading,
    error: foError,
  } = useFoOrders();

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
      plAmount: Number(o.evlu_pfls_amt).toLocaleString(),
      plPercent: o.evlu_pfls_rt + "%",
    }));
  }

  let futurePositions = [];
  if (futureData && futureData.output1) {
    futurePositions = futureData.output1.map((o: any) => ({
      symbol: o.prdt_name,
      side: o.trad_dvsn_name,
      qty: Number(o.hldg_qty),
      avgPrice: Number(o.pchs_avg_pric).toLocaleString(),
      currentPrice: Number(o.prpr).toLocaleString(),
      purchaseAmount: Number(o.pchs_amt).toLocaleString(),
      evalAmount: Number(o.evlu_amt).toLocaleString(),
      plAmount: Number(o.evlu_pfls_amt).toLocaleString(),
      plPercent: ((o.plAmount / o.purchaseAmount) * 100).toFixed(2) + "%",
    }));
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
      주문시각: o.ord_tmd.replace(/(\d{2})(\d{2})(\d{2})/, "$1:$2:$3"),
      종목: o.prdt_name,
      매수매도: o.sll_buy_dvsn_cd === "02" ? "매수" : "매도",
      주문수량: Number(o.ord_qty).toLocaleString(),
      총체결수량: Number(o.tot_ccld_qty).toLocaleString(),
      주문가격: Number(o.ord_idx).toLocaleString(),
      평균체결가격: Number(o.avg_idx).toLocaleString(),
      총체결금액: Number(o.tot_ccld_amt).toLocaleString(),
    })) ?? [];

  /* --------- KPI 카드 데이터 --------- */
  const stats = useMemo(() => {
    // 원본 숫자값도 따로 저장
    const stockBalancePlusCash =
      data?.output2?.[0]?.tot_evlu_amt !== undefined
        ? Number(data?.output2?.[0].tot_evlu_amt).toLocaleString()
        : "?"; // 아직 로딩 중이거나 값이 없을 때

    const futureBalancePlusCash =
      futureData?.output2?.prsm_dpast !== undefined
        ? Number(futureData?.output2?.prsm_dpast).toLocaleString()
        : "?"; // 아직 로딩 중이거나 값이 없을 때

    // 평가손익 원본값
    const stockBalanceEvalRaw =
      data?.output2?.[0]?.evlu_pfls_smtl_amt !== undefined
        ? Number(data?.output2?.[0]?.evlu_pfls_smtl_amt)
        : undefined;

    const futureBalanceEvalRaw =
      futureData?.output2?.evlu_pfls_amt_smtl !== undefined
        ? Number(futureData?.output2?.evlu_pfls_amt_smtl)
        : undefined;

    // 전체 평가손익 원본값
    const totalBalanceEvalRaw =
      stockBalanceEvalRaw !== undefined && futureBalanceEvalRaw !== undefined
        ? stockBalanceEvalRaw + futureBalanceEvalRaw
        : undefined;

    // 수익률 계산
    const stockBalanceEvalPercent =
      data?.output2?.[0]?.evlu_pfls_smtl_amt !== undefined &&
      data?.output2?.[0]?.pchs_amt_smtl_amt !== undefined &&
      Number(data?.output2?.[0]?.pchs_amt_smtl_amt) !== 0
        ? (
            (Number(data?.output2?.[0]?.evlu_pfls_smtl_amt) /
              Number(data?.output2?.[0]?.pchs_amt_smtl_amt)) *
            100
          ).toFixed(2)
        : "?";

    const futureBalanceEvalPercent =
      futureData?.output2?.evlu_pfls_amt_smtl !== undefined &&
      futureData?.output2?.pchs_amt_smtl !== undefined &&
      Number(futureData?.output2?.pchs_amt_smtl) !== 0
        ? (
            (Number(futureData?.output2?.evlu_pfls_amt_smtl) /
              Number(futureData?.output2?.pchs_amt_smtl)) *
            100
          ).toFixed(2)
        : "?";

    // 전체 평가손익률은 0.0으로 남겨둠
    const totalBalanceEvalPercent = 0.0;

    // + 붙이기 함수
    function addPlusSign(val: number | undefined) {
      if (val === undefined) return "?";
      if (val > 0) return "+" + val.toLocaleString();
      return val.toLocaleString();
    }
    function addPlusSignPercent(val: string | number) {
      if (val === "?") return "?";
      const num = Number(val);
      if (isNaN(num)) return val + "%";
      if (num > 0) return "+" + num.toFixed(2) + "%";
      return num.toFixed(2) + "%";
    }

    return [
      { label: "주식 잔고 총평가금액(원)", value: stockBalancePlusCash },
      { label: "선물옵션 잔고 총평가금액(원)", value: futureBalancePlusCash },
      {
        label: "전체 평가손익(원)",
        value:
          (totalBalanceEvalRaw !== undefined
            ? addPlusSign(totalBalanceEvalRaw)
            : "?") +
          " (" +
          addPlusSignPercent(totalBalanceEvalPercent) +
          ")",
      },
      {
        label: "주식 잔고 평가손익(원)",
        value:
          (stockBalanceEvalRaw !== undefined
            ? addPlusSign(stockBalanceEvalRaw)
            : "?") +
          " (" +
          addPlusSignPercent(stockBalanceEvalPercent) +
          ")",
      },
      {
        label: "선물옵션 잔고 평가손익(원)",
        value:
          (futureBalanceEvalRaw !== undefined
            ? addPlusSign(futureBalanceEvalRaw)
            : "?") +
          " (" +
          addPlusSignPercent(futureBalanceEvalPercent) +
          ")",
      },
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
          { header: "손익금액", accessor: "plAmount", align: "right" },
          { header: "손익률", accessor: "plPercent", align: "right" },
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
          { header: "매수/매도", accessor: "side" },
          { header: "수량", accessor: "qty", align: "right" },
          { header: "평균단가", accessor: "avgPrice", align: "right" },
          { header: "현재가", accessor: "currentPrice", align: "right" },
          { header: "매입금액", accessor: "purchaseAmount", align: "right" },
          { header: "평가금액", accessor: "evalAmount", align: "right" },
          { header: "손익금액", accessor: "plAmount", align: "right" },
          { header: "손익률", accessor: "plPercent", align: "right" },
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
          { header: "주문번호", accessor: "orderNo" },
          { header: "주문시각", accessor: "orderTime" },
          { header: "종목", accessor: "symbol" },
          { header: "매수/매도", accessor: "side" },
          { header: "주문수량", accessor: "orderQty", align: "right" },
          { header: "체결수량", accessor: "filledQty", align: "right" },
          { header: "주문가격", accessor: "orderPrice", align: "right" },
          { header: "평균체결가격", accessor: "avgPrice", align: "right" },
          { header: "총체결금액", accessor: "totalAmount", align: "right" },
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
          { header: "주문시각", accessor: "주문시각" },
          { header: "종목", accessor: "종목" },
          { header: "매수/매도", accessor: "매수매도", align: "center" },
          { header: "주문수량", accessor: "주문수량", align: "right" },
          { header: "총체결수량", accessor: "총체결수량", align: "right" },
          { header: "주문가격", accessor: "주문가격", align: "right" },
          { header: "평균체결가격", accessor: "평균체결가격", align: "right" },
          { header: "총체결금액", accessor: "총체결금액", align: "right" },
        ]}
        data={foOrders}
        loading={foLoading && !foOrderData}
        emptyMessage="금일 체결 내역이 없습니다."
        error={foError}
      />
    </main>
  );
}
