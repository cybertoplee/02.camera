import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;

    if (!id || !name) {
      const target = id ? `/m/students/edit/${id}` : '/m/students';
      return NextResponse.redirect(new URL(`${target}?error=이름은 필수입니다.`, request.url));
    }

    const apiUrl = process.env.NEXT_PUBLIC_EGDESK_API_URL || 'http://localhost:8080';
    const apiKey = process.env.NEXT_PUBLIC_EGDESK_API_KEY;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (apiKey) headers['X-Api-Key'] = apiKey;

    const rowData: any = {};
    formData.forEach((value, key) => {
      if (key === 'id') return; // ID is handled separately
      if (key === 'class_id') {
        rowData[key] = parseInt(value as string, 10);
      } else {
        rowData[key] = value as string;
      }
    });

    // 1. Duplicate check (Same name/birth_date but different ID)
    if (rowData.name) {
      const birth_date = rowData.birth_date || '';
      const checkRes = await fetch(`${apiUrl}/user-data/tools/call`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tool: 'user_data_query_table',
          arguments: {
            tableName: 'students',
            filters: {
              name: rowData.name,
              birth_date: birth_date
            }
          }
        })
      });
      
      const checkResult = await checkRes.json();
      if (checkRes.ok && checkResult.success && checkResult.rows) {
        const duplicate = checkResult.rows.find((r: any) => r.id !== parseInt(id, 10));
        if (duplicate) {
          const birthInfo = birth_date ? `(생일: ${birth_date})` : '';
          throw new Error(`이미 '${rowData.name}' ${birthInfo} 학생이 등록되어 있습니다.`);
        }
      }
    }

    // 2. Update if no duplicate
    const res = await fetch(`${apiUrl}/user-data/tools/call`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tool: 'user_data_update_rows',
        arguments: {
          tableName: 'students',
          filters: { id: parseInt(id, 10) },
          updates: rowData
        }
      })
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Update failed');
    }

    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const redirectTarget = new URL('/m/students?updated=true', `${protocol}://${host}`);
    
    return NextResponse.redirect(redirectTarget, 303);
  } catch (error: any) {
    console.error('Mobile edit POST error:', error);
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const errorTarget = new URL(`/m/students?error=${encodeURIComponent(error.message || '수정 오류')}`, `${protocol}://${host}`);
    return NextResponse.redirect(errorTarget, 303);
  }
}
