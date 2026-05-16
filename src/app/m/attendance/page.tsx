'use client';

import React, { useState, useEffect } from 'react';
import { executeSQL, queryTable } from '@root/egdesk-helpers';
import { Search, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MobileAttendancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    
    // 모바일에서는 폴링을 조금 더 길게 가져가 배터리 최적화
    const timer = setInterval(fetchLogs, 2 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const classesRes = await queryTable('student_classes');
      const cmap: Record<number, string> = {};
      classesRes.rows?.forEach((cls: any) => {
        cmap[cls.id] = cls.name;
      });

      const studentsRes = await queryTable('students');
      const studentMap = new Map((studentsRes.rows || []).map((s: any) => [s.id, s]));

      const todayStr = new Date().toLocaleDateString('en-CA');

      const logsRes = await executeSQL(`
        SELECT * FROM attendance_logs 
        WHERE timestamp LIKE '${todayStr}%' 
        ORDER BY id DESC
      `);

      const formattedLogs = (logsRes.rows || []).map((log: any) => {
        const student = studentMap.get(log.student_id);
        return {
          ...log,
          student_name: student?.name || `ID: ${log.student_id}`,
          class_name: student ? (cmap[student.class_id] || '') : ''
        };
      });

      setLogs(formattedLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(log => 
    (log.student_name || '').includes(searchTerm) || 
    (log.class_name || '').includes(searchTerm)
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pt-safe">
      <header className="bg-white px-5 py-4 sticky top-0 z-10 shadow-sm border-b border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">오늘 출결 기록</h1>
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            총 {filtered.length}건
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="이름 또는 수련반 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100/50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </header>

      <div className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold text-sm">기록을 불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <Clock size={40} className="text-slate-300" />
            <p className="text-slate-400 font-bold text-sm">오늘 출결 기록이 없습니다.</p>
          </div>
        ) : (
          filtered.map((log) => {
            const isOut = log.type === 'OUT';
            return (
              <div key={log.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center \${isOut ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                    <span className="text-[10px] font-black">{isOut ? '하원' : '등원'}</span>
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      {log.student_name} 
                      <span className="ml-2 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{log.class_name || '미배정'}</span>
                    </h2>
                    <div className="flex items-center gap-1 mt-1 text-xs font-bold text-slate-500">
                      <Clock size={12} />
                      {new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {log.sms_status === 'SUCCESS' ? (
                    <span className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">
                      <CheckCircle2 size={10} /> 발송완료
                    </span>
                  ) : log.sms_status === 'SENDING' ? (
                    <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> 발송중
                    </span>
                  ) : log.sms_status === 'FAILED' ? (
                    <span className="flex items-center gap-1 text-[9px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-md">
                      <AlertCircle size={10} /> 실패
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-300">미발송</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
