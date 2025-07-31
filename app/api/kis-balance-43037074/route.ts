/* app/api/balance/route.ts */
import { NextResponse } from 'next/server';
import { KisClient } from '@/lib/kis/kis_client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const kisClient = new KisClient(
      process.env.KIS_APP_KEY!,
      process.env.KIS_APP_SECRET!,
      process.env.AWS_SECRET_ID!,
    );
    const data = await kisClient.fetchBalance({
      cano: process.env.NEXT_PUBLIC_KIS_CANO!,
      acntPrdtCd: process.env.NEXT_PUBLIC_KIS_ACNT_PRDT_CD!,
    });

    const overseasData = await kisClient.fetchOverseasBalance({
      cano: process.env.NEXT_PUBLIC_KIS_CANO!,
      acntPrdtCd: process.env.NEXT_PUBLIC_KIS_ACNT_PRDT_CD!,
      ovrsExcgCd: 'USD',
      trCrcyCd: 'KRW',
    });
    console.log('overseasData', overseasData);

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
