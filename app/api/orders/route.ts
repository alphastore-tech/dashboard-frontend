import { NextResponse } from 'next/server';
import { KisClient } from '@/lib/kis/kis_client';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const kisClient = new KisClient(
      process.env.NEXT_PUBLIC_KIS_SPOT_APP_KEY!,
      process.env.NEXT_PUBLIC_KIS_SPOT_APP_SECRET!,
      process.env.AWS_SECRET_ID_SPOT!,
    );
    const today = dayjs().format('YYYYMMDD');
    const data = await kisClient.fetchDailyOrders({
      cano: process.env.NEXT_PUBLIC_KIS_SPOT_CANO!,
      acntPrdtCd: process.env.NEXT_PUBLIC_KIS_ACNT_PRDT_CD!,
      startDate: today,
      endDate: today,
    });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
