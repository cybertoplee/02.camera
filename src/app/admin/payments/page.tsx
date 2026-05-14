'use client';

import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  UserPlus, 
  Trash2,
  Calendar,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { queryTable, deleteRows, updateRows } from '@root/egdesk-helpers';

interface PaymentRecord {
  id: number;
  student_id: number | null;
  amount: number;
  payment_date: string;
  depositor_name: string;
  status: 'MATCHED' | 'UNMATCHED';
  student_name?: string;
}

interface Student {
  id: number;
  name: string;
}

export default function PaymentManagementPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'MATCHED' | 'UNMATCHED'>('ALL');
  const [showMatchModal, setShowMatchModal] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const studentsRes = await queryTable('students');
      const studentsList = studentsRes.rows || [];
      setStudents(studentsList);
      const studentMap = new Map(studentsList.map((s: any) => [s.id, s.name]));

      const paymentsRes = await queryTable('payment_records', {
        orderBy: 'payment_date',
        orderDirection: 'DESC'
      });
      const payments = (paymentsRes.rows || []).map((p: any) => ({
        ...p,
        student_name: studentMap.get(p.student_id) || null
      }));
      setRecords(payments);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/payments/sync');
      const data = await res.json();
      if (data.success) {
        alert(`${data.processedCount}건의 내역을 동기화했습니다.`);
        fetchData();
      } else {
        alert('동기화 중 오류가 발생했습니다: ' + data.error);
      }
    } catch (err) {
      console.error('동기화 실패:', err);
      alert('동기화 서버에 연결할 수 없습니다.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 수납 내역을 삭제하시겠습니까?')) return;
    try {
      await deleteRows('payment_records', { ids: [id] });
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const handleManualMatch = async (recordId: number, studentId: number) => {
    try {
      await updateRows('payment_records', {
        student_id: studentId,
        status: 'MATCHED'
      }, { ids: [recordId] });
      setShowMatchModal(null);
      fetchData();
      alert('성공적으로 매칭되었습니다.');
    } catch (err) {
      console.error('매칭 실패:', err);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch = r.depositor_name.includes(searchTerm) || (r.student_name && r.student_name.includes(searchTerm));
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.05em' }}>수납 내역 관리</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={handleSync}
            disabled={syncing}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: syncing ? '#F1F5F9' : '#0F172A', 
              color: syncing ? '#94A3B8' : '#FFFFFF', 
              borderRadius: '16px', 
              border: 'none', 
              fontWeight: 800, 
              fontSize: '14px', 
              cursor: syncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: syncing ? 'none' : '0 10px 15px -3px rgba(15, 23, 42, 0.2)'
            }}
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'AI 동기화 중...' : '신규 내역 동기화'}
          </button>
        </div>
      </header>

      {/* STATS AREA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <CreditCard size={24} color="#3B82F6" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">전체 내역</p>
            <p className="text-2xl font-black text-slate-900">{records.length}건</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={24} color="#10B981" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">매칭 완료</p>
            <p className="text-2xl font-black text-emerald-600">{records.filter(r => r.status === 'MATCHED').length}건</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
            <AlertCircle size={24} color="#F43F5E" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">미확인 내역</p>
            <p className="text-2xl font-black text-rose-600">{records.filter(r => r.status === 'UNMATCHED').length}건</p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white p-1 rounded-2xl border border-[#E2E8F0] w-full md:w-auto">
          {(['ALL', 'MATCHED', 'UNMATCHED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                filter === f ? 'bg-[#0F172A] text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f === 'ALL' ? '전체' : f === 'MATCHED' ? '매칭됨' : '미확인'}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="입금자명 또는 관원명 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="bg-white rounded-[40px] border border-[#E2E8F0] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">일자</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">입금자명</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">매칭된 관원</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">금액</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">상태</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-black text-xs tracking-widest">LOADING TRANSACTIONS...</p>
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-24 text-center text-slate-300 font-bold italic">
                  표시할 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-[#F1F5F9] hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <Calendar size={14} />
                      </div>
                      <span className="text-sm font-bold text-slate-600">{new Date(record.payment_date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-lg font-black text-slate-900">{record.depositor_name}</span>
                  </td>
                  <td className="p-6">
                    {record.student_name ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] text-blue-600 font-black">ST</div>
                        <span className="font-black text-slate-700">{record.student_name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-sm font-bold">매칭 정보 없음</span>
                    )}
                  </td>
                  <td className="p-6">
                    <span className="text-lg font-black text-slate-900">{record.amount.toLocaleString()}원</span>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      record.status === 'MATCHED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {record.status === 'MATCHED' ? (
                        <><CheckCircle2 size={10} /> 완료</>
                      ) : (
                        <><AlertCircle size={10} /> 미확인</>
                      )}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex justify-center gap-2">
                      {record.status === 'UNMATCHED' && (
                        <button 
                          onClick={() => setShowMatchModal(record.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[11px] hover:bg-blue-700 transition-all shadow-md active:scale-95"
                        >
                          관원 매칭
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MATCH MODAL */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl border border-white animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">수동 관원 매칭</h2>
              <button onClick={() => setShowMatchModal(null)} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-2xl hover:bg-slate-200">✕</button>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-3xl mb-8 border border-blue-100">
              <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">대상 입금 내역</p>
              <div className="flex justify-between items-end">
                <h3 className="text-2xl font-black text-slate-900">{records.find(r => r.id === showMatchModal)?.depositor_name}</h3>
                <span className="text-lg font-black text-blue-600">{records.find(r => r.id === showMatchModal)?.amount.toLocaleString()}원</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">매칭할 관원 선택</label>
              <div className="max-h-80 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {students.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleManualMatch(showMatchModal, student.id)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
                  >
                    <span className="font-black text-slate-700">{student.name}</span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
}
