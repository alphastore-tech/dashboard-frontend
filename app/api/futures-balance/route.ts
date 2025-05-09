import { NextResponse } from 'next/server'
import { fetchFoBalance } from '@/lib/kis'

export async function GET() {
  try {
    const data = await fetchFoBalance({
      cano: process.env.KIS_CANO!,
      acntPrdtCd: process.env.KIS_FUTURE_ACNT_PRDT_CD!,
    })
    return NextResponse.json(data)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
