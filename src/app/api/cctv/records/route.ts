import { NextResponse } from 'next/server';
import { queryTable, insertRows } from '@root/egdesk-helpers';

export async function GET() {
  try {
    const data = await queryTable('cctv_records', { orderBy: 'id', orderDirection: 'DESC' });
    return NextResponse.json({ success: true, rows: data.rows || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, filename, size, url } = body;
    const result = await insertRows('cctv_records', [{ date, filename, size, url }]);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
