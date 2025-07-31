export interface FoQuoteResponse {
  output1: {
    hts_kor_isnm: string;
    futs_prpr: string;
    futs_prdy_vrss: string;
    prdy_vrss_sign: string;
    futs_prdy_clpr: string;
    futs_prdy_ctrt: string;
    acml_vol: string;
    acml_tr_pbmn: string;
    hts_otst_stpl_qty: string;
    otst_stpl_qty_icdc: string;
    futs_oprc: string;
    futs_hgpr: string;
    futs_lwpr: string;
    futs_mxpr: string;
    futs_llam: string;
    basis: string;
    futs_sdpr: string;
    hts_thpr: string;
    dprt: string; // 괴리율
    crbr_aply_mxpr: string;
    crbr_aply_llam: string;
    futs_last_tr_date: string;
    hts_rmnn_dynu: string;
    futs_lstn_medm_hgpr: string;
    futs_lstn_medm_lwpr: string;
    delta_val: string;
    gama: string;
    theta: string;
    vega: string;
    rho: string;
    hist_vltl: string;
    hts_ints_vltl: string;
    mrkt_basis: string;
    acpr: string;
  };
  output2: {
    bstp_cls_code: string;
    hts_kor_isnm: string;
    bstp_nmix_prpr: string;
    prdy_vrss_sign: string;
    bstp_nmix_prdy_vrss: string;
    bstp_nmix_prdy_ctrt: string;
  };
  output3: {
    bstp_cls_code: string;
    hts_kor_isnm: string;
    bstp_nmix_prpr: string;
    prdy_vrss_sign: string;
    bstp_nmix_prdy_vrss: string;
    bstp_nmix_prdy_ctrt: string;
  };
  rt_cd: string;
  msg_cd: string;
  msg1: string;
}
