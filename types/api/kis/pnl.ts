export interface PeriodTradeProfitLossResponse {
  rt_cd: string;
  msg_cd: string;
  msg1: string;
  ctx_area_nk100: string;
  ctx_area_fk100: string;
  output1: Array<{
    trad_dt: string; // 매매일자
    pdno: string; // 상품번호
    prdt_name: string; // 상품명
    trad_dvsn_name: string; // 매매구분명
    loan_dt: string; // 대출일자
    hldg_qty: string; // 보유수량
    pchs_unpr: string; // 매입단가
    buy_qty: string; // 매수수량
    buy_amt: string; // 매수금액
    sll_pric: string; // 매도가격
    sll_qty: string; // 매도수량
    sll_amt: string; // 매도금액
    rlzt_pfls: string; // 실현손익
    pfls_rt: string; // 손익률
    fee: string; // 수수료
    tl_tax: string; // 제세금
    loan_int: string; // 대출이자
  }>;
  output2: {
    sll_qty_smtl: string; // 매도수량합계
    sll_tr_amt_smtl: string; // 매도거래금액합계
    sll_fee_smtl: string; // 매도수수료합계
    sll_tltx_smtl: string; // 매도제세금합계
    sll_excc_amt_smtl: string; // 매도정산금액합계
    buyqty_smtl: string; // 매수수량합계
    buy_tr_amt_smtl: string; // 매수거래금액합계
    buy_fee_smtl: string; // 매수수수료합계
    buy_tax_smtl: string; // 매수제세금합계
    buy_excc_amt_smtl: string; // 매수정산금액합계
    tot_qty: string; // 총수량
    tot_tr_amt: string; // 총거래금액
    tot_fee: string; // 총수수료
    tot_tltx: string; // 총제세금
    tot_excc_amt: string; // 총정산금액
    tot_rlzt_pfls: string; // 총실현손익
    loan_int: string; // 대출이자
    tot_pftrt: string; // 총수익률
  };
}

export interface FuturePnlResponse {
  rt_cd: string;
  msg_cd: string;
  msg1: string;
  output1: {
    ord_dt: string; // 주문일자
    pdno: string; // 상품번호
    item_name: string; // 종목명
    sll_agrm_amt: string; // 매도약정금액
    sll_fee: string; // 매도수수료
    buy_agrm_amt: string; // 매수약정금액
    buy_fee: string; // 매수수수료
    tot_fee_smtl: string; // 총수수료합계
    trad_pfls: string; // 매매손익
  }[];
  output2: {
    futr_agrm: string; // 선물약정
    futr_agrm_amt: string; // 선물약정금액
    futr_agrm_amt_smtl: string; // 선물약정금액합계
    futr_sll_fee_smtl: string; // 선물매도수수료합계
    futr_buy_fee_smtl: string; // 선물매수수수료합계
    futr_fee_smtl: string; // 선물수수료합계
    opt_agrm: string; // 옵션약정
    opt_agrm_amt: string; // 옵션약정금액
    opt_agrm_amt_smtl: string; // 옵션약정금액합계
    opt_sll_fee_smtl: string; // 옵션매도수수료합계
    opt_buy_fee_smtl: string; // 옵션매수수수료합계
    opt_fee_smtl: string; // 옵션수수료합계
    prdt_futr_agrm: string; // 상품선물약정
    prdt_fuop: string; // 상품선물옵션
    prdt_futr_evlu_amt: string; // 상품선물평가금액
    futr_fee: string; // 선물수수료
    opt_fee: string; // 옵션수수료
    fee: string; // 수수료
    sll_agrm_amt: string; // 매도약정금액
    buy_agrm_amt: string; // 매수약정금액
    agrm_amt_smtl: string; // 약정금액합계
    sll_fee: string; // 매도수수료
    buy_fee: string; // 매수수수료
    fee_smtl: string; // 수수료합계
    trad_pfls_smtl: string; // 매매손익합계
  };
}

export interface DailyPnlData {
  date: string;
  totalPnl: number;
  stockPnl: number;
  futurePnl: number;
  trade_count: number;
  contango_count: number;
  back_count: number;
  cash_flow: number;
}
