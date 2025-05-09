/* lib/kis.ts */
import qs from 'querystring'

const {
  KIS_APP_KEY,
  KIS_APP_SECRET,
  KIS_DOMAIN,
} = process.env as Record<string, string>

/** access-token 캐시 (메모리) */
let token = ''
let expiresAt = 0

/** 1) 접근토큰 발급 (OAuth2 Client Credentials Grant) */
export async function getAccessToken() {
  // 토큰이 아직 유효하면 캐시된 토큰 반환
  if (Date.now() < expiresAt && token) return token;

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

  token = data.access_token;
  // expires_in: 초 단위, access_token_token_expired: "YYYY-MM-DD HH:mm:ss"
  // 6시간 이내 재호출 시 기존 토큰 리턴, 6시간 이후엔 새 토큰 발급됨
  // expires_in은 24시간(86400초) 기준, 1시간(3600초) 여유 두고 만료 처리
  expiresAt = Date.now() + (data.expires_in - 3600) * 1000;

  return token;
}

/** 2) 주식 잔고 조회 */
export async function fetchBalance({
  cano,
  acntPrdtCd,
  ctxAreaFk100 = '',
  ctxAreaNk100 = '',
}: {
  cano: string
  acntPrdtCd: string
  ctxAreaFk100?: string
  ctxAreaNk100?: string
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
  })

  const accessToken = await getAccessToken()

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
  })

  console.log(res);

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<BalanceResponse>
}

/** 타입 예시 — 필요한 필드만 골라 정의 */
export interface BalanceResponse {
  output1: {
    pdno: string    // 종목코드
    prdt_name: string
    hldg_qty: string
    pchs_avg_pric: string
    evlu_pfls_rt: string
  }[],
  output2: {
    tot_evlu_amt: string // 총평가금액
  }[]
}


/** ──────────────────────────────────────────
 *  (NEW) 선물·옵션 잔고 조회
 *  ────────────────────────────────────────── */
export async function fetchFoBalance({
  cano,
  acntPrdtCd,
  mgnDiv = '01',           // 개시증거금
  exccStatCd = '2',        // 정산가 기준
  ctxAreaFk200 = '',
  ctxAreaNk200 = '',
}: {
  cano: string
  acntPrdtCd: string
  mgnDiv?: '01' | '02'
  exccStatCd?: '1' | '2'
  ctxAreaFk200?: string
  ctxAreaNk200?: string
}) {
  const q = qs.stringify({
    CANO: cano,
    ACNT_PRDT_CD: acntPrdtCd,
    MGNA_DVSN: mgnDiv,
    EXCC_STAT_CD: exccStatCd,
    CTX_AREA_FK200: ctxAreaFk200,
    CTX_AREA_NK200: ctxAreaNk200,
  })

  const accessToken = await getAccessToken()

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
  )

  console.log(res);

  if (!res.ok) throw new Error(`FO balance HTTP ${res.status}`)
  return res.json() as Promise<FoBalanceResponse>
}

/* 필요한 필드만 선언 */
export interface FoBalanceResponse {
  output1: {
    pdno: string          // 종목코드
    prdt_name: string     // 종목명
    sll_buy_dvsn_name: string // 매수/매도
    cblc_qty: string      // 잔고수량
    ccld_avg_unpr1: string// 평균단가
    evlu_pfls_amt: string // 평가손익
  }[],
  output2: {
    prsm_dpast: string    // 추정예탁자산
  }[]
}


