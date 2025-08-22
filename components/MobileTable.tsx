'use client';
import React from 'react';

type Column = {
  header: string;
  accessor: string;
  align?: 'left' | 'right' | 'center';
};

type MobileTableProps = {
  title?: string;
  columns?: Column[]; // API 호환용(사용하지 않음)
  data: Array<Record<string, any>>;
  loading?: boolean;
  emptyMessage?: string;
  error?: unknown;
  currency?: 'KRW' | 'USD'; // 통화 파라미터 추가
};

const fmtKRW = (v: string | number | undefined) => {
  const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
};

const fmtUSD = (v: string | number | undefined) => {
  const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
};

const cleanNum = (v: string | number | undefined) =>
  Number(String(v ?? '').replace(/[^\d.-]/g, '') || 0);

/** 등락(+)이면 red, (-)면 blue, 0이면 gray */
const deltaColor = (amt: string | number | undefined, pct: string | number | undefined) => {
  const nAmt = cleanNum(amt);
  const hasMinusAmt = String(amt ?? '')
    .trim()
    .startsWith('-');
  const hasMinusPct = String(pct ?? '')
    .trim()
    .startsWith('-');
  const isNeg = hasMinusAmt || hasMinusPct || nAmt < 0;
  const isZero =
    nAmt === 0 &&
    !hasMinusPct &&
    !String(pct ?? '')
      .trim()
      .startsWith('+');
  if (isZero) return 'text-gray-500';
  return isNeg ? 'text-blue-600' : 'text-rose-600';
};

/** + 기호가 필요하면 붙여서 통화로 표시 */
const fmtSignedCurrency = (
  amt: string | number | undefined,
  fallbackSignFromPct?: string | number,
  currency: 'KRW' | 'USD' = 'KRW',
) => {
  const raw = String(amt ?? '');
  const n = cleanNum(raw);
  const neg =
    raw.trim().startsWith('-') ||
    String(fallbackSignFromPct ?? '')
      .trim()
      .startsWith('-');
  const pos =
    !neg &&
    (n > 0 ||
      String(fallbackSignFromPct ?? '')
        .trim()
        .startsWith('+'));
  const sign = neg ? '-' : pos ? '+' : '';

  if (currency === 'USD') {
    return sign + fmtUSD(Math.abs(n));
  }
  return sign + fmtKRW(Math.abs(n));
};

const Avatar = ({ name, logoUrl }: { name: string; logoUrl?: string }) => {
  const initial = name?.[0] ?? '—';
  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200 ring-1 ring-gray-300">
      {logoUrl ? (
        // 로고가 있다면 사용
        <img src={logoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-700">
          {initial}
        </div>
      )}
    </div>
  );
};

export default function MobileTable({
  title,
  data,
  loading,
  emptyMessage = '데이터가 없습니다.',
  error,
  currency = 'KRW', // 기본값은 KRW
}: MobileTableProps) {
  if (error) {
    const msg = typeof error === 'string' ? error : '오류가 발생했습니다.';
    return <p className="text-sm text-red-600">{msg}</p>;
  }

  if (loading) {
    return (
      <ul aria-label={title} className="divide-y divide-gray-200">
        {[...Array(6)].map((_, i) => (
          <li key={i} className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <div>
                <div className="mb-1 h-4 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-12 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
            <div className="text-right">
              <div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <section aria-label={title}>
      {title ? <h3 className="mb-2 text-sm font-semibold text-gray-700">{title}</h3> : null}
      {/* 사진 레이아웃과 동일: 좌측 아이콘+텍스트, 우측 금액+등락 */}
      <ul className="divide-y divide-gray-200">
        {data.map((row, idx) => {
          const name = row.symbol ?? '—';
          const qty = row.qty ?? 0;
          const evalAmount = row.evalAmount;
          const plAmount = row.plAmount;
          const plPercent = row.plPercent;

          const deltaCls = deltaColor(plAmount, plPercent);
          const signedAmt = fmtSignedCurrency(plAmount, plPercent, currency);
          const pctStr = typeof plPercent === 'string' ? plPercent : `${plPercent ?? 0}%`;

          const formatAmount = currency === 'USD' ? fmtUSD(evalAmount) : fmtKRW(evalAmount);

          return (
            <li key={`${name}-${idx}`} className="flex items-center justify-between py-4">
              {/* left: 로고/이니셜 + 종목 + 보유수량 */}
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={name} logoUrl={row.logoUrl} />
                <div className="min-w-0">
                  <div className="truncate text-xm font-medium text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500">{qty}주</div>
                </div>
              </div>

              {/* right: 평가금액 + (등락금액, 등락률) */}
              <div className="text-right">
                <div className="text-base font-semibold text-gray-900">{formatAmount}</div>
                <div
                  className={`text-xs ${deltaCls} inline-flex items-center gap-1 whitespace-nowrap`}
                >
                  {signedAmt} <span className="ml-1">({pctStr})</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
