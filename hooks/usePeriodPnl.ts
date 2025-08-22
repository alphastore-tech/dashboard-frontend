import useSWR from 'swr';

/** 공통 fetcher */
const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      console.warn('PnL 데이터 요청 실패:', err);
      throw err;
    });

export function useDailyPeriodPnl() {
  // 두 날짜가 모두 들어와야 요청
  const key = `${process.env.NEXT_PUBLIC_BACKEND_URL}/pnl/daily`;
  return useSWR(key, fetcher, {});
}

export function useMonthlyPeriodPnl() {
  // 두 날짜가 모두 들어와야 요청
  const key = `${process.env.NEXT_PUBLIC_BACKEND_URL}/pnl/monthly`;
  return useSWR(key, fetcher, {});
}
