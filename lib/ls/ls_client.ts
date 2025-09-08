/* lib/ls/ls_client.ts */
import qs from 'querystring';
import { getAccessToken } from './ls_auth';
import { BalanceResponse } from '@/types/api/ls/balance';

const { LS_DOMAIN } = process.env as Record<string, string>;

export class LsClient {
  private readonly domain: string;
  private readonly awsSecretId: string;

  constructor(awsSecretId: string) {
    this.domain = LS_DOMAIN;
    this.awsSecretId = awsSecretId;
  }

  /** HTTP 헤더 생성 */
  private async createHttpHeaders(
    trCd: string,
    trCont: string = 'N',
    trContKey: string = '',
  ): Promise<HeadersInit> {
    const accessToken = await getAccessToken(this.awsSecretId);

    return {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${accessToken}`,
      tr_cd: trCd,
      tr_cont: trCont,
      tr_cont_key: trContKey,
    };
  }

  /** 주식 잔고 조회 */
  async fetchBalance(): Promise<BalanceResponse> {
    const headers = await this.createHttpHeaders('t0424', 'N', '');

    const requestBody = {
      t0424InBlock: {
        prcgb: '',
        chegb: '',
        dangb: '',
        charge: '',
        cts_expcode: '',
      },
    };

    const res = await fetch(`${this.domain}/stock/accno`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    console.log(res);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<BalanceResponse>;
  }
}
