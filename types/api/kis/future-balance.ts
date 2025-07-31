export interface FoBalanceResponse {
  rt_cd: string;
  msg_cd: string;
  msg1: string;
  ctx_area_fk200: string;
  ctx_area_nk200: string;
  output1: {
    shtn_pdno: string; // 단축상품번호
    prdt_name: string; // 종목명
    sll_buy_dvsn_name: string; // 매수/매도
    cblc_qty: string; // 잔고수량
    ccld_avg_unpr1: string; // 평균단가
    idx_clpr: string; // 정산단가
    pchs_amt: string; // 매입금액
    evlu_amt: string; // 평가금액
    evlu_pfls_amt: string; // 평가손익금액
    divergence: string; // 괴리율
  }[];
  output2: {
    prsm_dpast: string; // 추정예탁자산
    prsm_dpast_amt: string; // 추정예탁자산금액
    evlu_pfls_amt_smtl: string; // 총평가손익금액
    pchs_amt_smtl: string; // 총매입금액
  };
}
