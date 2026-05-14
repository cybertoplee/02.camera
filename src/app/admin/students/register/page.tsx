'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardEdit, Camera } from 'lucide-react';
import { insertRows, queryTable, executeSQL } from '@root/egdesk-helpers';
interface CustomField {
  id: number;
  field_name: string;
  display_name: string;
}

export default function StudentRegisterPage() {
  const [formData, setFormData] = useState<any>({
    name: '',
    parentName: '',
    parentPhone: '',
    birthDate: '',
    rank: '',
    memo: '',
    classId: '1',
  });
  const [classes, setClasses] = useState<{id: number, name: string}[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState('AI 모델 로딩 중...');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
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
        setStatus('AI 모델 로딩 완료. 웹캠을 연결합니다...');
        startVideo();
      } catch (err) {
        console.error('모델 로드 실패:', err);
        setStatus('AI 모델 로드 실패. 서버 설정을 확인하세요.');
      }
    };
    loadModels();
    fetchCustomFields();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await queryTable('student_classes');
      if (res.rows && res.rows.length > 0) {
        setClasses(res.rows);
        setFormData(prev => ({ ...prev, classId: String(res.rows[0].id) }));
      }
    } catch (err) {
      console.error('반 로드 실패:', err);
    }
  };

  const fetchCustomFields = async () => {
    try {
      const res = await queryTable('custom_fields');
      const fields = res.rows || [];
      setCustomFields(fields);
      
      const initialCustomData: any = {};
      fields.forEach((field: CustomField) => {
        initialCustomData[field.field_name] = '';
      });
      setFormData((prev: any) => ({ ...prev, ...initialCustomData }));
    } catch (err) {
      console.error('커스텀 필드 로드 실패:', err);
    }
  };

  const startVideo = async () => {
    if (videoRef.current?.srcObject) return;

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
        setStatus('얼굴을 정중앙에 맞춰주세요.');
      }
    } catch (err) {
      console.error('Webcam access failed:', err);
      setStatus('웹캠을 찾을 수 없습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (!formData.name) {
      alert('학생 이름을 입력해주세요.');
      return;
    }

    if (!videoRef.current) return;

    setIsCapturing(true);
    setStatus('얼굴 특징 분석 중...');

    try {
      const faceapi = await import('@vladmandic/face-api');
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        setStatus('얼굴을 인식하지 못했습니다. 다시 시도해주세요.');
        setIsCapturing(false);
        return;
      }

      const faceVector = JSON.stringify(Array.from(detections.descriptor));
      
      // Capture snapshot for profile image
      let profileImage = null;
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        profileImage = canvas.toDataURL('image/jpeg', 0.7);
      }

      setStatus('데이터베이스 저장 중...');
      
      const insertData: any = {
        name: formData.name,
        parent_name: formData.parentName,
        parent_phone: formData.parentPhone,
        birth_date: formData.birthDate,
        rank: formData.rank,
        memo: formData.memo,
        face_vector: faceVector,
        profile_image: profileImage,
        class_id: parseInt(formData.classId)
      };

      customFields.forEach(field => {
        insertData[field.field_name] = formData[field.field_name] || '';
      });

      // 중복 체크 (이름 + 생년월일 모두 일치해야 중복으로 간주)
      const existingRes = await queryTable('students', {
        filters: {
          name: formData.name,
          birth_date: formData.birthDate
        }
      });

      if (existingRes.rows && existingRes.rows.length > 0) {
        setStatus('이미 등록된 학생입니다.');
        alert(`이미 '${formData.name}'(생일: ${formData.birthDate}) 학생이 등록되어 있습니다. 중복 등록은 불가능합니다.`);
        setIsCapturing(false);
        return;
      }

      await insertRows('students', [insertData]);

      setStatus('등록 완료!');
      alert(`${formData.name} 학생이 성공적으로 등록되었습니다.`);
      
      const resetData: any = {
        name: '',
        parentName: '',
        parentPhone: '',
        birthDate: '',
        rank: '',
        memo: '',
        classId: '1'
      };
      customFields.forEach(field => {
        resetData[field.field_name] = '';
      });
      setFormData(resetData);
    } catch (err: any) {
      console.error('등록 실패:', err);
      setStatus(`등록 실패: ${err.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.05em' }}>신규 관원 등록</h2>
        </div>
      </header>

      <main style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        {/* Left: Form */}
        <div style={{ flex: 1 }} className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">학생 이름 *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">생년월일</label>
              <input
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
                placeholder="YYYY-MM-DD"
              />
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">학부모 성함</label>
              <input
                name="parentName"
                value={formData.parentName}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
                placeholder="학부모 성함을 입력하세요"
              />
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">학부모 연락처</label>
              <input
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
                placeholder="010-0000-0000"
              />
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">급/단</label>
              <input
                name="rank"
                value={formData.rank}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
                placeholder="예: 1급, 2단"
              />
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">반 선택</label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm appearance-none cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            {customFields.map(field => (
              <div key={field.id} className="flex flex-col gap-2 group">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">{field.display_name}</label>
                <input
                  name={field.field_name}
                  value={formData[field.field_name] || ''}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
                  placeholder={`${field.display_name} 정보를 입력하세요`}
                />
              </div>
            ))}

            <div className="flex flex-col gap-2 col-span-1 md:col-span-2 group">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">메모</label>
              <textarea
                name="memo"
                value={formData.memo}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-900 h-32 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none shadow-sm"
                placeholder="기타 특이사항을 입력하세요"
              />
            </div>
          </div>
        </div>

        {/* Right: AI Registration */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          <div style={{ backgroundColor: '#0F172A', width: '100%', borderRadius: '40px', padding: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            {/* Scanner Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan z-10"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white tracking-tight">AI 얼굴 벡터 분석기</h3>
              <span style={{ 
                fontSize: '10px', 
                padding: '6px 12px', 
                borderRadius: '9999px', 
                fontWeight: 900, 
                backgroundColor: status.includes('완료') ? '#065F46' : status.includes('실패') ? '#991B1B' : '#1E293B',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {status.includes('완료') ? '준비됨' : status.includes('분석') ? '분석중' : '대기중'}
              </span>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-[32px] overflow-hidden border-2 border-slate-800 shadow-inner group mb-6">
              <video
                ref={videoRef}
                autoPlay
                muted
                style={{ transform: 'scaleX(-1)' }}
                className="w-full h-full object-cover opacity-90"
              />
              <canvas ref={canvasRef} style={{ transform: 'scaleX(-1)' }} className="absolute top-0 left-0" />
              
              {isCapturing && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-slate-500/20 border-t-white rounded-full animate-spin"></div>
                    <span className="text-white text-xs font-black tracking-widest">EXTRACTING...</span>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className={`text-[12px] font-bold text-center leading-relaxed ${status.includes('실패') ? 'text-red-400' : 'text-white'}`}>
                  {status}
                </p>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={!isModelLoaded || isCapturing}
              style={{
                width: '100%',
                padding: '20px 0',
                borderRadius: '24px',
                fontWeight: 900,
                fontSize: '18px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: (!isModelLoaded || isCapturing) ? 'not-allowed' : 'pointer',
                backgroundColor: (isModelLoaded && !isCapturing) ? '#2563EB' : '#1E293B',
                color: (isModelLoaded && !isCapturing) ? '#FFFFFF' : '#64748B',
                border: 'none',
                boxShadow: (isModelLoaded && !isCapturing) ? '0 10px 15px -3px rgba(37, 99, 235, 0.3)' : 'none'
              }}
            >
              {!isCapturing && <Camera size={20} strokeWidth={2.5} />}
              {isCapturing ? '처리 중...' : '촬영 및 등록 완료'}
            </button>
          </div>
          
          <div className="bg-white/50 border border-slate-200 p-6 rounded-[32px] w-full">
            <h4 className="font-black text-slate-900 mb-4">등록 시 주의사항</h4>
            <ul className="space-y-3 text-sm text-slate-600 font-medium leading-relaxed">
              <li className="flex gap-3"><span className="text-slate-900 font-black">1.</span> 조명이 밝은 곳에서 정면을 응시해 주세요.</li>
              <li className="flex gap-3"><span className="text-slate-900 font-black">2.</span> 안경이나 마스크는 인식을 방해할 수 있습니다.</li>
              <li className="flex gap-3"><span className="text-slate-900 font-black">3.</span> 이름과 생년월일이 같은 관원은 중복 등록되지 않습니다.</li>
            </ul>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
