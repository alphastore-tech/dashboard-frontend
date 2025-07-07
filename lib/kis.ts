/* lib/kis.ts */
import qs from 'querystring';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const { KIS_APP_KEY, KIS_APP_SECRET, KIS_DOMAIN, AWS_SECRET_ID } = process.env as Record<
  string,
  string
>;

let cachedToken: string | null = null;
let expiresAt: number = 0;

export async function getAccessToken() {
  if (cachedToken && Date.now() < expiresAt) {
    return cachedToken;
  }

  const sm = new SecretsManagerClient({ region: 'ap-northeast-2' });
  const { SecretString } = await sm.send(new GetSecretValueCommand({ SecretId: AWS_SECRET_ID }));

  const secretData = JSON.parse(SecretString!);
  cachedToken = secretData.access_token;

  const iso = `${secretData.access_token_token_expired.replace(' ', 'T')}+09:00`;
  expiresAt = new Date(iso).getTime();
  console.log('expiresAt', expiresAt);
  console.log('Date.now()', Date.now());
  return cachedToken;
}

export async function requestNewAccessToken() {
  const res = await fetch(`${KIS_DOMAIN}/oauth2/tokenP`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      appkey: KIS_APP_KEY,
      appsecret: KIS_APP_SECRET,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to get access token: HTTP ${res.status} - ${errText}`);
  }

  const data = await res.json();

  if (!data.access_token || !data.expires_in) {
    throw new Error(`Invalid token response: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token;
  // expires_in: 초 단위, access_token_token_expired: "YYYY-MM-DD HH:mm:ss"
  // 6시간 이내 재호출 시 기존 토큰 리턴, 6시간 이후엔 새 토큰 발급됨
  expiresAt = Date.now() + (data.expires_in - 3600) * 1000; // 1시간 여유를 두고 만료 처리

  return cachedToken;
}

/** 2) 주식 잔고 조회 */
export async function fetchBalance({
  cano,
  acntPrdtCd,
  ctxAreaFk100 = '',
  ctxAreaNk100 = '',
}: {
  cano: string;
  acntPrdtCd: string;
  ctxAreaFk100?: string;
  ctxAreaNk100?: string;
}) {
  const q = qs.stringify({
    CANO: cano,
    ACNT_PRDT_CD: acntPrdtCd,
    AFHR_FLPR_YN: 'N',
    OFL_YN: '',
    INQR_DVSN: '02',
    UNPR_DVSN: '01',
    FUND_STTL_ICLD_YN: 'N',
    FNCG_AMT_AUTO_RDPT_YN: 'N',
    PRCS_DVSN: '00',
    CTX_AREA_FK100: ctxAreaFk100,
    CTX_AREA_NK100: ctxAreaNk100,
  });

  const accessToken = await getAccessToken();

  const res = await fetch(`${KIS_DOMAIN}/uapi/domestic-stock/v1/trading/inquire-balance?${q}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${accessToken}`,
      appkey: KIS_APP_KEY,
      appsecret: KIS_APP_SECRET,
      tr_id: 'TTTC8434R',
    },
    cache: 'no-store',
  });

  console.log(res);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<BalanceResponse>;
}

/** 타입 예시 — 필요한 필드만 골라 정의 */
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

/** ──────────────────────────────────────────
 *  (NEW) 선물·옵션 잔고 조회
 *  ────────────────────────────────────────── */
export async function fetchFoBalance({
  cano,
  acntPrdtCd,
  mgnDiv = '01', // 개시증거금
  exccStatCd = '2', // 본정산 기준
  ctxAreaFk200 = '',
  ctxAreaNk200 = '',
}: {
  cano: string;
  acntPrdtCd: string;
  mgnDiv?: '01' | '02';
  exccStatCd?: '1' | '2';
  ctxAreaFk200?: string;
  ctxAreaNk200?: string;
}) {
  const q = qs.stringify({
    CANO: cano,
    ACNT_PRDT_CD: acntPrdtCd,
    MGNA_DVSN: mgnDiv,
    EXCC_STAT_CD: exccStatCd,
    CTX_AREA_FK200: ctxAreaFk200,
    CTX_AREA_NK200: ctxAreaNk200,
  });

  const accessToken = await getAccessToken();

  const res = await fetch(
    `${KIS_DOMAIN}/uapi/domestic-futureoption/v1/trading/inquire-balance?${q}`,
    {
      method: 'GET',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        authorization: `Bearer ${accessToken}`,
        appkey: KIS_APP_KEY,
        appsecret: KIS_APP_SECRET,
        tr_id: 'CTFO6118R',
      },
      cache: 'no-store',
    },
  );

  console.log(res);

  if (!res.ok) throw new Error(`FO balance HTTP ${res.status}`);
  const data = (await res.json()) as FoBalanceResponse;

  if (data.output1.length > 0) {
    for (const item of data.output1) {
      try {
        const divergence = await getDivergenceRate(item.shtn_pdno);
        item.divergence = divergence;
      } catch (error) {
        console.warn(`Failed to get divergence rate for ${item.shtn_pdno}:`, error);
        item.divergence = '0.00';
      }
    }
  }

  return data;
}

