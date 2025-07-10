import { NextResponse } from 'next/server';
import { fetchDailyOrders } from '@/lib';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = dayjs().format('YYYYMMDD');
    const data = await fetchDailyOrders({
      cano: process.env.NEXT_PUBLIC_KIS_CANO!,
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
