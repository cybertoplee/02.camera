'use client';

import React from 'react';
import { LogIn, LogOut, SearchX, AlertCircle, Phone, UserX, Clock } from 'lucide-react';


export default function ClientAttendanceLogs({ initialLogs, allStudents, error }: { initialLogs: any[], allStudents: any[], error?: string | null }) {
  const [filter, setFilter] = React.useState<'ALL' | 'NOT_IN' | 'NOT_OUT'>('ALL');

  const handlePhoneClick = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pt-safe">
      <header className="bg-white/80 backdrop-blur-xl px-5 py-4 sticky top-0 z-10 shadow-sm border-b border-slate-200/50">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">오늘의 출결</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">실시간 출결 현황을 확인하세요.</p>
          </div>
        </div>
        
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
          {[
            { id: 'ALL', label: '전체' },
            { id: 'NOT_IN', label: '미등원' },
            { id: 'NOT_OUT', label: '미하원' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {(() => {
          let displayLogs = initialLogs;
          
          if (filter === 'NOT_IN') {
            const inIds = new Set(initialLogs.filter(l => l.type === 'IN').map(l => l.student_id));
            displayLogs = allStudents
              .filter(s => (s.status === 'ACTIVE' || !s.status) && !inIds.has(s.id))
              .map(s => ({
                id: `not-in-${s.id}`,
                student_id: s.id,
                student_name: s.name,
                class_name: s.class_name || '',
                parent_phone: s.parent_phone || '',
                type: 'ABSENT',
                timestamp: new Date().toISOString()
              }));
          } else if (filter === 'NOT_OUT') {
            const inLogs = initialLogs.filter(l => l.type === 'IN');
            const outIds = new Set(initialLogs.filter(l => l.type === 'OUT').map(l => l.student_id));
            displayLogs = inLogs
              .filter(l => !outIds.has(l.student_id))
              .map(l => ({
                ...l,
                type: 'STAYING'
              }));
          }

          if (displayLogs.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <SearchX size={32} />
                </div>
                <div className="font-bold text-lg text-slate-600">
                  {filter === 'ALL' ? '오늘의 출결 기록이 없습니다.' : filter === 'NOT_IN' ? '모든 관원이 등원했습니다!' : '미하원 인원이 없습니다.'}
                </div>
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-3">
              {displayLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${
                      log.type === 'IN' ? 'bg-blue-50 text-blue-600' : 
                      log.type === 'OUT' ? 'bg-rose-50 text-rose-600' : 
                      log.type === 'ABSENT' ? 'bg-slate-100 text-slate-400' : 
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {log.type === 'IN' ? <LogIn size={20} /> : 
                       log.type === 'OUT' ? <LogOut size={20} /> : 
                       log.type === 'ABSENT' ? <UserX size={20} /> : 
                       <Clock size={20} />}
                    </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-slate-800 text-lg">{log.student_name}</span>
                      {log.class_name && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                          {log.class_name}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        log.type === 'IN' ? 'bg-blue-100 text-blue-700' : 
                        log.type === 'OUT' ? 'bg-rose-100 text-rose-700' : 
                        log.type === 'ABSENT' ? 'bg-slate-200 text-slate-600' : 
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {log.type === 'IN' ? '등원' : 
                         log.type === 'OUT' ? '하원' : 
                         log.type === 'ABSENT' ? '결석' : 
                         '수련중'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      {log.parent_phone ? (
                        <button 
                          onClick={(e) => handlePhoneClick(e, log.parent_phone)}
                          className="flex items-center gap-1.5 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold active:scale-95 transition-transform"
                        >
                          <Phone size={10} fill="currentColor" />
                          {log.parent_phone}
                        </button>
                      ) : (
                        <div></div>
                      )}
                      <div className="text-[11px] text-slate-400 font-bold">
                        {new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
                {log.sms_status === 'sent' && (
                  <div className="absolute top-2 right-2 text-[8px] font-black text-green-500 uppercase">
                    SMS SENT
                  </div>
                )}
              </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
