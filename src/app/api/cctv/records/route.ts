import { NextResponse } from 'next/server';
import { queryTable, insertRows, updateRows } from '@root/egdesk-helpers';

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
    if (body.sync && Array.isArray(body.records)) {
      const results = [];
      for (const rec of body.records) {
        const { date, filename, size, url } = rec;
        const existing = await queryTable('cctv_records', { filters: { filename } });
        if (existing.rows && existing.rows.length > 0) {
          const recordId = existing.rows[0].id;
          const res = await updateRows('cctv_records', { date, size, url }, { ids: [recordId] });
          results.push({ action: 'update', filename, result: res });
        } else {
          const res = await insertRows('cctv_records', [{ date, filename, size, url }]);
          results.push({ action: 'insert', filename, result: res });
        }
      }
      return NextResponse.json({ success: true, results });
    } else {
      const { date, filename, size, url } = body;
      const result = await insertRows('cctv_records', [{ date, filename, size, url }]);
      return NextResponse.json({ success: true, result });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

