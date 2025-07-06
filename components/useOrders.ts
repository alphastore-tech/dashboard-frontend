import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useOrders() {
  return useSWR('/api/orders', fetcher, {
    refreshInterval: 5000, // 5초마다
    dedupingInterval: 5000,
    keepPreviousData: true,
  });
}
