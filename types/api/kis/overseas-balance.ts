export interface OverseasBalanceResponse {
  rt_cd: string;
  msg_cd: string;
  msg1: string;
  ctx_area_fk200: string;
  ctx_area_nk200: string;
  output1: Array<{
    cano: string;
    acnt_prdt_cd: string;
    prdt_type_cd: string;
    ovrs_pdno: string;
    ovrs_item_name: string;
    frcr_evlu_pfls_amt: string;
    evlu_pfls_rt: string;
    pchs_avg_pric: string;
    ovrs_cblc_qty: string;
    ord_psbl_qty: string;
    frcr_pchs_amt1: string;
    ovrs_stck_evlu_amt: string;
    now_pric2: string;
    tr_crcy_cd: string;
    ovrs_excg_cd: string;
    loan_type_cd: string;
    loan_dt: string;
    expd_dt: string;
  }>;
  output2: {
    frcr_pchs_amt1: string;
    ovrs_rlzt_pfls_amt: string;
    ovrs_tot_pfls: string;
    rlzt_erng_rt: string;
    tot_evlu_pfls_amt: string;
    tot_pftrt: string;
    frcr_buy_amt_smtl1: string;
    ovrs_rlzt_pfls_amt2: string;
    frcr_buy_amt_smtl2: string;
  };
}