/* 필요한 필드만 선언 */
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

/** 주식 - 일별 주문·체결 내역 */
export async function fetchDailyOrders({
  cano,
  acntPrdtCd,
  startDate,
  endDate,
  nextFk = '',
  nextNk = '',
}: {
  cano: string;
  acntPrdtCd: string;
  startDate: string; // YYYYMMDD
  endDate: string; // YYYYMMDD
  nextFk?: string; // 연속조회 검색조건
  nextNk?: string;
}) {
  const q = qs.stringify({
    CANO: cano,
    ACNT_PRDT_CD: acntPrdtCd,
    INQR_STRT_DT: startDate,
    INQR_END_DT: endDate,
    SLL_BUY_DVSN_CD: '00',
    PDNO: '',
    ORD_GNO_BRNO: '',
    ODNO: '',
    CCLD_DVSN: '00',
    INQR_DVSN: '00',
    INQR_DVSN_1: '',
    INQR_DVSN_3: '00',
    EXCG_ID_DVSN_CD: 'KRX',
    CTX_AREA_FK100: nextFk,
    CTX_AREA_NK100: nextNk,
  });

  const accessToken = await getAccessToken();

  const res = await fetch(`${KIS_DOMAIN}/uapi/domestic-stock/v1/trading/inquire-daily-ccld?${q}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${accessToken}`,
      appkey: KIS_APP_KEY,
      appsecret: KIS_APP_SECRET,
      tr_id: 'TTTC0081R', // 실전 3개월 이내 / 모의 'VTTC0081R'
      custtype: 'P',
    },
    cache: 'no-store',
  });

  console.log(res);

  if (!res.ok) throw new Error(`Daily orders HTTP ${res.status}`);
  return res.json() as Promise<OrderHistoryResponse>;
}

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

export async function fetchFoOrders({
  cano,
  acntPrdtCd,
  startDate,
  endDate,
  nextFk = '',
  nextNk = '',
}: {
  cano: string;
  acntPrdtCd: string;
  startDate: string; // YYYYMMDD
  endDate: string; // YYYYMMDD
  nextFk?: string;
  nextNk?: string;
}) {
  const q = qs.stringify({
    CANO: cano,
    ACNT_PRDT_CD: acntPrdtCd,
    STRT_ORD_DT: startDate,
    END_ORD_DT: endDate,
    SLL_BUY_DVSN_CD: '00',
    CCLD_NCCS_DVSN: '00',
    SORT_SQN: 'DS', // 역순
    STRT_ODNO: '',
    PDNO: '',
    MKET_ID_CD: '',
    CTX_AREA_FK200: nextFk,
    CTX_AREA_NK200: nextNk,
  });

  const token = await getAccessToken();

  const res = await fetch(`${KIS_DOMAIN}/uapi/domestic-futureoption/v1/trading/inquire-ccnl?${q}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${token}`,
      appkey: KIS_APP_KEY,
      appsecret: KIS_APP_SECRET,
      tr_id: 'TTTO5201R',
      custtype: 'P',
    },
    cache: 'no-store',
  });

  console.log(res);

  if (!res.ok) throw new Error(`FO orders HTTP ${res.status}`);
  return res.json() as Promise<FoOrderResponse>;
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

export async function getFutureOptionPrice(futureCode: string) {
  const accessToken = await getAccessToken();

  const q = qs.stringify({
    FID_COND_MRKT_DIV_CODE: 'JF',
    FID_INPUT_ISCD: futureCode,
  });

  const res = await fetch(
    `${KIS_DOMAIN}/uapi/domestic-futureoption/v1/quotations/inquire-price?${q}`,
    {
      method: 'GET',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        authorization: `Bearer ${accessToken}`,
        appkey: KIS_APP_KEY,
        appsecret: KIS_APP_SECRET,
        tr_id: 'FHMIF10000000',
        custtype: 'P',
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) throw new Error(`FO price HTTP ${res.status}`);
  return res.json() as Promise<FoQuoteResponse>;
}

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

// 괴리율 조회 전용 함수
export async function getDivergenceRate(futureCode: string) {
  const response = await getFutureOptionPrice(futureCode);
  return response.output1.dprt;
}

// 기간별 매매손익현황 조회 응답 타입
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

/** 기간별 매매손익현황 조회 (TTTC8715R) */
export async function fetchStockPnl({
  cano,
  acntPrdtCd,
  pdno = '',
  inqrStrtDt,
  inqrEndDt,
  sortDvsn = '00',
  ctxAreaFk100 = '',
  ctxAreaNk100 = '',
  cblcDvsn = '00',
}: {
  cano: string;
  acntPrdtCd: string;
  pdno?: string; // 상품번호 (공란 시 전체)
  inqrStrtDt: string; // 조회시작일자 (YYYYMMDD)
  inqrEndDt: string; // 조회종료일자 (YYYYMMDD)
  sortDvsn?: string; // 정렬구분 (00: 최근순, 01: 과거순, 02: 최근순)
  ctxAreaFk100?: string; // 연속조회검색조건100
  ctxAreaNk100?: string; // 연속조회키100
  cblcDvsn?: string; // 잔고구분 (00: 전체)
}): Promise<PeriodTradeProfitLossResponse> {
  const accessToken = await getAccessToken();

  const queryParams = qs.stringify({
    CANO: cano,
    SORT_DVSN: sortDvsn,
    ACNT_PRDT_CD: acntPrdtCd,
    PDNO: pdno,
    INQR_STRT_DT: inqrStrtDt,
    INQR_END_DT: inqrEndDt,
    CTX_AREA_NK100: ctxAreaNk100,
    CBLC_DVSN: cblcDvsn,
    CTX_AREA_FK100: ctxAreaFk100,
  });

  const res = await fetch(
    `${KIS_DOMAIN}/uapi/domestic-stock/v1/trading/inquire-period-trade-profit?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        authorization: `Bearer ${accessToken}`,
        appkey: KIS_APP_KEY,
        appsecret: KIS_APP_SECRET,
        tr_id: 'TTTC8715R',
        custtype: 'P',
      },
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch period trade profit/loss: HTTP ${res.status} - ${errText}`);
  }

  const data = await res.json();

  console.log('stockPnlData', data);
  return data as PeriodTradeProfitLossResponse;
}

