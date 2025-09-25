/* app/api/ls/balance/route.ts */
import { NextResponse } from 'next/server';
import { LsClient } from '@/lib/ls/ls_client';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const lsClient = new LsClient(process.env.LS_AWS_SECRET_ID!);

    const orderData = await lsClient.fetchOrder();
    console.log('LS order: ', orderData);

    const orderData2 = await lsClient.fetchOrder2();
    console.log('LS order2: ', orderData2);

    return NextResponse.json(orderData, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
