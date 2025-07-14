import useSWR from 'swr';

/** 공통 fetcher */
const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      console.warn('PnL 데이터 요청 실패:', err);
      throw err;
    });


export function useDailyPeriodPnl() {
  // 두 날짜가 모두 들어와야 요청
  const key =`${process.env.NEXT_PUBLIC_BACKEND_URL}/pnl/daily`;
  return useSWR(key, fetcher, {
    
  });
}

export function useMonthlyPeriodPnl() {
  // 두 날짜가 모두 들어와야 요청
  const key =`${process.env.NEXT_PUBLIC_BACKEND_URL}/pnl/monthly`;
  return useSWR(key, fetcher, {
    
  });
}





// /**
//  * 기간별 PnL 훅
//  *
//  * @param startDate  조회 시작일 (YYYYMMDD)
//  * @param endDate    조회 종료일 (YYYYMMDD)
//  */
// export default function usePeriodPnl(startDate: string | undefined, endDate: string | undefined) {
//   // 두 날짜가 모두 들어와야 요청
//   const key =
//     startDate && endDate ? `/api/period-pnl?startDate=${startDate}&endDate=${endDate}` : null;

//   const marketOpen = isMarketOpenKST(900, 1545);

//   return useSWR(key, fetcher, {
//     refreshInterval: marketOpen ? 600_000 : 0, // 600 000 ms = 10 min
//     dedupingInterval: 550_000,
//     keepPreviousData: true,
//   });
// }
