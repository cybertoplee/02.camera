'use client';
// Updated: 2026-05-14 16:54:00

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, TriangleAlert, CheckCircle, Loader2, MonitorPlay, UserPlus } from 'lucide-react';
// import * as faceapi from '@vladmandic/face-api'; // 제거 후 useEffect 내 동적 임포트 사용
import { queryTable, insertRows, aggregateTable, executeSQL } from '@root/egdesk-helpers';
import { sendAttendanceSMSAction } from '../actions/sms';

interface Student {
  id: number;
  name: string;
  face_vector: string;
}

interface AttendanceLog {
  name: string;
  time: string;
  type: 'IN' | 'OUT';
}

export default function AttendanceMonitorPage() {
  const [mounted, setMounted] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<AttendanceLog[]>([]);
  const [matchedStudents, setMatchedStudents] = useState<Array<{ 
    student: Student; 
    type: string; 
    smsStatus?: 'SENDING' | 'SUCCESS' | 'FAILED' 
  }>>([]);
  const [autoCheckoutMinutes, setAutoCheckoutMinutes] = useState(10);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const autoCheckoutMinutesRef = useRef(10);
  const smsEnabledRef = useRef(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    autoCheckoutMinutesRef.current = autoCheckoutMinutes;
  }, [autoCheckoutMinutes]);

  useEffect(() => {
    smsEnabledRef.current = smsEnabled;
  }, [smsEnabled]);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionCooldowns = useRef<Map<number, number>>(new Map());
  const lastDateRef = useRef<string>(new Date().toLocaleDateString('en-CA'));

  useEffect(() => {
    // 1. Load AI Models
    const loadModels = async () => {
      try {
        const faceapi = await import('@vladmandic/face-api');
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model/';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error('모델 로드 실패:', err);
      }
    };

    // 2. Fetch Data from DB
    const fetchData = async () => {
      try {
        const studentData = await queryTable('students');
        if (studentData && studentData.rows) {
          setStudents(studentData.rows);
        }

        // 1. Get Today's Date String (Local)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        
        // 2. Fetch today's counts and logs
        const [countData, logData] = await Promise.all([
          executeSQL(`SELECT COUNT(*) as count FROM attendance_logs WHERE timestamp LIKE '${todayStr}%' AND type = 'IN'`),
          executeSQL(`SELECT student_id, timestamp, type FROM attendance_logs WHERE timestamp LIKE '${todayStr}%' ORDER BY timestamp DESC LIMIT 5`)
        ]);

        setTodayCount(countData.rows?.[0]?.count || 0);
        
        if (logData && logData.rows) {
          const studentMap = new Map(studentData.rows.map((s: any) => [s.id, s.name]));
          const formattedLogs = logData.rows.map((l: any) => ({
            name: studentMap.get(l.student_id) || `ID: ${l.student_id}`,
            time: new Date(l.timestamp).toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: l.type as 'IN' | 'OUT'
          }));
          setRecentLogs(formattedLogs);
        }

        // 3. Fetch system settings (Handle table not found error)
        try {
          const settingsData = await queryTable('tkd_system_settings');
          if (settingsData && settingsData.rows) {
            const checkout = settingsData.rows.find((s: any) => s.key === 'attendance_auto_checkout_minutes');
            const smsOn = settingsData.rows.find((s: any) => s.key === 'sms_enabled');
            if (checkout) setAutoCheckoutMinutes(Number(checkout.value));
            if (smsOn) setSmsEnabled(smsOn.value === 'true' || smsOn.value === 'ON');
          }
        } catch (err) {
          console.warn('tkd_system_settings 테이블을 찾을 수 없어 기본값을 사용합니다.');
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
      }
    };

    setMounted(true);
    loadModels();
    fetchData();

    // 3. Update Clock
    const updateClock = () => {
      const now = new Date();
      const todayStr = now.toLocaleDateString('en-CA');
      
      // 날짜가 바뀌었을 경우 리셋
      if (todayStr !== lastDateRef.current) {
        setTodayCount(0);
        setRecentLogs([]);
        lastDateRef.current = todayStr;
      }

      setCurrentDate(now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }));
      setCurrentTime(now.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      console.log('Webcam stream stopped');
    }
  };

  const startVideo = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;
    if (videoRef.current?.srcObject) return; // Already active

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Webcam stream started');
      }
    } catch (err) {
      console.error('Webcam access error:', err);
    }
  };

  useEffect(() => {
    if (isModelLoaded) {
      startVideo();
    }
    return () => stopVideo();
  }, [isModelLoaded]);

  // 실시간 얼굴 인식 루프
  useEffect(() => {
    if (!isModelLoaded) return;
    
    let isRunning = true;
    console.log('얼굴 인식 루프 준비 완료');

    const recognitionLoop = async () => {
      if (!isRunning) return;
      
      // Stricter check: video must be ready AND have positive dimensions
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) {
        requestAnimationFrame(recognitionLoop);
        return;
      }

      try {
        const faceapi = await import('@vladmandic/face-api');
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // 캔버스 크기 조정
        const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
        if (canvas.width !== displaySize.width) {
          faceapi.matchDimensions(canvas, displaySize);
        }

        // 탐지 시작 (다중 얼굴 인식으로 변경, 임계값 상향 조정하여 오인식 방지)
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 256, scoreThreshold: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptors();

        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections && detections.length > 0) {
          const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          for (const detection of resizedDetections) {
            const descriptor = detection.descriptor;
            let bestMatch = { student: null as Student | null, distance: 1.0 };

            for (const student of students) {
              if (!student.face_vector) continue;
              try {
                const studentVector = new Float32Array(JSON.parse(student.face_vector));
                const distance = faceapi.euclideanDistance(descriptor, studentVector);
                if (distance < bestMatch.distance) {
                  bestMatch = { student, distance };
                }
              } catch (e) {}
            }

            if (bestMatch.student && bestMatch.distance < 0.5) {
              handleRecognitionSuccess(bestMatch.student);
            }
          }
        }
      } catch (err) {
        console.error('Recognition error:', err);
      }

      if (isRunning) requestAnimationFrame(recognitionLoop);
    };

    recognitionLoop();
    return () => { isRunning = false; };
  }, [isModelLoaded, students]);

  const handleRecognitionSuccess = async (student: Student) => {
    const now = Date.now();
    const todayStr = new Date().toLocaleDateString('en-CA');
    const lastRecognized = recognitionCooldowns.current.get(student.id) || 0;
    
    // 1. 아주 짧은 간격(5초) 연속 인식은 완전히 무시
    if (now - lastRecognized < 5000) {
      return;
    }
    recognitionCooldowns.current.set(student.id, now);

    let determinedType: 'IN' | 'OUT' | 'DUPLICATE' = 'IN';

    // 2. DB 기반 상태 확인 및 처리 (당일 마지막 기록 확인)
    try {
      const lastLog = await executeSQL(`
        SELECT type, timestamp 
        FROM attendance_logs 
        WHERE student_id = ${student.id} 
        AND timestamp LIKE '${todayStr}%'
        ORDER BY id DESC
        LIMIT 1
      `);
      
      const lastEntry = lastLog.rows?.[0];
      
      if (lastEntry) {
        const lastTime = new Date(lastEntry.timestamp).getTime();
        const diffMinutes = (now - lastTime) / (1000 * 60);

        if (lastEntry.type === 'IN') {
          if (diffMinutes < autoCheckoutMinutesRef.current) {
            determinedType = 'DUPLICATE';
          } else {
            determinedType = 'OUT';
            const localISO = new Date(now - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19);
            await insertRows('attendance_logs', [{
              student_id: student.id,
              timestamp: localISO,
              type: 'OUT',
              status: 'NORMAL',
              sms_status: (smsEnabledRef.current && student.receive_sms_out !== 'false') ? 'SENDING' : 'NONE'
            }]);
          }
        } else if (lastEntry.type === 'OUT') {
          determinedType = 'DUPLICATE';
        }
      } else {
        // 신규 등원 처리
        determinedType = 'IN';
        const localISO = new Date(now - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19);
        await insertRows('attendance_logs', [{
          student_id: student.id,
          timestamp: localISO,
          type: 'IN',
          status: 'NORMAL',
          sms_status: (smsEnabledRef.current && student.receive_sms_in !== 'false') ? 'SENDING' : 'NONE'
        }]);
      }
    } catch (err) {
      console.error('출결 상태 확인 실패:', err);
      return;
    }

    // UI 업데이트: 다중 팝업 지원 (팝업은 중복인 경우에도 알림을 위해 표시)
    setMatchedStudents((prev) => [...prev, { student, type: determinedType }]);
    
    // 최근 기록 업데이트 (실제 등원/하원인 경우에만 추가)
    if (determinedType !== 'DUPLICATE') {
      setRecentLogs((prev) => [
        { 
          name: student.name, 
          time: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: determinedType
        },
        ...prev.slice(0, 4)
      ]);

      // 오늘 등원 수 증가 (신규 등원인 경우에만)
      if (determinedType === 'IN') {
        setTodayCount((prev) => prev + 1);
      }

      // 학부모 알림 문자 발송 (설정된 경우 & 관원이 해당 타입 수신 동의한 경우)
      if (smsEnabledRef.current && ((determinedType === 'IN' && student.receive_sms_in !== 'false') || (determinedType === 'OUT' && student.receive_sms_out !== 'false'))) {
        // 발송 중 상태 표시
        setMatchedStudents(prev => prev.map(item => 
          item.student.id === student.id ? { ...item, smsStatus: 'SENDING' } : item
        ));

        // 비동기 발송 및 결과 반영 (디버그 로그 추가)
        console.log('[SMS] Calling server action for student:', student.id);
        sendAttendanceSMSAction(student.id, determinedType).then(res => {
          console.log('[SMS] Server action response:', res);
          setMatchedStudents(prev => prev.map(item => 
            item.student.id === student.id 
              ? { ...item, smsStatus: res?.success ? 'SUCCESS' : 'FAILED' } 
              : item
          ));
        }).catch(() => {
          setMatchedStudents(prev => prev.map(item => 
            item.student.id === student.id ? { ...item, smsStatus: 'FAILED' } : item
          ));
        });
      }
    }

    // 3초 후 해당 학생 팝업 제거
    setTimeout(() => {
      setMatchedStudents((prev) => prev.filter(s => s.student.id !== student.id));
    }, 3000);
  };

  if (!mounted) return null;

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans">
      {/* Background Video */}
      <div className="absolute inset-0 bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-50 filter contrast-125 saturate-50"
          style={{ transform: 'scaleX(-1)' }}
        />
        {/* HUD Scanner Effect overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-500/30 blur-md animate-scan z-0"></div>
      </div>
      
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-16 pointer-events-none z-20">
        {/* Top Bar - Glassmorphism */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col items-start gap-1">
            <div className="text-2xl font-bold text-white tracking-tight">
              {currentDate}
            </div>
            <div className="text-8xl md:text-9xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] tracking-tighter tabular-nums">
              {currentTime}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/students/register"
                className="pointer-events-auto bg-slate-900/80 hover:bg-slate-900 text-white px-8 py-4 rounded-full border border-white/20 backdrop-blur-md transition-all font-bold shadow-2xl hover:shadow-white/10 active:scale-95 flex items-center gap-3 no-underline"
              >
                <UserPlus size={20} strokeWidth={2.5} /> <span>신규 등록</span>
              </Link>

              <button 
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                  } else {
                    document.exitFullscreen();
                  }
                }}
                className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full border border-white/20 backdrop-blur-md transition-all font-bold shadow-lg hover:shadow-white/10 active:scale-95 flex items-center gap-3"
              >
                <MonitorPlay size={20} strokeWidth={2.5} /> <span>전체 화면 모드</span>
              </button>
            </div>
            
            {!isModelLoaded && (
              <div className="flex items-center gap-4 bg-blue-500/20 backdrop-blur-md px-8 py-4 rounded-full border border-blue-500/30">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping" />
                <span className="text-xl font-black text-blue-50 tracking-wide">AI 시스템 초기화 중...</span>
              </div>
            )}
          </div>
        </div>

        {/* Center Target Guide - Futuristic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] pointer-events-none">
          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500/50 rounded-tl-3xl"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500/50 rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500/50 rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500/50 rounded-br-3xl"></div>
          {/* Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-30">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-blue-500 -translate-y-1/2"></div>
            <div className="absolute top-0 left-1/2 w-[2px] h-full bg-blue-500 -translate-x-1/2"></div>
          </div>
        </div>

        {/* Bottom Logs - Glassmorphism Cards */}
        <div className="flex flex-col gap-6 max-w-full overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginBottom: '-5px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.2em', lineHeight: 1, paddingBottom: '12px', margin: 0 }}>오늘 등원</h2>
              <span style={{ fontSize: '80px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-0.02em' }}>{todayCount}</span>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar mask-fade-right">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-2 bg-white/5 backdrop-blur-xl pr-6 py-4 rounded-[28px] border-none shadow-none animate-in slide-in-from-left-8 duration-500">
                <div className={`w-10 h-10 ${log.type === 'OUT' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white'} rounded-xl flex items-center justify-center relative`}>
                  <User size={20} strokeWidth={2.5} />
                  {/* Status Indicator Dot */}
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${log.type === 'OUT' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1 }}>{log.name}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.05em', lineHeight: 1, paddingBottom: '2px' }}>{log.time}</span>
                </div>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-[24px] text-white/50 text-sm font-bold tracking-widest flex items-center gap-3">
                <Loader2 className="animate-spin text-white/50" size={16} strokeWidth={3} />
                AWAITING FIRST STUDENT...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Success/Duplicate Popup - 다중 인원 지원 */}
      {matchedStudents.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-500"></div>
          
          <div className="relative w-full max-w-5xl flex flex-col gap-6 items-center justify-center animate-in zoom-in-95 slide-in-from-bottom-20 duration-700">
            {matchedStudents.map(({ student, type, smsStatus }, index) => (
              <div 
                key={student.id}
                className="relative w-full bg-white/10 backdrop-blur-3xl rounded-[40px] overflow-hidden animate-in slide-in-from-bottom-10 duration-500 shadow-none border-none"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Top Gloss Effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>

                <div className="relative z-10 flex flex-col items-center py-20 px-12 gap-10 text-center">
                  {/* Icon Status */}
                  <div className="flex-shrink-0 flex items-center justify-center text-white animate-pulse">
                    {type === 'DUPLICATE' ? (
                      <TriangleAlert size={100} strokeWidth={1.5} className="text-amber-500" />
                    ) : type === 'OUT' ? (
                      <CheckCircle size={100} strokeWidth={1.5} className="text-blue-500" />
                    ) : (
                      <CheckCircle size={100} strokeWidth={1.5} className="text-emerald-500" />
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center gap-6">
                    <div 
                      className="text-9xl font-black text-white tracking-tighter leading-none"
                      style={{ textShadow: 'none' }}
                    >
                      {student.name}
                    </div>
                    <div 
                      className="text-4xl font-bold"
                      style={{ 
                        color: type === 'DUPLICATE' ? '#f59e0b' : '#ffffff',
                        textShadow: 'none'
                      }}
                    >
                      {type === 'DUPLICATE' 
                        ? '이미 오늘 출결 처리가 완료되었습니다.' 
                        : type === 'OUT' 
                          ? '정상적으로 하원 처리되었습니다!' 
                          : '정상적으로 등원 처리되었습니다!'}
                    </div>

                    {/* 문자 발송 상태 표시 */}
                    {(type === 'IN' || type === 'OUT') && (
                      <div className="mt-8 flex items-center gap-4 px-8 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        {(!smsStatus || smsStatus === 'SENDING') && (
                          <>
                            <Loader2 className="animate-spin text-blue-400" size={24} />
                            <span className="text-2xl font-black text-blue-100">학부모님께 알림 문자 발송 중...</span>
                          </>
                        )}
                        {smsStatus === 'SUCCESS' && (
                          <>
                            <CheckCircle className="text-emerald-500" size={24} />
                            <span className="text-2xl font-black text-emerald-100">알림 문자 발송 완료 ✅</span>
                          </>
                        )}
                        {smsStatus === 'FAILED' && (
                          <>
                            <TriangleAlert className="text-red-500" size={24} />
                            <span className="text-2xl font-black text-red-100">문자 발송 실패 (기기 연결 확인 필요) ❌</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Decorative side accent - centered style */}
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-1.5 rounded-t-full ${
                    type === 'DUPLICATE' ? 'bg-amber-500' : type === 'OUT' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        .mask-fade-right {
          mask-image: linear-gradient(to right, black 80%, transparent 100%);
        }
      `}</style>
    </div>
  );
}