export async function fetchFuturePnl({
  cano,
  acntPrdtCd,
  inqrStrtDay,
  inqrEndDay,
  ctxAreaFk200 = '',
  ctxAreaNk200 = '',
}: {
  cano: string;
  acntPrdtCd: string;
  inqrStrtDay: string; // YYYYMMDD
  inqrEndDay: string; // YYYYMMDD
  ctxAreaFk200?: string;
  ctxAreaNk200?: string;
}): Promise<FuturePnlResponse> {
  const accessToken = await getAccessToken();

  const queryParams = qs.stringify({
    CANO: cano,
    ACNT_PRDT_CD: acntPrdtCd,
    INQR_STRT_DAY: inqrStrtDay,
    INQR_END_DAY: inqrEndDay,
    CTX_AREA_FK200: ctxAreaFk200,
    CTX_AREA_NK200: ctxAreaNk200,
  });

  const res = await fetch(
    `${KIS_DOMAIN}/uapi/domestic-futureoption/v1/trading/inquire-daily-amount-fee?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        authorization: `Bearer ${accessToken}`,
        appkey: KIS_APP_KEY,
        appsecret: KIS_APP_SECRET,
        tr_id: 'CTFO6119R',
        custtype: 'P',
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch future PnL: HTTP ${res.status} - ${errText}`);
  }

  const data = await res.json();

  console.log('futurePnlData', data);
  return data as FuturePnlResponse;
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

export async function fetchPeriodTotalPnl({
  stock_account,
  stock_account_prod_code,
  future_account,
  future_account_prod_code,
  startDate,
  endDate,
}: {
  stock_account: string;
  stock_account_prod_code: string;
  future_account: string;
  future_account_prod_code: string;
  startDate: string;
  endDate: string;
  ctxAreaFk100?: string;
  ctxAreaNk100?: string;
}): Promise<DailyPnlData[]> {
  const [stockRes, futureRes] = await Promise.all([
    fetchStockPnl({
      cano: stock_account,
      acntPrdtCd: stock_account_prod_code,
      pdno: '',
      inqrStrtDt: startDate,
      inqrEndDt: endDate,
    }),
    fetchFuturePnl({
      cano: future_account,
      acntPrdtCd: future_account_prod_code,
      inqrStrtDay: startDate,
      inqrEndDay: endDate,
    }),
  ]);

  const transactionsByDate = new Map<string, DailyPnlData>();

  const createDayData = (date: string): DailyPnlData => ({
    date,
    totalPnl: 0,
    stockPnl: 0,
    futurePnl: 0,
    trade_count: 0,
    contango_count: 0,
    back_count: 0,
    cash_flow: 0,
  });

  const addTransaction = (date: string, pnl: number, type: 'stock' | 'future') => {
    if (!transactionsByDate.has(date)) {
      transactionsByDate.set(date, createDayData(date));
    }

    const dayData = transactionsByDate.get(date)!;
    dayData.totalPnl += pnl;

    if (type === 'stock') {
      dayData.stockPnl += pnl;
    } else {
      dayData.futurePnl += pnl;
    }
  };

  // Process stock transactions
  if (stockRes?.output1) {
    stockRes.output1.forEach((item) => {
      const pnl = parseFloat(item.rlzt_pfls);
      addTransaction(item.trad_dt, pnl, 'stock');
    });
  }

  // Process future transactions
  if (futureRes?.output2) {
    const pnl = parseFloat(futureRes.output2.trad_pfls_smtl);
    addTransaction(futureRes.output2.trad_pfls_smtl, pnl, 'future');
  }

  const result = Array.from(transactionsByDate.values()).sort((a, b) => b.date.localeCompare(a.date));
  console.log('result', result);

  return result;
}
