// StrategyCard.tsx – Strategy mini-card (sparkline variant)
// ---------------------------------------------------------
// 카드 형태와 UI 배치는 디자인 시안(이미지)과 동일하게 구현:
//   ▸ 좌측: 전략명(2줄) + 대표 성과지표 1개
//   ▸ 우측: 작은 스파크라인 그래프 (AreaChart)
//   ▸ 카드 전체에 hover 효과, border-radius, 그림자

'use client';

import Link from 'next/link';
import { Strategy } from '@/app/types/types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
} from 'recharts';

interface Props {
  strategy: Strategy;
}

// 헬퍼: 퍼센트 포맷 (소수점 2자리, , → 시간은 콤마로 표기 예시)
const fmtPct = (v: number, locale = 'ko-KR') =>
  v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

export default function StrategyCard({ strategy }: Props) {
  const { id, name, description, metrics, sparkline } = strategy as Strategy & {
    sparkline?: { value: number; idx: number }[];
  };

  // 스파크라인 데이터: props에 없으면 임시로 30개 난수 생성 (개발용)
  const chartData =
    sparkline && sparkline.length > 5
      ? sparkline
      : Array.from({ length: 30 }).map((_, i) => ({
          idx: i,
          value: 95 + Math.sin(i / 3) * 2 + i * 0.3,
        }));

  return (
    <Link
      href={`/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
    >
      {/* 좌측 텍스트 영역 */}
      <div className="flex-1 space-y-1 overflow-hidden pr-4">
        <h3 className="truncate text-base font-semibold leading-tight">{name}</h3>
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{description}</p>
        {/* 대표 지표 (예: Sharpe or CAGR) */}
        <p className="pt-1 text-xl font-medium text-slate-900 dark:text-slate-100">
          {metrics?.annualReturn !== undefined
            ? fmtPct(metrics.annualReturn)
            : (metrics?.sharpe?.toFixed(2) ?? '--')}
        </p>
      </div>

      {/* 우측 스파크라인 */}
      <div className="h-16 w-24 flex-none">
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="strategyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="idx" hide />
            <YAxis dataKey="value" hide domain={['dataMin', 'dataMax']} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#059669"
              strokeWidth={2}
              fill="url(#strategyGradient)"
            />
            <RechartTooltip
              formatter={(v: number) => v.toFixed(2)}
              wrapperStyle={{ display: 'none' }} // tooltip 숨김
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Link>
  );
}
