"use client";

import Link from "next/link";
import StatCard from "@/components/StatCard";
import StrategyCard from "@/components/StrategyCard";
import { strategies } from "@/components/strategyList";

/** KPI 목업 ─ 필요한 값으로 교체 가능 */
const kpis = [
  { label: "Balance", value: "$120.000" },
  { label: "Return", value: "12,5%" },
  { label: "Sharpe Ratio", value: "1.45" },
  { label: "MDD", value: "–8,0%" },
  { label: "Volatility", value: "10,2%" },
];

export default function OverviewPage() {
  return (
    <main className="p-8 space-y-10">
      <h1 className="text-3xl font-bold">안태찬님의 투자 전략</h1>

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
          <StrategyCard key={s.id} strategy={s} />
        ))}
      </div>
    </main>
  );
}
