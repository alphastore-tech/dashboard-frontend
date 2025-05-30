// components/StrategyCard.tsx
"use client";

import Link from "next/link";
import Metric from "@/components/Metrix";
import { Strategy } from "@/app/types/types";

interface Props {
  strategy: Strategy;
}

export default function StrategyCard({ strategy }: Props) {
  const { id, name, description, metrics } = strategy;

  const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

  return (
    <Link
      href={`/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-6 px-6 py-5 hover:bg-gray-50"
    >
      {/* 왼쪽 텍스트 블록 */}
      <div className="space-y-1">
        <h3 className="font-semibold leading-snug">{name}</h3>
        <p className="text-sm text-gray-500">{description}</p>

        {/* 모바일(≤sm)에서 지표를 아래로 배치 */}
        <div className="mt-2 flex gap-4 sm:hidden">
          <Metric label="샤프 지수" value={metrics.sharpe.toFixed(2)} />
          <Metric label="연평균 수익률" value={fmtPct(metrics.annualReturn)} />
          <Metric label="최대 하락률" value={fmtPct(metrics.maxDrawdown)} />
        </div>
      </div>

      {/* 데스크톱 우측 지표 열 */}
      <div className="ml-auto hidden shrink-0 items-end text-right sm:flex sm:flex-col sm:gap-0.5">
        <Metric label="샤프 지수" value={metrics.sharpe.toFixed(2)} />
        <Metric label="총기간 수익률" value={fmtPct(metrics.totalReturn)} />
        <Metric label="연평균 수익률" value={fmtPct(metrics.annualReturn)} />
        <Metric label="최대 하락률" value={fmtPct(metrics.maxDrawdown)} />
        <Metric label="변동성" value={fmtPct(metrics.volatility)} />
      </div>
    </Link>
  );
}
