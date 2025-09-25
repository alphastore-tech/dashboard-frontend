/* lib/ls/ls_client.ts */
import qs from 'querystring';
import { getAccessToken } from './ls_auth';
import { BalanceResponse } from '@/types/api/ls/balance';
import { OrderResponse } from '@/types/api/ls/order';
import { OrderResponse2 } from '@/types/api/ls/order';
import dayjs from 'dayjs';

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

  /** 일별 주문체결 조회 */
  async fetchOrder(): Promise<OrderResponse> {
    const headers = await this.createHttpHeaders('CSPAQ13700', 'N', '');
    const today = dayjs().format('YYYYMMDD');

    const requestBody = {
      CSPAQ13700InBlock1: {
        OrdMktCode: '00',
        BnsTpCode: '0',
        IsuNo: '',
        ExecYn: '0',
        OrdDt: today,
        SrtOrdNo2: 0,
        BkseqTpCode: '0',
        OrdPtnCode: '00',
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
    return res.json() as Promise<OrderResponse>;
  }

  /** 일별 주문체결 조회 */
  async fetchOrder2(): Promise<OrderResponse2> {
    const headers = await this.createHttpHeaders('CDPCQ04700', 'N', '');
    const today = dayjs().format('YYYYMMDD');

    const requestBody = {
      CDPCQ04700InBlock1: {
        QryTp: '0',
        QrySrtDt: today,
        QryEndDt: today,
        SrtNo: 0,
        PdptnCode: '01',
        IsuLgclssCode: '01',
        IsuNo: '',
      },
    };

    const res = await fetch(`${this.domain}/stock/accno`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<OrderResponse2>;
  }
}
