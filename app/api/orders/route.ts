import { NextResponse } from 'next/server'
import { fetchDailyOrders } from '@/lib/kis'
import dayjs from 'dayjs'

export async function GET() {
  try {
    const today = dayjs().format('YYYYMMDD')
    const data = await fetchDailyOrders({
      cano: process.env.KIS_CANO!,
      acntPrdtCd: process.env.KIS_ACNT_PRDT_CD!,
      startDate: today,
      endDate: today,
    })
    return NextResponse.json(data)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
