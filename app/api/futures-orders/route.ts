import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import { KisClient } from '@/lib/kis/kis_client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const kisClient = new KisClient();
    const today = dayjs().format('YYYYMMDD');
    const data = await kisClient.fetchFoOrders({
      cano: process.env.NEXT_PUBLIC_KIS_CANO!,
      acntPrdtCd: process.env.NEXT_PUBLIC_KIS_FUTURE_ACNT_PRDT_CD!,
      startDate: today,
      endDate: today,
    });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
