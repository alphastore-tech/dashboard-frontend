"use client";

import Link from "next/link";
import StatCard from "@/components/StatCard";

/** KPI 목업 ─ 필요한 값으로 교체 가능 */
const kpis = [
  { label: "Balance", value: "$120.000" },
  { label: "Return", value: "12,5%" },
  { label: "Sharpe Ratio", value: "1.45" },
  { label: "MDD", value: "–8,0%" },
  { label: "Volatility", value: "10,2%" },
];

/** 전략 목록 */
const strategies = [
  { id: "domestic-stock-long-term", name: "국내 주식 계좌 포트폴리오" },
  { id: "foreign-stock", name: "해외 주식 계좌 포트폴리오" },
  { id: "domestic-future", name: "국내 주식 선물" },
  { id: "coins", name: "코인" },
  { id: "domestic-etfs", name: "국내 ETF" },
  { id: "follow-top-pick", name: "상한가 따라잡기" },
  { id: "statistical-arbitrage", name: "통계적 차익거래" },
  { id: "ai-model-analysis", name: "AI 모델 공시 감성 분석" },
];

export default function OverviewPage() {
  return (
    <main className="p-8 space-y-10">
      <h1 className="text-3xl font-bold">Overview</h1>

      {/* KPI 카드 */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((k) => (
            <StatCard key={k.label} label={k.label} value={k.value} />
          ))}
        </div>
      </div>

      {/* 전략 리스트 */}
      <div className="divide-y rounded-xl border border-border bg-white">
        {strategies.map((s) => (
          <Link
            key={s.id}
            href={`/${s.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
          >
            <span>{s.name}</span>
            <span className="text-gray-400">&rsaquo;</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
