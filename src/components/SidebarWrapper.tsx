'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobileRoute = pathname.startsWith('/m');
  const isAttendance = pathname === '/attendance';

  if (isMobileRoute) {
    return <>{children}</>;
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '240px 1fr', 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: '#F8FAFC'
    }}>
      {/* Decorative Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -10 }}>
        <div style={{ 
          position: 'absolute', 
          top: '-10%', 
          left: '-5%', 
          width: '40%', 
          height: '40%', 
          backgroundColor: 'rgba(59, 130, 246, 0.05)', 
          filter: 'blur(120px)', 
          borderRadius: '50%' 
        }}></div>
        <div style={{ 
          position: 'absolute', 
          bottom: '-10%', 
          right: '-5%', 
          width: '30%', 
          height: '30%', 
          backgroundColor: 'rgba(99, 102, 241, 0.05)', 
          filter: 'blur(100px)', 
          borderRadius: '50%' 
        }}></div>
      </div>

      <Sidebar />

      <main 
        key={pathname}
        style={{ 
          padding: isAttendance ? '0' : '48px', 
          overflowY: isAttendance ? 'hidden' : 'auto',
          animation: 'fadeInSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {children}
        <style jsx global>{`
          @keyframes fadeInSlide {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </main>
    </div>
  );
}
