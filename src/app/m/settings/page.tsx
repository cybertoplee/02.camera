'use client';

import React, { useState } from 'react';
import { ArrowLeft, Bell, Smartphone, Palette, HelpCircle, ChevronRight, HardDrive } from 'lucide-react';
import Link from 'next/link';

export default function MobileSettingsPage() {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pt-safe pb-24">
      <header className="bg-white/80 backdrop-blur-xl px-5 py-4 sticky top-0 z-10 shadow-sm border-b border-slate-200/50 flex items-center gap-4">
        <Link href="/m/attendance" className="p-2 -ml-2 text-slate-400 hover:text-slate-700 bg-slate-100/50 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">설정</h1>
      </header>

      <div className="p-4 flex flex-col gap-6">
        
        {/* Section 1 */}
        <section>
          <h2 className="text-sm font-bold text-slate-500 mb-3 px-2 uppercase tracking-wider">일반 설정</h2>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
            
            <div className="flex items-center justify-between p-4 px-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <div className="font-semibold text-slate-800">푸시 알림</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={notifications} onChange={() => setNotifications(!notifications)} />
                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <Link href="#" className="flex items-center justify-between p-4 px-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Smartphone size={20} />
                </div>
                <div className="font-semibold text-slate-800">기기 연동 관리</div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </Link>
            
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-sm font-bold text-slate-500 mb-3 px-2 uppercase tracking-wider">앱 정보</h2>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
            
            <div className="flex items-center justify-between p-4 px-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <HardDrive size={20} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">캐시 데이터 정리</div>
                  <div className="text-xs text-slate-400 mt-0.5">저장공간 12MB 사용중</div>
                </div>
              </div>
              <button onClick={() => { localStorage.clear(); alert('캐시가 초기화되었습니다.'); window.location.reload(); }} className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                정리
              </button>
            </div>

            <Link href="#" className="flex items-center justify-between p-4 px-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <HelpCircle size={20} />
                </div>
                <div className="font-semibold text-slate-800">고객 지원</div>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </Link>

          </div>
        </section>
        
        <div className="text-center mt-4">
          <p className="text-xs font-bold text-slate-400">EG DESK Mobile v2.0.0</p>
        </div>

      </div>
    </div>
  );
}
