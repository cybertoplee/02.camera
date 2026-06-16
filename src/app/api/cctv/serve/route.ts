import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file');

    if (!filePath || !fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Determine MIME type
    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.webm')) contentType = 'video/webm';
    else if (filePath.endsWith('.mp4')) contentType = 'video/mp4';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.png')) contentType = 'image/png';

    const range = request.headers.get('range');
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      if (start >= fileSize || end >= fileSize) {
        return new NextResponse('Requested range not satisfiable', { status: 416, headers: { 'Content-Range': `bytes */${fileSize}` }});
      }

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, {start, end});
      const stream = new ReadableStream({
        start(controller) {
          let closed = false;
          file.on('data', (chunk) => {
            if (closed) return;
            try { controller.enqueue(chunk); } catch (e) { closed = true; file.destroy(); }
          });
          file.on('end', () => {
            if (closed) return;
            closed = true;
            try { controller.close(); } catch (e) {}
          });
          file.on('error', (err) => {
            if (closed) return;
            closed = true;
            try { controller.error(err); } catch (e) {}
          });
        },
        cancel() {
          file.destroy();
        }
      });

      return new NextResponse(stream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': contentType,
        },
      });
    } else {
      const file = fs.createReadStream(filePath);
      const stream = new ReadableStream({
        start(controller) {
          let closed = false;
          file.on('data', (chunk) => {
            if (closed) return;
            try { controller.enqueue(chunk); } catch (e) { closed = true; file.destroy(); }
          });
          file.on('end', () => {
            if (closed) return;
            closed = true;
            try { controller.close(); } catch (e) {}
          });
          file.on('error', (err) => {
            if (closed) return;
            closed = true;
            try { controller.error(err); } catch (e) {}
          });
        },
        cancel() {
          file.destroy();
        }
      });
      return new NextResponse(stream, {
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': contentType,
        },
      });
    }
  } catch (error: any) {
    console.error('File serve error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
