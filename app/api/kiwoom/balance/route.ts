/* app/api/kiwoom/balance/route.ts ---------------------------------------- */
import { NextRequest, NextResponse } from 'next/server';
import { fetchKiwoomBalance } from '@/lib/kiwoom';

export const dynamic = 'force-dynamic'; // ISR/캐시 우회 — 매 요청 실행

export async function GET(req: NextRequest) {
  try {
    /* -------------------------------------------------------------
       환경변수 → 기본 계좌 정보를 우선 채워 두고,
       쿼리스트링(qry_tp, dmst_stex_tp)로 덮어쓰기
    ------------------------------------------------------------- */
    const qs = req.nextUrl.searchParams;

    const data = await fetchKiwoomBalance({
      cano: process.env.NEXT_PUBLIC_KIWOOM_CANO!,
      acntPrdtCd: process.env.NEXT_PUBLIC_KIWOOM_ACNT_PRDT_CD!,
      qry_tp: (qs.get('qry_tp') as '1' | '2') ?? '1',
      dmst_stex_tp: (qs.get('dmst_stex_tp') as 'KRX' | 'NXT') ?? 'KRX',
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}
