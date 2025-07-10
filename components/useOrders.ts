import useSWR from 'swr';
import { isMarketOpenKST } from '@/lib/time';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useOrders() {
  const marketOpen = isMarketOpenKST(900, 1545);

  return useSWR('/api/orders', fetcher, {
    refreshInterval: marketOpen ? 5_000 : 0, // 5초마다
    dedupingInterval: 4_000,
    keepPreviousData: true,
  });
}
