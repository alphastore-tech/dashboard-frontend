/* app/api/ls/balance/route.ts */
import { NextResponse } from 'next/server';
import { LsClient } from '@/lib/ls/ls_client';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const lsClient = new LsClient(process.env.LS_AWS_SECRET_ID!);
    const data = await lsClient.fetchBalance();
    console.log('LS balance: ', data);

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
