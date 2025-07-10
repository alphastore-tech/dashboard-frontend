import useSWR from 'swr';
import { isMarketOpenKST } from '@/lib/time';
/** 공통 fetcher */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * 기간별 PnL 훅
 *
 * @param startDate  조회 시작일 (YYYYMMDD)
 * @param endDate    조회 종료일 (YYYYMMDD)
 */
export default function usePeriodPnl(startDate: string | undefined, endDate: string | undefined) {
  // 두 날짜가 모두 들어와야 요청
  const key =
    startDate && endDate ? `/api/period-pnl?startDate=${startDate}&endDate=${endDate}` : null;

  const marketOpen = isMarketOpenKST(900, 1545);

  return useSWR(key, fetcher, {
    refreshInterval: marketOpen ? 600_000 : 0, // 600 000 ms = 10 min
    dedupingInterval: 550_000,
    keepPreviousData: true,
  });
}
