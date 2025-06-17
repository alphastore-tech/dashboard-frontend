import 'server-only'; // 이 파일이 클라이언트 번들에 포함되지 않도록
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export interface KiwoomTokenResponse {
  /** 토큰 만료 일시(ISO 8601 또는 Kiwoom 포맷) */
  expires_dt: string;
  /** 일반적으로 "Bearer" */
  token_type: string;
  /** 실제 접근 토큰 */
  token: string;

  return_code: number;
  return_msg: string;
}

let cachedToken: string | null = null;
let expiresAt: number = 0;

export async function getKiwoomAccessToken() {
  if (cachedToken && Date.now() < expiresAt) {
    return cachedToken;
  }

  const sm = new SecretsManagerClient({ region: 'ap-northeast-2' });
  const { SecretString } = await sm.send(
    new GetSecretValueCommand({ SecretId: process.env.AWS_SECRET_ID_KIWOOM }),
  );

  const secretData = JSON.parse(SecretString!);
  cachedToken = secretData.token;

  console.log('expireddt', secretData.expires_dt);

  // expires_dt 형식: 20250615181054 (YYYYMMDDHHMMSS)
  const expireddt = secretData.expires_dt;
  const year = parseInt(expireddt.substring(0, 4));
  const month = parseInt(expireddt.substring(4, 6));
  const day = parseInt(expireddt.substring(6, 8));
  const hour = parseInt(expireddt.substring(8, 10));
  const minute = parseInt(expireddt.substring(10, 12));
  const second = parseInt(expireddt.substring(12, 14));

  console.log('year', year);
  console.log('month', month);
  console.log('day', day);
  console.log('hour', hour);
  console.log('minute', minute);
  console.log('second', second);

  expiresAt = new Date(year, month, day, hour, minute, second).getTime();
  console.log('expiresAt', expiresAt);
  console.log('Date.now()', Date.now());
  return cachedToken;
}

/**
 * Kiwoom OAuth2 client-credentials 방식으로 접근 토큰 발급
 *
 * @param appKey    Kiwoom에서 발급받은 AppKey
 * @param secretKey Kiwoom에서 발급받은 SecretKey
 */
export async function requestKiwoomAccessToken(appKey: string, secretKey: string): Promise<string> {
  const url = 'https://api.kiwoom.com/oauth2/token';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      appkey: appKey,
      secretkey: secretKey,
    }),
  });

  if (!res.ok) {
    // 응답 본문을 그대로 노출하면 키 등이 로그에 남을 수 있으므로 상황에 맞게 처리
    const errorBody = await res.text();
    throw new Error(`Kiwoom token request failed (${res.status}): ${errorBody}`);
  }

  const accessToken = (await res.json()) as KiwoomTokenResponse;

  if (accessToken.return_code != 0) {
    throw new Error(
      `Kiwoom token request failed (${accessToken.return_code}): ${accessToken.return_msg}`,
    );
  }

  console.log('kiwoomAccessToken:', accessToken);

  if (!accessToken.token) {
    throw new Error('Kiwoom token response missing "token" field');
  }

  return accessToken.token;
}

/* ----------------------------- 타입 ------------------------------ */
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

/* --------------------------- 메인 함수 --------------------------- */
export async function fetchKiwoomBalance(req: BalanceRequest): Promise<KiwoomBalanceResponse> {
  const accessToken = await getKiwoomAccessToken();

  if (!accessToken) throw new Error('No Kiwoom Access Token');

  const payload = {
    qry_tp: '1',
    dmst_stex_tp: 'KRX',
    ...req,
  };
  const API_ID = 'kt00018'; // 계좌평가잔고내역요청
  const KIWOOM_URL = 'https://api.kiwoom.com/api/dostk/acnt';

  const res = await fetch(KIWOOM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${accessToken}`,
      'api-id': API_ID,
    },
    body: JSON.stringify(payload),
  });

  console.log(res);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[Kiwoom] ${res.status} ${res.statusText}: ${text}`);
  }

  const data = await res.json();

  console.log(data);

  // 각 종목에 대해 업종명 조회하여 추가
  if (data.acnt_evlt_remn_indv_tot) {
    for (const item of data.acnt_evlt_remn_indv_tot) {
      try {
        const code = item.stk_cd?.startsWith('A') ? item.stk_cd.slice(1) : item.stk_cd;
        const stockInfo = await getStockInformation(code);

        item.upName = stockInfo?.upName || 'ETF';
      } catch (error) {
        console.warn(`Failed to get industry name for ${item.stk_cd}:`, error);
        item.upName = null;
      }
    }
  }

  return data;
}

/*
 * Kiwoom 종목정보(ka10100) – 업종명 조회 유틸
 * ---------------------------------------------------------------------------
 *  • 호출 예:
 *      const sector = await getIndustryName("005930"); // "반도체"
 *
 *  • 필요 환경변수:
 *      NEXT_PUBLIC_KIWOOM_ACCESS_TOKEN  (OAuth2 access token)
 *      NEXT_PUBLIC_KIWOOM_API_HOST      ("https://api.kiwoom.com" 기본값)
 *
 *  • 에러 처리:
 *      – HTTP 오류 → throw Error
 *      – 응답에 upName 없을 때 → null 반환
 * ---------------------------------------------------------------------------
 */

export interface StockInfoResponse {
  code?: string; // 종목코드
  name?: string; // 종목명
  upName?: string; // 업종명
  [key: string]: unknown; // 기타 필드 무시
}

/**
 * 종목코드로 업종명(업종대분류)을 반환한다.
 * @param stockCode 6자리 종목코드 (e.g. "005930")
 * @param opts.mock  모의투자 도메인 사용 여부 (기본: false)
 */
export async function getStockInformation(stockCode: string): Promise<StockInfoResponse | null> {
  const accessToken = await getKiwoomAccessToken();
  if (!accessToken) {
    throw new Error('KIWOOM_ACCESS_TOKEN is not set');
  }

  const host = 'https://api.kiwoom.com';
  const API_ID = 'ka10100';

  const res = await fetch(`${host}/api/dostk/stkinfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      authorization: `Bearer ${accessToken}`,
      'api-id': API_ID,
    },
    body: JSON.stringify({ stk_cd: stockCode }),
  });

  if (!res.ok) {
    // Kiwoom은 200 이외에도 오류코드를 JSON body에 넣어줄 수 있으므로 HTTP 오류 우선 체크
    throw new Error(`Kiwoom API error ${res.status} ${res.statusText}`);
  }

  console.log(res);
  console.log(res.body);
  const response: StockInfoResponse = await res.json();

  return response;
}
