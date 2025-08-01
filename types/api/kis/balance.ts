export interface BalanceResponse {
  output1: {
    prdt_name: string; // 종목명
    trad_dvsn_name: string; // 매수/매도
    hldg_qty: string; // 잔고수량
    pchs_avg_pric: string; // 평균매입단가
    prpr: string; // 현재가
    pchs_amt: string; // 매입금액
    evlu_amt: string; // 평가금액
    evlu_pfls_amt: string; // 평가손익금액
    evlu_pfls_rt: string; // 평가손익율
  }[];
  output2: {
    tot_evlu_amt: string; // 총평가금액
    evlu_pfls_smtl_amt: string; // 총평가손익금액
    pchs_amt_smtl_amt: string; // 총매입금액
  }[];
}
