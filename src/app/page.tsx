import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Video, ScanFace, Users, Settings, Activity, ShieldCheck, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-900/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-5 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white">EGDESK AI</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              AI System Portal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span id="system-time">SYSTEM ONLINE</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 max-w-6xl mx-auto w-full z-10 gap-10">
        
        {/* Title Section */}
        <div className="text-center space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/30 text-blue-400 text-xs font-black tracking-wider uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            EGDesk AI Platform
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            EGDesk AI Server <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
              출결관리 시스템 및 CCTV 관제 시스템
            </span>
          </h2>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto font-medium">
            최첨단 안면 인식 기술을 통한 출결 관리와 실시간 이상 행위 감지 CCTV 관제 서비스를 통합 제공하는 EGDesk AI 서버 포털입니다.
          </p>
        </div>

        {/* Banner Image Visual */}
        <div className="w-full max-w-4xl relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-3xl blur opacity-30 group-hover:opacity-45 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl aspect-[21/9]">
            <Image 
              src="/egdesk_main_banner.png" 
              alt="EGDesk AI Server Dashboard Banner" 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              priority
            />
            {/* Overlay Grid lines for Sci-fi effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20 opacity-80" />
          </div>
        </div>

        {/* Dashboard Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-4">
          
          {/* Card 1: CCTV AI */}
          <Link href="/cctv" className="group relative block decoration-none text-left">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
            <div className="relative bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-4 h-full">
              <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-2">
                  CCTV 관제 시스템 (CCTV AI)
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </h3>
                <p className="text-slate-400 text-sm mt-2 font-medium">
                  실시간 영상 스트림 분석, 침입 및 이상 행동 탐지, 이벤트 로그 기록 및 비디오 재생 보관함 관리.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-xs font-black tracking-widest text-red-400 uppercase gap-1">
                시스템 바로가기 →
              </div>
            </div>
          </Link>

          {/* Card 2: AI Attendance */}
          <Link href="/attendance" className="group relative block decoration-none text-left">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
            <div className="relative bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-4 h-full">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <ScanFace className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                  AI 출결관리 시스템
                </h3>
                <p className="text-slate-400 text-sm mt-2 font-medium">
                  고성능 안면 인식 알고리즘을 통한 관원 자동 등하원 체크, 등하원 시 안심 SMS 알림 전송 기능 제공.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center text-xs font-black tracking-widest text-emerald-400 uppercase gap-1">
                시스템 바로가기 →
              </div>
            </div>
          </Link>

          {/* Card 3: Admin Students */}
          <Link href="/admin/students" className="group relative block decoration-none text-left">
            <div className="relative bg-slate-900/50 hover:bg-slate-900/80 p-5 rounded-xl border border-slate-850 hover:border-slate-800 transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-950/30 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  전체 회원 및 출결 관리
                </h4>
                <p className="text-slate-500 text-xs mt-1">
                  관원 리스트 조회, 반 배정, 등하원 상태 기록 관리 및 SMS 템플릿 설정.
                </p>
              </div>
            </div>
          </Link>

          {/* Card 4: System Settings */}
          <Link href="/admin/settings" className="group relative block decoration-none text-left">
            <div className="relative bg-slate-900/50 hover:bg-slate-900/80 p-5 rounded-xl border border-slate-850 hover:border-slate-800 transition-all flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-800/40 border border-slate-700/30 flex items-center justify-center text-slate-400">
                <Settings className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-bold text-white group-hover:text-slate-300 transition-colors">
                  서버 및 디바이스 설정
                </h4>
                <p className="text-slate-500 text-xs mt-1">
                  안면 분석 모델 동기화, SQLite 데이터베이스 관리, API 엔드포인트 세팅.
                </p>
              </div>
            </div>
          </Link>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center z-10 relative">
        <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">
          © 2026 EGDesk AI Server. All rights reserved.
        </p>
        <p className="text-[10px] text-slate-600 mt-2 font-medium">
          Powered by EGDesk Automated Control & Intelligent Monitoring Systems.
        </p>
      </footer>
    </div>
  );
}
