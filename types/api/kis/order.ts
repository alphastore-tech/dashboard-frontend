export interface OrderRow {
  odno: string; // 주문번호
  ord_tmd: string; // 주문시각
  prdt_name: string; // 종목명
  sll_buy_dvsn_cd_name: string; // 매수/매도
  ord_qty: string; // 주문수량
  tot_ccld_qty: string; // 총체결수량
  ord_unpr: string; // 주문가격
  avg_prvs: string; // 평균체결가격
  tot_ccld_amt: string; // 총체결금액
}

export interface OrderHistoryResponse {
  rt_cd: string;
  msg_cd: string;
  msg1: string;
  output1: OrderRow[];
  output2: {
    tot_ord_qty: string;
    tot_ccld_qty: string;
    tot_ccld_amt: string;
  };
  ctx_area_fk100: string;
  ctx_area_nk100: string;
}

export interface FoOrderResponse {
  output1: {
    ord_dt: string;
    prdt_name: string;
    trad_dvsn_name: string;
    ord_qty: string;
    tot_ccld_qty: string;
    avg_idx: string;
    tot_ccld_amt: string;
  }[];
  output2: {
    tot_ord_qty: string;
    tot_ccld_qty_smtl: string;
    tot_ccld_amt_smtl: string;
  };
  ctx_area_fk200: string;
  ctx_area_nk200: string;
  rt_cd: string;
  msg_cd: string;
  msg1: string;
}
