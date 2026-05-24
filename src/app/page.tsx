import React from 'react';
import Image from 'next/image';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '80vh', gap: '40px' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.05em', textAlign: 'center' }}>
        EGDESK 출결관리 시스템
      </h1>
      
      <div style={{ position: 'relative', width: '400px', height: '400px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' }}>
        <Image 
          src="/attendance_symbol.png" 
          alt="출결관리 시스템 상징" 
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      <p style={{ color: '#64748B', fontSize: '18px', fontWeight: 500, textAlign: 'center', maxWidth: '600px', lineHeight: '1.6' }}>
        AI 기반 스마트 출결 관리 시스템에 오신 것을 환영합니다.<br />
        좌측 메뉴를 통해 출결 모니터링, 관원 관리, 시스템 설정 등을 이용하실 수 있습니다.
      </p>

      {/* 나가기 버튼 */}
      <a 
        href="http://woorinara.ai.kr/"
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
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      </a>
    </div>
  );
}
