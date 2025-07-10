import useSWR from 'swr';
import { isMarketOpenKST } from '@/lib/time';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useFoBalance() {
  const marketOpen = isMarketOpenKST(900, 1545);

  return useSWR('/api/futures-balance', fetcher, {
    refreshInterval: marketOpen ? 5_000 : 0, // 5초 polling
    dedupingInterval: 4_000,
    keepPreviousData: true,
  });
}
