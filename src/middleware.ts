import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  const { pathname } = request.nextUrl;

  // 만약 모바일 기기로 /admin 에 접근하면 /m 으로 리다이렉트
  if (isMobile && pathname.startsWith('/admin')) {
    const mobilePath = pathname.replace('/admin', '/m');
    return NextResponse.redirect(new URL(mobilePath, request.url));
  }

  // 만약 데스크탑 기기로 /m 에 접근하면 /admin 으로 리다이렉트
  if (!isMobile && pathname.startsWith('/m')) {
    const desktopPath = pathname.replace('/m', '/admin');
    return NextResponse.redirect(new URL(desktopPath, request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/m/:path*'],
};
