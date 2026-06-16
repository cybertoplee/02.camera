import { NextResponse } from 'next/server';
import { queryTable, insertRows, deleteRows } from '@root/egdesk-helpers';
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
    const data = await queryTable('cctv_events', { orderBy: 'id', orderDirection: 'DESC' });
    return NextResponse.json({ success: true, rows: data.rows || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { timestamp, type, snapshot, video_url } = body;
    const result = await insertRows('cctv_events', [{ timestamp, type, snapshot, video_url }]);
    return NextResponse.json({ success: true, result });
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

    const eventsRes = await queryTable('cctv_events');
    const events = eventsRes.rows || [];
    const targetEvents = events.filter((e: any) => ids.includes(e.id));

    for (const event of targetEvents) {
      if (event.snapshot) {
        deletePhysicalFile(event.snapshot);
      }
    }

    await deleteRows('cctv_events', { ids });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
