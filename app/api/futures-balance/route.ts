import { NextResponse } from 'next/server';
import { fetchFoBalance } from '@/lib/kis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchFoBalance({
      cano: process.env.NEXT_PUBLIC_KIS_CANO!,
      acntPrdtCd: process.env.NEXT_PUBLIC_KIS_FUTURE_ACNT_PRDT_CD!,
    });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
