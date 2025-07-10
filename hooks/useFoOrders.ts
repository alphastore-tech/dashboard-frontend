import useSWR from 'swr';
import { isMarketOpenKST } from '@/lib/time';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useFoOrders() {
  const marketOpen = isMarketOpenKST(900, 1545);

  return useSWR('/api/futures-orders', fetcher, {
    refreshInterval: marketOpen ? 6_000 : 0, // 6초
    dedupingInterval: 5_000,
    keepPreviousData: true,
  });
}
