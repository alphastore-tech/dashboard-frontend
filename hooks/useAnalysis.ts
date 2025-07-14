import useSWR from 'swr';

// Type definition for analysis metrics
interface AnalysisMetric {
  label: string;
  value: string;
}

// Mock data as fallback
const MOCK_ANALYSIS_METRICS: AnalysisMetric[] = [
  { label: 'Total Return', value: '37.77%' },
  { label: 'CAGR(Annualized)', value: '20.09' },
  { label: 'Max Drawdown', value: '-10.60%' },
  { label: 'Volatility', value: '3.53' },
  { label: 'Sharpe Ratio', value: '1.25' },
];

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      console.warn('Falling back to mock data:', err);
      return MOCK_ANALYSIS_METRICS;
    });

export const useAnalysis = () => {
  const { data, isLoading, error } = useSWR<AnalysisMetric[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/performance_metrics`,
    fetcher,
    {
      // revalidateOnFocus: true, // 기본값이므로 생략 가능
      // revalidateOnReconnect: true, // 오프라인 → 온라인 복귀 시에도
    },
  );

  return {
    data: data?.length ? data : MOCK_ANALYSIS_METRICS,
    isLoading: isLoading,
    error: error,
  };
};
