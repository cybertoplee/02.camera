'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, Users, Trash2, PlusCircle } from 'lucide-react';
import { queryTable, insertRows, deleteRows } from '@root/egdesk-helpers';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [classes, setClasses] = useState<{id: number, name: string}[]>([]);
  const [newClassName, setNewClassName] = useState('');

  useEffect(() => {
    // 현재 설정된 키가 있는지 확인 (보안상 마스킹된 상태로 가져오는 시뮬레이션)
    const fetchKey = async () => {
      try {
        const res = await fetch('/api/settings/ai-key');
        const data = await res.json();
        if (data.exists) {
          setApiKey('********'); // 마스킹 처리
        }
      } catch (err) {
        console.error('키 로드 실패:', err);
      }
    };
    fetchKey();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await queryTable('student_classes');
      setClasses(res.rows || []);
    } catch (err) {
      console.error('반 로드 실패:', err);
    }
  };

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;
    try {
      await insertRows('student_classes', [{ name: newClassName.trim() }]);
      setNewClassName('');
      fetchClasses();
    } catch (err) {
      console.error('반 추가 실패:', err);
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (!confirm('이 반을 삭제하시겠습니까? 관련 관원 정보는 유지되지만 등록 시 선택할 수 없게 됩니다.')) return;
    try {
      await deleteRows('student_classes', { ids: [id] });
      fetchClasses();
    } catch (err) {
      console.error('반 삭제 실패:', err);
    }
  };

  const handleSave = async () => {
    if (!apiKey || apiKey === '********') {
      alert('새로운 API 키를 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setStatus('저장 중...');

    try {
      const res = await fetch('/api/settings/ai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (res.ok) {
        setStatus('설정이 저장되었습니다!');
        alert('API 키가 성공적으로 저장되었습니다.');
      } else {
        throw new Error('저장 실패');
      }
    } catch (err) {
      setStatus('저장 실패. 로그를 확인하세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.05em' }}>시스템 설정</h2>
        </div>
      </header>

      <main className="max-w-3xl flex flex-col gap-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] overflow-hidden relative">
          {/* Top Right Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center shadow-inner border border-slate-200">
              <Bot size={24} strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Google Gemini API 설정</h2>
          </div>
          
          <p className="text-slate-500 font-medium leading-relaxed mb-8 bg-slate-50 p-6 rounded-[24px] border border-slate-100">
            수납 내역 자동 매칭 및 데이터 분석에 사용되는 <strong className="text-slate-700">Google Generative AI API 키</strong>입니다.<br/>
            키 발급이 필요하다면 아래 링크를 통해 발급받으실 수 있습니다.
            <br />
            <a href="https://aistudio.google.com/app/apikey" target="_blank" className="inline-flex items-center gap-2 mt-3 text-blue-600 font-black hover:text-blue-700 hover:underline transition-all">
              Google AI Studio에서 키 발급받기 <span className="text-sm">↗</span>
            </a>
          </p>

          <div className="flex flex-col gap-3 group">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-500">Gemini API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AI API 키를 입력하세요 (AIzaSy...)"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-[20px] p-5 font-mono text-lg text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Class Management Section */}
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center shadow-inner border border-slate-200">
              <Users size={24} strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">수련 반(Class) 관리</h2>
          </div>

          <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 mb-8">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">새로운 반 추가</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="예: 주말 심화반, 성인부 등"
                className="flex-1 bg-white border-2 border-slate-200 rounded-[20px] p-4 font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
              />
              <button
                onClick={handleAddClass}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-[20px] font-black transition-all flex items-center gap-2"
              >
                <PlusCircle size={20} /> 추가
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {classes.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm group hover:border-slate-300 transition-all">
                <span className="font-black text-slate-700 text-lg">{cls.name}</span>
                <button
                  onClick={() => handleDeleteClass(cls.id)}
                  className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/60 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm">
          <p className={`text-sm font-bold flex items-center gap-2 px-4 ${status.includes('실패') ? 'text-rose-500' : 'text-blue-600'}`}>
            {status && (
              <>
                <span className={`w-2 h-2 rounded-full animate-pulse ${status.includes('실패') ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
                {status}
              </>
            )}
          </p>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-10 py-5 rounded-[24px] font-black text-lg transition-all shadow-lg active:scale-95 w-full md:w-auto ${
              isSaving 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_12px_24px_-8px_rgba(37,99,235,0.4)]'
            }`}
          >
            {isSaving ? '처리 중...' : '설정 안전하게 저장'}
          </button>
        </div>
      </main>
    </div>
  );
}
