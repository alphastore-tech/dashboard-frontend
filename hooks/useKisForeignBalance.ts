import useSWR from 'swr';

/** 공통 fetcher */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useKisForeignBalance(options: { polling?: boolean } = {}) {
  const { polling = false } = options;
  return useSWR('/api/kis-balance-foreign', fetcher, {
    refreshInterval: polling ? 5_000 : 0,
  });
}
