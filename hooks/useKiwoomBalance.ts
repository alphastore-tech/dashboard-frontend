/* hooks/useKiwoomBalance.ts */
import useSWR from 'swr';
import type { KiwoomBalanceResponse } from '@/types/api/kiwoom/balance';
import { isMarketOpenKST } from '@/lib/time';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useKiwoomBalance() {
  const marketOpen = isMarketOpenKST(800, 2000);

  return useSWR<KiwoomBalanceResponse>('/api/kiwoom/balance', fetcher, {
    refreshInterval: marketOpen ? 30_000 : 0,
    dedupingInterval: 5_000,
    keepPreviousData: true,
  });
}
