export interface BalanceRequest {
  cano: string; // 계좌번호
  acntPrdtCd: string; // 계좌상품코드
  qry_tp?: '1' | '2'; // 1:합산, 2:개별 (기본값 1)
  dmst_stex_tp?: 'KRX' | 'NXT'; // 거래소 (기본값 KRX)
}

export interface KiwoomBalanceItem {
  stk_cd: string;
  stk_nm: string;
  evltv_prft: string;
  prft_rt: string;
  rmnd_qty: string;
  pur_pric: string;
  cur_prc: string;
  poss_rt: string;
  upName: string;
}

export interface KiwoomBalanceResponse {
  tot_pur_amt?: string;
  tot_evlt_amt?: string;
  tot_evlt_pl?: string;
  tot_prft_rt?: string;
  prsm_dpst_aset_amt?: string;
  acnt_evlt_remn_indv_tot?: KiwoomBalanceItem[];
}
