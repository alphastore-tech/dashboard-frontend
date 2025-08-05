import useSWR from 'swr';

/** 공통 fetcher */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function useKisForeignBalance() {
  return useSWR('/api/kis-balance-foreign', fetcher, {});
}
