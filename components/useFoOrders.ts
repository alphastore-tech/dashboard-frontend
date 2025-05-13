import useSWR from 'swr'
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function useFoOrders() {
  return useSWR('/api/futures-orders', fetcher, {
    refreshInterval: 6000,    // 6초
    dedupingInterval: 5000,
    keepPreviousData: true,
  })
}
