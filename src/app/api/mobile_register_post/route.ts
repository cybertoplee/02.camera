import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const parent_name = (formData.get('parent_name') as string) || '';
    const parent_phone = (formData.get('parent_phone') as string) || '';
    const class_id = (formData.get('class_id') as string) || '0';
    const face_vector = (formData.get('face_vector') as string) || '';
    const profile_image = (formData.get('profile_image') as string) || '';
    const receive_sms_in = (formData.get('receive_sms_in') as string) || 'true';
    const receive_sms_out = (formData.get('receive_sms_out') as string) || 'true';

    if (!name) {
      return NextResponse.redirect(new URL('/m/students/register?error=이름은 필수입니다.', request.url));
    }

    const apiUrl = process.env.NEXT_PUBLIC_EGDESK_API_URL || 'http://localhost:8080';
    const apiKey = process.env.NEXT_PUBLIC_EGDESK_API_KEY;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (apiKey) headers['X-Api-Key'] = apiKey;

    const rowData: any = {};
    formData.forEach((value, key) => {
      if (key === 'class_id') {
        rowData[key] = parseInt(value as string, 10);
      } else {
        rowData[key] = value as string;
      }
    });

    // Ensure defaults for essential fields if missing
    if (!rowData.birth_date) rowData.birth_date = '';
    if (!rowData.rank) rowData.rank = '';
    if (!rowData.memo) rowData.memo = '';
    if (!rowData.receive_sms_in) rowData.receive_sms_in = 'true';
    if (!rowData.receive_sms_out) rowData.receive_sms_out = 'true';
    if (!rowData.status) rowData.status = 'ACTIVE';

    // 1. Duplicate check (Name + Birthdate)
    const checkRes = await fetch(`${apiUrl}/user-data/tools/call`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tool: 'user_data_query_table',
        arguments: {
          tableName: 'students',
          filters: {
            name: rowData.name,
            birth_date: rowData.birth_date
          }
        }
      })
    });

    const checkResult = await checkRes.json();
    if (checkRes.ok && checkResult.success && checkResult.rows && checkResult.rows.length > 0) {
      const birthInfo = rowData.birth_date ? `(생일: ${rowData.birth_date})` : '';
      throw new Error(`이미 '${rowData.name}' ${birthInfo} 학생이 등록되어 있습니다.`);
    }

    // 2. Insert if not duplicate
    const res = await fetch(`${apiUrl}/user-data/tools/call`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tool: 'user_data_insert_rows',
        arguments: {
          tableName: 'students',
          rows: [rowData]
        }
      })
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      const errMsg = result.error || 'Database insertion failed';
      throw new Error(errMsg);
    }

    // Success! Redirect back to the mobile students list.
    // Use the host header to ensure the IP/domain used by the client is preserved.
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const redirectTarget = new URL('/m/students?registered=true', `${protocol}://${host}`);
    
    return NextResponse.redirect(redirectTarget, 303);
  } catch (error: any) {
    console.error('Mobile registration POST error:', error);
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const errorTarget = new URL(`/m/students/register?error=${encodeURIComponent(error.message || '알 수 없는 오류')}`, `${protocol}://${host}`);
    
    return NextResponse.redirect(errorTarget, 303);
  }
}
