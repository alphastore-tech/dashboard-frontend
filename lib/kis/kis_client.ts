/* lib/kis/kis_client.ts */
import qs from 'querystring';
import { getAccessToken } from './kis_auth';
import { BalanceResponse } from '@/types/api/kis/balance';
import { FoBalanceResponse } from '@/types/api/kis/future-balance';
import { OverseasBalanceResponse } from '@/types/api/kis/overseas-balance';
import { OrderHistoryResponse, FoOrderResponse } from '@/types/api/kis/order';
import { FoQuoteResponse } from '@/types/api/kis/quote';
import {
  PeriodTradeProfitLossResponse,
  FuturePnlResponse,
  DailyPnlData,
} from '@/types/api/kis/pnl';

const { KIS_DOMAIN } = process.env as Record<string, string>;

export class KisClient {
  private readonly appKey: string;
  private readonly appSecret: string;
  private readonly domain: string;
  private readonly awsSecretId: string;

  constructor(appKey: string, appSecret: string, awsSecretId: string) {
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.domain = KIS_DOMAIN;
    this.awsSecretId = awsSecretId;
  }

  /** HTTP 헤더 생성 */
  private async createHttpHeaders(
    trId: string,
    custtype: string = 'P',
    trCont?: string,
  ): Promise<HeadersInit> {
    const accessToken = await getAccessToken(this.awsSecretId);

    return {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${accessToken}`,
      appkey: this.appKey,
      appsecret: this.appSecret,
      tr_id: trId,
      custtype: custtype,
      tr_cont: trCont || '',
    };
  }

  /** 주식 잔고 조회 */
  async fetchBalance({
    cano,
    acntPrdtCd,
    ctxAreaFk100 = '',
    ctxAreaNk100 = '',
  }: {
    cano: string;
    acntPrdtCd: string;
    ctxAreaFk100?: string;
    ctxAreaNk100?: string;
  }): Promise<BalanceResponse> {
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

    const headers = await this.createHttpHeaders('TTTC8434R');

    const res = await fetch(`${this.domain}/uapi/domestic-stock/v1/trading/inquire-balance?${q}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    console.log(res);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<BalanceResponse>;
  }

  /** 선물·옵션 잔고 조회 */
  async fetchFoBalance({
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
  }): Promise<FoBalanceResponse> {
    const q = qs.stringify({
      CANO: cano,
      ACNT_PRDT_CD: acntPrdtCd,
      MGNA_DVSN: mgnDiv,
      EXCC_STAT_CD: exccStatCd,
      CTX_AREA_FK200: ctxAreaFk200,
      CTX_AREA_NK200: ctxAreaNk200,
    });

    const headers = await this.createHttpHeaders('CTFO6118R');

    const res = await fetch(
      `${this.domain}/uapi/domestic-futureoption/v1/trading/inquire-balance?${q}`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      },
    );

    console.log(res);

    if (!res.ok) throw new Error(`FO balance HTTP ${res.status}`);
    const data = (await res.json()) as FoBalanceResponse;

    if (data.output1.length > 0) {
      for (const item of data.output1) {
        try {
          const divergence = await this.getDivergenceRate(item.shtn_pdno);
          item.divergence = divergence;
        } catch (error) {
          console.warn(`Failed to get divergence rate for ${item.shtn_pdno}:`, error);
          item.divergence = '0.00';
        }
      }
    }

    return data;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🌏  해외주식
  // ─────────────────────────────────────────────────────────────────────────────

  /** 해외주식 잔고 조회 */
  async fetchOverseasBalance({
    cano,
    acntPrdtCd,
    ovrsExcgCd,
    trCrcyCd,
    ctxAreaFk200 = '',
    ctxAreaNk200 = '',
  }: {
    cano: string; // 종합계좌 앞 8자리
    acntPrdtCd: string; // 계좌 상품 코드 뒤 2자리
    ovrsExcgCd: string; // 해외거래소 코드 (NASD, NYSE, etc.)
    trCrcyCd: string; // 거래 통화 코드 (USD, HKD, ...)
    ctxAreaFk200?: string; // 연속조회검색조건200
    ctxAreaNk200?: string; // 연속조회키200
  }): Promise<OverseasBalanceResponse> {
    const q = qs.stringify({
      CANO: cano,
      ACNT_PRDT_CD: acntPrdtCd,
      OVRS_EXCG_CD: ovrsExcgCd,
      TR_CRCY_CD: trCrcyCd,
      CTX_AREA_FK200: ctxAreaFk200,
      CTX_AREA_NK200: ctxAreaNk200,
    });

    const headers = await this.createHttpHeaders('TTTS3012R');

    const res = await fetch(`${this.domain}/uapi/overseas-stock/v1/trading/inquire-balance?${q}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    console.log(res);

    if (!res.ok) throw new Error(`Overseas balance HTTP ${res.status}`);
    return res.json() as Promise<OverseasBalanceResponse>;
  }

  /** 주식 - 일별 주문·체결 내역 */
  async fetchDailyOrders({
    cano,
    acntPrdtCd,
    startDate,
    endDate,
  }: {
    cano: string;
    acntPrdtCd: string;
    startDate: string; // YYYYMMDD
    endDate: string; // YYYYMMDD
    nextFk?: string; // 연속조회 검색조건
    nextNk?: string;
  }): Promise<OrderHistoryResponse> {
    const rows: any[] = [];

    let nextFk = '';
    let nextNk = '';
    let trCont = ''; // "" → 첫 호출, "N" → 다음 페이지
    let more = true;

    // 마지막 페이지의 응답(JSON)을 저장해 둘 변수
    let lastBody: OrderHistoryResponse | null = null;
    while (more) {
      const headers = await this.createHttpHeaders('TTTC0081R', 'P', trCont);

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

      const res = await fetch(
        `${this.domain}/uapi/domestic-stock/v1/trading/inquire-daily-ccld?${q}`,
        { method: 'GET', headers, cache: 'no-store' },
      );
      if (!res.ok) throw new Error(`Daily orders HTTP ${res.status}`);

      const body = (await res.json()) as OrderHistoryResponse;
      lastBody = body; // ← 매번 덮어쓰므로 결국 '마지막 응답'이 남음
      rows.push(...body.output1); // ← 모든 페이지의 주문·체결 누적

      // 연속 조회 준비
      const trContRes = res.headers.get('tr_cont'); // F/M: 더 있음, D/E: 끝
      if (trContRes === 'F' || trContRes === 'M') {
        trCont = 'N';
        nextFk = body.ctx_area_fk100.trim();
        nextNk = body.ctx_area_nk100.trim();
      } else {
        more = false;
      }

      // console.log('trContRes', trContRes);
      // console.log('nextFk', nextFk);
      // console.log('nextNk', nextNk);
      // console.log('trCont', trCont);
    }

    // lastBody 는 마지막 응답의 ‘껍데기’, rows 는 모든 페이지의 주문·체결
    if (!lastBody) throw new Error('No data returned from API');

    // console.log('total order rows', rows.slice(0, 2));

    return {
      ...lastBody,
      output1: rows, // 주문·체결 내역만 “전 페이지 합본”으로 교체
    };
  }

  /** 선물·옵션 - 일별 주문·체결 내역 */
  async fetchFoOrders({
    cano,
    acntPrdtCd,
    startDate,
    endDate,
  }: {
    cano: string;
    acntPrdtCd: string;
    startDate: string; // YYYYMMDD
    endDate: string; // YYYYMMDD
  }): Promise<FoOrderResponse> {
    const rows: any[] = [];

    let nextFk = ''; // ← API가 돌려주는 값을 계속 갱신
    let nextNk = '';
    let trCont = ''; // ""→첫 호출, "N"→다음 페이지
    let more = true;

    let lastBody: FoOrderResponse | null = null; // 마지막 응답 껍데기

    while (more) {
      /* 1) 헤더: tr_cont 를 키:값으로 넘겨야 함 */
      const headers = await this.createHttpHeaders(
        'TTTO5201R', // 실전 TR
        'P', // 개인
        trCont, // "" 또는 "N"
      );

      /* 2) 쿼리 */
      const q = qs.stringify({
        CANO: cano,
        ACNT_PRDT_CD: acntPrdtCd,
        STRT_ORD_DT: startDate,
        END_ORD_DT: endDate,
        SLL_BUY_DVSN_CD: '00',
        CCLD_NCCS_DVSN: '00',
        SORT_SQN: 'DS',
        STRT_ODNO: '',
        PDNO: '',
        MKET_ID_CD: '',
        CTX_AREA_FK200: nextFk,
        CTX_AREA_NK200: nextNk,
      });

      const res = await fetch(
        `${this.domain}/uapi/domestic-futureoption/v1/trading/inquire-ccnl?${q}`,
        { method: 'GET', headers, cache: 'no-store' },
      );
      if (!res.ok) throw new Error(`FO orders HTTP ${res.status}`);

      const body = (await res.json()) as FoOrderResponse;
      lastBody = body; // 마지막 응답 보존
      rows.push(...body.output1); // 전체 주문·체결 누적

      /* 3) 연속조회 체크 */
      const trContRes = res.headers.get('tr_cont'); // F/M = 더 있음
      if (trContRes === 'F' || trContRes === 'M') {
        trCont = 'N'; // 다음 호출부터 'N'
        nextFk = body.ctx_area_fk200.trim(); // ← 반드시 응답값 사용
        nextNk = body.ctx_area_nk200.trim();
      } else {
        more = false; // 마지막 페이지
      }
    }

    if (!lastBody) throw new Error('No data returned from API');

    /* 4) 마지막 응답의 골격 + 합산 output1 */
    return { ...lastBody, output1: rows };
  }

  /** 선물·옵션 가격 조회 */
  async getFutureOptionPrice(futureCode: string): Promise<FoQuoteResponse> {
    const q = qs.stringify({
      FID_COND_MRKT_DIV_CODE: 'JF',
      FID_INPUT_ISCD: futureCode,
    });

    const headers = await this.createHttpHeaders('FHMIF10000000');

    const res = await fetch(
      `${this.domain}/uapi/domestic-futureoption/v1/quotations/inquire-price?${q}`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      },
    );

    if (!res.ok) throw new Error(`FO price HTTP ${res.status}`);
    return res.json() as Promise<FoQuoteResponse>;
  }

  /** 괴리율 조회 전용 함수 */
  async getDivergenceRate(futureCode: string): Promise<string> {
    const response = await this.getFutureOptionPrice(futureCode);
    return response.output1.dprt;
  }

  /** 기간별 매매손익현황 조회 (주식) */
  async fetchStockPnl({
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

    const headers = await this.createHttpHeaders('TTTC8715R');

    const res = await fetch(
      `${this.domain}/uapi/domestic-stock/v1/trading/inquire-period-trade-profit?${queryParams}`,
      {
        method: 'GET',
        headers,
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

  /** 기간별 매매손익현황 조회 (선물·옵션) */
  async fetchFuturePnl({
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
    const queryParams = qs.stringify({
      CANO: cano,
      ACNT_PRDT_CD: acntPrdtCd,
      INQR_STRT_DAY: inqrStrtDay,
      INQR_END_DAY: inqrEndDay,
      CTX_AREA_FK200: ctxAreaFk200,
      CTX_AREA_NK200: ctxAreaNk200,
    });

    const headers = await this.createHttpHeaders('CTFO6119R');

    const res = await fetch(
      `${this.domain}/uapi/domestic-futureoption/v1/trading/inquire-daily-amount-fee?${queryParams}`,
      {
        method: 'GET',
        headers,
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

  /** 기간별 총 손익 조회 */
  async fetchPeriodTotalPnl({
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
      this.fetchStockPnl({
        cano: stock_account,
        acntPrdtCd: stock_account_prod_code,
        pdno: '',
        inqrStrtDt: startDate,
        inqrEndDt: endDate,
      }),
      this.fetchFuturePnl({
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

    const result = Array.from(transactionsByDate.values()).sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    console.log('result', result);

    return result;
  }
}
