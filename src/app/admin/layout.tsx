import React from 'react';
import { LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* 전역 나가기 버튼 */}
      <a 
        href="http://localhost:3000/"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '16px 32px',
          backgroundColor: '#0F172A',
          color: 'white',
          borderRadius: '100px',
          fontWeight: 900,
          textDecoration: 'none',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s'
        }}
        className="hover:bg-slate-800 hover:-translate-y-1"
      >
        <span>나가기</span>
        <LogOut size={20} />
      </a>
    </>
  );
}
