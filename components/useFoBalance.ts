import useSWR from 'swr'
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function useFoBalance() {
  return useSWR('/api/futures-balance', fetcher, {
    refreshInterval: 5000,   // 5초 polling
    dedupingInterval: 4000,
    keepPreviousData: true,
  })
}
