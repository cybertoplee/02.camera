import { NextResponse } from 'next/server';
import { queryTable, insertRows, updateRows, deleteRows } from '@root/egdesk-helpers';
import fs from 'fs';
import path from 'path';

function deletePhysicalFile(fileUrl: string) {
  try {
    let filePath = '';
    if (fileUrl.startsWith('/cctv_uploads/')) {
      filePath = path.join(process.cwd(), 'public', fileUrl);
    } else if (fileUrl.startsWith('/api/cctv/serve?file=')) {
      const parsedUrl = new URL(fileUrl, 'http://localhost');
      const paramFile = parsedUrl.searchParams.get('file');
      if (paramFile) {
        filePath = paramFile;
      }
    }
    
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[CCTV] deleted file: ${filePath}`);
    }
  } catch (err) {
    console.error(`[CCTV] failed to delete file: ${fileUrl}`, err);
  }
}

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

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No IDs provided' }, { status: 400 });
    }

    const recordsRes = await queryTable('cctv_records');
    const records = recordsRes.rows || [];
    const targetRecords = records.filter((r: any) => ids.includes(r.id));

    for (const record of targetRecords) {
      if (record.url) {
        deletePhysicalFile(record.url);
      }
    }

    await deleteRows('cctv_records', { ids });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

