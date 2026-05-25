'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, UserPlus, MonitorPlay, ClipboardList, Users, Coins, Settings, User, Lock, LogIn, LogOut } from 'lucide-react';

export default function Sidebar() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'DEVELOPER' | 'ADMIN' | 'USER' | 'LOGGED_OUT'>('DEVELOPER');

  // Load saved role on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('user_role') as any;
    if (savedRole && ['DEVELOPER', 'ADMIN', 'USER'].includes(savedRole)) {
      setRole(savedRole);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // 'user' / '1234'
      if (btoa(username) === 'dXNlcg==' && btoa(password) === 'MTIzNA==') {
        setRole('USER');
        localStorage.setItem('user_role', 'USER');
      // 'manager' / '12345678'
      } else if (btoa(username) === 'bWFuYWdlcg==' && btoa(password) === 'MTIzNDU2Nzg=') {
        setRole('ADMIN');
        localStorage.setItem('user_role', 'ADMIN');
      // 'amin' or 'admin' / 'cy83288328*'
      } else if ((btoa(username) === 'YW1pbg==' || btoa(username) === 'YWRtaW4=') && btoa(password) === 'Y3k4MzI4ODMyOCo=') {
        setRole('DEVELOPER');
        localStorage.setItem('user_role', 'DEVELOPER');
      } else {
        alert("로그인 정보가 일치하지 않습니다.");
      }
    }, 500);
  };

  const handleLogout = () => {
    setRole('LOGGED_OUT');
    localStorage.removeItem('user_role');
    setUsername("");
    setPassword("");
  };

  const isMenuDisabled = (href: string) => {
    if (role === 'DEVELOPER' || role === 'ADMIN') return false;
    if (role === 'USER') return href !== '/attendance';
    return true; // LOGGED_OUT
  };

  const renderMenuItem = (href: string, Icon: any, label: string, color: string) => {
    const disabled = isMenuDisabled(href);
    
    const content = (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        padding: '16px', 
        borderRadius: '20px', 
        backgroundColor: disabled ? '#F1F5F9' : '#F8FAFC',
        transition: 'all 0.2s',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}>
        <Icon size={20} color={disabled ? '#94A3B8' : color} />
        <span style={{ fontWeight: 700, fontSize: '14px', color: disabled ? '#94A3B8' : '#475569' }}>{label}</span>
      </div>
    );

    if (disabled) {
      return (
        <div key={href} onClick={(e) => e.preventDefault()}>
          {content}
        </div>
      );
    }

    return (
      <Link key={href} href={href} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  };

  const getRoleDisplayName = () => {
    if (role === 'DEVELOPER') return '개발자 모드';
    if (role === 'ADMIN') return '관리자 모드';
    if (role === 'USER') return '사용자 모드';
    return '';
  };

  return (
    <aside style={{ 
      height: '100vh', 
      position: 'sticky', 
      top: 0, 
      padding: '32px',
      borderRight: '1px solid #E2E8F0',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px'
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 8px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 16px -4px rgba(15, 23, 42, 0.15)',
            flexShrink: 0
          }}>
            <Zap size={20} color="#FFFFFF" fill="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.04em' }}>EG</span>
              <span style={{ fontSize: '22px', fontWeight: 300, color: '#64748B', letterSpacing: '-0.02em' }}>DESK</span>
            </div>
            <div style={{ 
              fontSize: '9px', 
              fontWeight: 800, 
              color: '#3B82F6', 
              textTransform: 'uppercase', 
              letterSpacing: '0.15em',
              marginTop: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ width: '4px', height: '4px', backgroundColor: '#3B82F6', borderRadius: '50%' }}></span>
              AI TAEKWONDO
            </div>
          </div>
        </div>
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {renderMenuItem("/admin/students/register", UserPlus, "신규 관원 등록", "#2563EB")}
        {renderMenuItem("/attendance", MonitorPlay, "출석 모니터 시작", "#10B981")}
        {renderMenuItem("/admin/attendance", ClipboardList, "출결 기록 관리", "#6366F1")}
        {renderMenuItem("/admin/students", Users, "전체 관원 관리", "#0EA5E9")}
        {renderMenuItem("/admin/payments", Coins, "수납 내역 관리", "#E11D48")}
        
        <div style={{ margin: '16px 0', borderTop: '1px solid #F1F5F9' }}></div>
        
        {renderMenuItem("/admin/settings", Settings, "시스템 설정", "#94A3B8")}
      </nav>

      {/* 하단 로그인/로그아웃 영역 */}
      <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
        {role === 'LOGGED_OUT' ? (
          <>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                  <User size={16} color="#94A3B8" />
                </div>
                <input 
                  type="text" 
                  placeholder="아이디" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                  required
                />
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                  <Lock size={16} color="#94A3B8" />
                </div>
                <input 
                  type="password" 
                  placeholder="비밀번호" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px', 
                  backgroundColor: '#2563EB', 
                  color: '#FFFFFF', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: 700, 
                  fontSize: '13px', 
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'background-color 0.2s'
                }}
              >
                <LogIn size={16} />
                {isLoading ? "로그인 중..." : "로그인"}
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                backgroundColor: role === 'DEVELOPER' ? '#EFF6FF' : role === 'ADMIN' ? '#FEF2F2' : '#F0FDF4', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <User size={18} color={role === 'DEVELOPER' ? '#2563EB' : role === 'ADMIN' ? '#EF4444' : '#16A34A'} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                  {getRoleDisplayName()}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  접속중
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="나가기"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.color = '#EF4444';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

