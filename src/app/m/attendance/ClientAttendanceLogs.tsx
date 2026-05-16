'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, LogOut, SearchX, AlertCircle, Phone, UserX, Clock, Search, Mic, MicOff, Check, CheckCircle2, Loader2 } from 'lucide-react';
import { matchChosung } from '@/utils/koreanUtils';
import { insertRows } from '@root/egdesk-helpers';
import { sendAttendanceSMSAction } from '../../actions/sms';

export default function ClientAttendanceLogs({ initialLogs, allStudents, error }: { initialLogs: any[], allStudents: any[], error?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'daily';
  const [isPending, startTransition] = React.useTransition();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [now, setNow] = React.useState(new Date());
  
  const [filter, setFilter] = React.useState<'ALL' | 'NOT_IN' | 'NOT_OUT'>('ALL');
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [processedIds, setProcessedIds] = React.useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 필터 변경 시 선택 초기화
  React.useEffect(() => {
    setSelectedIds([]);
  }, [filter]);

  const handleAttendanceProcess = async () => {
    if (selectedIds.length === 0) return;
    
    setIsProcessing(true);
    const currentSelected = [...selectedIds];
    try {
      const type = filter === 'NOT_IN' ? 'IN' : 'OUT';
      
      // 한국 현지 시간 ISO 포맷 (YYYY-MM-DDTHH:mm:ss) 생성 - 기기 타임존 무관하게 +9h 적용
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const koreaTime = new Date(utc + (9 * 60 * 60000));
      const timestamp = koreaTime.toISOString().slice(0, 19);
      
      // 1. 출결 로그 삽입
      const logRows = currentSelected.map(id => ({
        student_id: id,
        type: type,
        timestamp: timestamp
      }));
      await insertRows('attendance_logs', logRows);

      // 2. 문자 발송
      for (const id of currentSelected) {
        try {
          await sendAttendanceSMSAction(id, type);
        } catch (smsErr) {
          console.error(`SMS 발송 실패 (ID: ${id}):`, smsErr);
        }
      }

      // 로컬 상태에서 즉시 숨김 처리 (Optimistic Update)
      setProcessedIds(prev => {
        const next = new Set(prev);
        currentSelected.forEach(id => next.add(id));
        return next;
      });
      
      setSelectedIds([]);
      router.refresh();
      
      // 알림은 목록이 사라진 후 표시하여 사용자 경험 개선
      setTimeout(() => {
        alert(`${currentSelected.length}명의 ${type === 'IN' ? '등원' : '하원'} 처리가 완료되었습니다.`);
      }, 100);

    } catch (err) {
      console.error(err);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelection = (id: number) => {
    if (processedIds.has(id)) return; // 이미 처리된 학생은 무시
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatDate = (date: Date) => {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const day = days[date.getDay()];
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${m}/${d} ${day} ${h}:${min}`;
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.start();
    setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handlePhoneClick = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    window.location.href = `tel:${phone}`;
  };

  const switchMode = (newMode: string) => {
    startTransition(() => {
      router.push(`/m/attendance?mode=${newMode}`);
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pt-safe pb-32">
      <header className="bg-white/80 backdrop-blur-xl px-5 pt-4 pb-3 sticky top-0 z-10 shadow-sm border-b border-slate-200/50">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-black text-slate-900 tracking-tight shrink-0">출결 기록</h1>
          
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shadow-sm border border-blue-100/50">
              {formatDate(now)}
            </span>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl relative min-w-[100px]">
            <button 
              disabled={isPending}
              onClick={() => switchMode('daily')}
              className={`flex-1 px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                mode === 'daily' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-400'
              } ${isPending ? 'opacity-50' : ''}`}
            >
              일일
            </button>
            <button 
              disabled={isPending}
              onClick={() => switchMode('monthly')}
              className={`flex-1 px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                mode === 'monthly' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-400'
              } ${isPending ? 'opacity-50' : ''}`}
            >
              월간
            </button>
            {isPending && (
              <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="이름 또는 수련반 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-12 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
          <button 
            onClick={startListening}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-500 shadow-sm animate-pulse' : 'bg-slate-200 text-slate-400'}`}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
        </div>

        {mode === 'daily' && (
          <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
            {(() => {
              const inIds = new Set(initialLogs.filter(l => l.type === 'IN').map(l => l.student_id));
              const outIds = new Set(initialLogs.filter(l => l.type === 'OUT').map(l => l.student_id));
              const activeCount = allStudents.filter(s => s.status === 'ACTIVE' || !s.status).length;
              const notInCount = activeCount - inIds.size;
              const notOutCount = inIds.size - outIds.size;

              return [
                { id: 'ALL', label: '전체', count: initialLogs.length },
                { id: 'NOT_IN', label: '미등원', count: notInCount > 0 ? notInCount : 0 },
                { id: 'NOT_OUT', label: '미하원', count: notOutCount > 0 ? notOutCount : 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    filter === tab.id 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${filter === tab.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                    {tab.count}
                  </span>
                </button>
              ));
            })()}
          </div>
        )}
      </header>

      <div className="p-4 flex flex-col gap-3">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {(() => {
          if (mode === 'monthly') {
            const currentYear = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
            const currentMonth = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

            const changeMonth = (offset: number) => {
              let newMonth = currentMonth + offset;
              let newYear = currentYear;
              if (newMonth > 12) {
                newMonth = 1;
                newYear++;
              } else if (newMonth < 1) {
                newMonth = 12;
                newYear--;
              }
              router.push(`/m/attendance?mode=monthly&year=${newYear}&month=${String(newMonth).padStart(2, '0')}`);
            };

            const monthlyStats = allStudents
              .filter(s => 
                matchChosung(s.name || '', searchTerm) || 
                matchChosung(s.class_name || '', searchTerm)
              )
              .map(s => {
                const studentLogs = initialLogs.filter(l => l.student_id === s.id && l.type === 'IN');
                return {
                  ...s,
                  count: studentLogs.length
                };
              })
              .filter(s => s.count > 0 || s.status === 'ACTIVE' || !s.status)
              .sort((a, b) => b.count - a.count);

            return (
              <div className="flex flex-col gap-3">
                <div className="bg-white p-3 rounded-2xl mb-2 shadow-sm border border-slate-100 flex justify-between items-center">
                  <button onClick={() => changeMonth(-1)} className="p-2 text-slate-400 active:text-blue-600">
                    <span className="font-bold">◀</span>
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{currentYear} YEAR</span>
                    <span className="text-lg font-black text-slate-800">{currentMonth}월 현황</span>
                  </div>
                  <button onClick={() => changeMonth(1)} className="p-2 text-slate-400 active:text-blue-600">
                    <span className="font-bold">▶</span>
                  </button>
                </div>

                {monthlyStats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                      <SearchX size={32} />
                    </div>
                    <div className="font-bold text-lg text-slate-600">
                      {searchTerm ? '검색 결과가 없습니다.' : '이 달의 기록이 없습니다.'}
                    </div>
                  </div>
                ) : (
                  monthlyStats.map(student => (
                    <div key={student.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center font-black text-slate-400 text-sm overflow-hidden">
                          {student.profile_image ? (
                            <img src={student.profile_image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{student.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{student.class_name || '미지정'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-black text-blue-600">{student.count}<span className="text-[10px] ml-0.5 text-slate-400">회</span></div>
                          <div className="text-[9px] text-slate-400 font-black uppercase">Attendance</div>
                        </div>
                        {student.parent_phone && (
                          <button 
                            onClick={(e) => handlePhoneClick(e, student.parent_phone)}
                            className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full active:scale-90 transition-transform"
                          >
                            <Phone size={14} fill="currentColor" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          }

          let displayLogs = initialLogs;

          if (searchTerm) {
            displayLogs = displayLogs.filter(log => 
              matchChosung(log.student_name || '', searchTerm) || 
              matchChosung(log.class_name || '', searchTerm)
            );
          }
          
          if (filter === 'NOT_IN') {
            const inIds = new Set(initialLogs.filter(l => l.type === 'IN').map(l => l.student_id));
            displayLogs = allStudents
              .filter(s => (s.status === 'ACTIVE' || !s.status) && !inIds.has(s.id))
              .filter(s => !processedIds.has(s.id)) // 로컬에서 처리된 학생 숨김
              .filter(s => 
                matchChosung(s.name || '', searchTerm) || 
                matchChosung(s.class_name || '', searchTerm)
              )
              .map(s => ({
                id: `not-in-${s.id}`,
                student_id: s.id,
                student_name: s.name,
                class_name: s.class_name || '',
                parent_phone: s.parent_phone || '',
                profile_image: s.profile_image || '',
                type: 'ABSENT',
                timestamp: ''
              }));
          } else if (filter === 'NOT_OUT') {
            const outIds = new Set(initialLogs.filter(l => l.type === 'OUT').map(l => l.student_id));
            
            // 중복 IN 로그 방지를 위해 학생별 최신 IN 기록만 추출
            const latestInMap = new Map();
            initialLogs.forEach(l => {
              if (l.type === 'IN') {
                if (!latestInMap.has(l.student_id) || l.id > latestInMap.get(l.student_id).id) {
                  latestInMap.set(l.student_id, l);
                }
              }
            });

            displayLogs = Array.from(latestInMap.values())
              .filter((l: any) => !outIds.has(l.student_id))
              .filter((l: any) => !processedIds.has(l.student_id)) // 로컬에서 처리된 학생 숨김
              .filter((log: any) => 
                matchChosung(log.student_name || '', searchTerm) || 
                matchChosung(log.class_name || '', searchTerm)
              );
          }

          if (displayLogs.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <SearchX size={32} />
                </div>
                <div className="font-bold text-lg text-slate-600">
                  {searchTerm ? '검색 결과가 없습니다.' : '출결 기록이 없습니다.'}
                </div>
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-3">
              {displayLogs.map((log) => {
                const isSelected = selectedIds.includes(log.student_id);
                const isManualTab = filter === 'NOT_IN' || filter === 'NOT_OUT';

                return (
                  <div 
                    key={log.id} 
                    onClick={() => isManualTab && toggleSelection(log.student_id)}
                    className={`bg-white rounded-2xl p-4 shadow-sm border transition-all relative flex items-center gap-4 ${
                      isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100'
                    } ${isManualTab ? 'cursor-pointer active:scale-[0.98]' : ''}`}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 rounded-full flex items-center justify-center font-black text-lg shadow-inner shrink-0 overflow-hidden`}>
                      {log.profile_image ? (
                        <img src={log.profile_image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        (log.student_name || '').charAt(0)
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-black text-slate-900 text-lg">{log.student_name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">
                          {log.class_name || '일반'}
                        </span>
                        {!isManualTab && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                            log.type === 'IN' ? 'bg-blue-600 text-white shadow-sm' : 
                            log.type === 'OUT' ? 'bg-rose-500 text-white shadow-sm' : 
                            log.type === 'ABSENT' ? 'bg-slate-200 text-slate-600' : 
                            'bg-emerald-500 text-white shadow-sm'
                          }`}>
                            {log.type === 'IN' ? '등원' : 
                             log.type === 'OUT' ? '하원' : 
                             log.type === 'ABSENT' ? '결석' : 
                             '수련중'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        {log.parent_phone ? (
                          <button 
                            onClick={(e) => handlePhoneClick(e, log.parent_phone)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold active:scale-95 transition-transform"
                          >
                            <Phone size={12} fill="currentColor" />
                            <span>{log.parent_phone}</span>
                          </button>
                        ) : (
                          <div />
                        )}
                        {!isManualTab && (
                          <div className="flex items-center gap-1 text-slate-400 text-[11px] font-bold">
                            <Clock size={12} />
                            <span>
                              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isManualTab && (
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200'
                      }`}>
                        {isSelected && <Check size={14} strokeWidth={4} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Manual Processing FAB */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xs px-5 z-20 animate-in slide-in-from-bottom-10">
          <button
            onClick={handleAttendanceProcess}
            disabled={isProcessing}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
            <span className="font-black text-lg">
              {selectedIds.length}명 {filter === 'NOT_IN' ? '등원처리' : '하원처리'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
