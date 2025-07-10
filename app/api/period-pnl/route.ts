/* app/api/period-pnl/route.ts */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import { fetchPeriodTotalPnl } from '@/lib/kis';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json(
      { message: 'startDate and endDate query parameters are required (YYYYMMDD).' },
      { status: 400 },
    );
  }

  try {
    const pnlData = await fetchPeriodTotalPnl({
      stock_account: process.env.NEXT_PUBLIC_KIS_CANO!,
      stock_account_prod_code: process.env.NEXT_PUBLIC_KIS_ACNT_PRDT_CD!,
      future_account: process.env.NEXT_PUBLIC_KIS_CANO!,
      future_account_prod_code: process.env.NEXT_PUBLIC_KIS_FUTURE_ACNT_PRDT_CD!,
      startDate,
      endDate,
    });

    return NextResponse.json(pnlData, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
