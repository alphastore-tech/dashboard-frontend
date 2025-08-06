/* hooks/useBalance.ts */
import useSWR from 'swr';
import { isMarketOpenKST } from '@/lib/time';

/** 공통 fetcher */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** 5초마다 잔고 재호출 */
export default function useKisBalance_43037074(options: { polling?: boolean } = {}) {
  const { polling = true } = options;
  const marketOpen = isMarketOpenKST(900, 1545);

  return useSWR('/api/kis-balance-43037074', fetcher, {
    refreshInterval: polling ? 5_000 : marketOpen ? 5_000 : 0, // 5 000 ms = 5 s
    dedupingInterval: 4_000, // 직전 응답 재사용 (중복 제거)
    keepPreviousData: true, // 새 데이터 올 때까지 화면 흔들림 방지
  });
}
