import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get the base file name from formData or generate one
    let originalName = file.name;
    if (!originalName || originalName === 'blob') {
      const ext = file.type === 'video/webm' ? '.webm' : '.jpg';
      originalName = `upload_${Date.now()}${ext}`;
    }

    const targetFolder = formData.get('targetFolder') as string | null;
    let uploadDir = path.join(process.cwd(), 'public', 'cctv_uploads');
    
    if (targetFolder && targetFolder.trim() !== '') {
      uploadDir = targetFolder;
    }

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const finalFilename = `${Date.now()}_${safeName}`;
    const filePath = path.join(uploadDir, finalFilename);

    fs.writeFileSync(filePath, buffer);

    let fileUrl = `/cctv_uploads/${finalFilename}`;
    if (targetFolder && targetFolder.trim() !== '') {
      fileUrl = `/api/cctv/serve?file=${encodeURIComponent(filePath)}`;
    }

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
