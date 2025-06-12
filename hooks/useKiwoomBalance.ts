/* hooks/useKiwoomBalance.ts */
import useSWR from 'swr';
import type { KiwoomBalanceResponse } from '@/lib/kiwoom';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useKiwoomBalance() {
  return useSWR<KiwoomBalanceResponse>('/api/kiwoom/balance', fetcher, {
    refreshInterval: 5_000,
    dedupingInterval: 4_000,
    keepPreviousData: true,
  });
}
