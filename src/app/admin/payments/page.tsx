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
  ArrowRight,
  Edit2,
  Save,
  X,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { 
  getBankTransactionsAction, 
  queryTableAction, 
  updateRowsAction, 
  deleteRowsAction 
} from './actions';
import { matchChosung } from '@/utils/koreanUtils';
import { apiFetch } from '@/lib/api';

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
  const [activeView, setActiveView] = useState<'RECORDS' | 'BANK'>('RECORDS');
  const [bankTransactions, setBankTransactions] = useState<any[]>([]);
  const [classMap, setClassMap] = useState<Record<number, string>>({});

  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    depositor_name: '',
    amount: 0,
    payment_date: ''
  });

  useEffect(() => {
    fetchData();
    if (activeView === 'BANK') {
      fetchBankData();
    }
  }, [activeView]);

  const fetchBankData = async () => {
    setLoading(true);
    try {
      const res = await getBankTransactionsAction();
      if (res.success) {
        setBankTransactions(res.rows || []);
      } else {
        console.error('은행 거래 내역 로드 실패:', res.error);
        alert('은행 데이터를 가져오는 데 실패했습니다: ' + res.error);
      }
    } catch (err) {
      console.error('은행 거래 내역 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const classesRes = await queryTableAction('student_classes');
      const cmap: Record<number, string> = {};
      if (classesRes.success) {
        classesRes.rows?.forEach((cls: any) => { cmap[cls.id] = cls.name; });
        setClassMap(cmap);
      }

      const studentsRes = await queryTableAction('students');
      if (!studentsRes.success) throw new Error(studentsRes.error);
      
      const studentsList = studentsRes.rows || [];
      setStudents(studentsList);
      const studentMap = new Map(studentsList.map((s: any) => [s.id, s]));

      const paymentsRes = await queryTableAction('payment_records', {
        orderBy: 'payment_date',
        orderDirection: 'DESC'
      });
      if (!paymentsRes.success) throw new Error(paymentsRes.error);

      const payments = (paymentsRes.rows || []).map((p: any) => {
        const student = studentMap.get(p.student_id);
        return {
          ...p,
          student_name: student?.name || null,
          parent_name: student?.parent_name || '',
          parent_phone: student?.parent_phone || '',
          class_name: student ? (cmap[student.class_id] || '') : ''
        };
      });
      setRecords(payments);
    } catch (err: any) {
      console.error('데이터 로드 실패:', err);
      alert('데이터를 불러오는 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await apiFetch('/api/payments/sync');
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

  const startEditing = (record: PaymentRecord) => {
    setEditingRecordId(record.id);
    setEditForm({
      depositor_name: record.depositor_name || '',
      amount: record.amount || 0,
      payment_date: record.payment_date ? new Date(record.payment_date).toISOString().split('T')[0] : ''
    });
  };

  const handleEditSave = async () => {
    if (!editingRecordId) return;
    try {
      const res = await updateRowsAction('payment_records', {
        depositor_name: editForm.depositor_name,
        amount: Number(editForm.amount),
        payment_date: editForm.payment_date
      }, { ids: [editingRecordId] });
      
      if (res.success) {
        setEditingRecordId(null);
        fetchData();
        alert('성공적으로 수정되었습니다.');
      } else {
        alert('수정 실패: ' + res.error);
      }
    } catch (err) {
      console.error('수정 실패:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 수납 내역을 삭제하시겠습니까?')) return;
    try {
      const res = await deleteRowsAction('payment_records', { ids: [id] });
      if (res.success) {
        setRecords(prev => prev.filter(r => r.id !== id));
      } else {
        alert('삭제 실패: ' + res.error);
      }
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const handleManualMatch = async (recordId: number, studentId: number) => {
    try {
      const res = await updateRowsAction('payment_records', {
        student_id: studentId,
        status: 'MATCHED'
      }, { ids: [recordId] });
      
      if (res.success) {
        setShowMatchModal(null);
        fetchData();
        alert('성공적으로 매칭되었습니다.');
      } else {
        alert('매칭 실패: ' + res.error);
      }
    } catch (err) {
      console.error('매칭 실패:', err);
    }
  };

  const [sortColumn, setSortColumn] = useState<'payment_date' | 'depositor_name' | 'student_name' | 'amount' | 'status'>('payment_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (col: 'payment_date' | 'depositor_name' | 'student_name' | 'amount' | 'status') => {
    if (sortColumn === col) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (col: string) => {
    if (sortColumn !== col) return <ArrowUpDown size={14} className="opacity-30 inline-block ml-2" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="text-blue-500 inline-block ml-2" /> : <ChevronDown size={14} className="text-blue-500 inline-block ml-2" />;
  };

  const filteredRecords = records.filter(r => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch = 
      matchChosung(r.depositor_name || '', searchTerm) || 
      matchChosung(r.student_name || '', searchTerm) ||
      matchChosung(r.parent_name || '', searchTerm) ||
      (r.parent_phone && r.parent_phone.includes(searchTerm)) ||
      matchChosung(r.class_name || '', searchTerm);
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    let valA: any = a[sortColumn as keyof PaymentRecord] || '';
    let valB: any = b[sortColumn as keyof PaymentRecord] || '';
    
    if (sortColumn === 'amount') {
      valA = Number(valA);
      valB = Number(valB);
    } else if (sortColumn === 'payment_date') {
      valA = new Date(valA as string).getTime();
      valB = new Date(valB as string).getTime();
    }
    
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const monthlyTotals: Record<string, number> = {};
  let yearlyTotal = 0;
  const currentYear = new Date().getFullYear();

  records.forEach(r => {
    if (r.status === 'MATCHED') {
      const date = new Date(r.payment_date);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const monthKey = `${yyyy}년 ${mm}월`;
      
      if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = 0;
      monthlyTotals[monthKey] += Number(r.amount);
      
      if (yyyy === currentYear) {
        yearlyTotal += Number(r.amount);
      }
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.05em' }}>수납 내역 관리</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* SEARCH BAR MOVED INSIDE HEADER */}
          <div style={{ position: 'relative' }} className="group mr-2">
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                pointerEvents: 'none',
                color: '#94A3B8'
              }} 
            />
            <input 
              type="text" 
              placeholder="입금자명 또는 내용 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: '12px 24px 12px 48px', 
                backgroundColor: '#FFFFFF', 
                color: '#475569', 
                borderRadius: '16px', 
                border: '1px solid #E2E8F0', 
                fontWeight: 800, 
                fontSize: '14px', 
                width: '320px',
                outline: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                transition: 'all'
              }}
              className="focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '8px' }}>
            <button 
              onClick={() => setActiveView('RECORDS')}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: activeView === 'RECORDS' ? '#2563EB' : '#FFFFFF', 
                color: activeView === 'RECORDS' ? '#FFFFFF' : '#475569', 
                borderRadius: '16px', 
                border: activeView === 'RECORDS' ? 'none' : '1px solid #E2E8F0', 
                fontWeight: 800, 
                fontSize: '14px', 
                cursor: 'pointer', 
                boxShadow: activeView === 'RECORDS' ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                transition: 'all'
              }}
            >
              수납 내역 명부
            </button>
            <button 
              onClick={() => setActiveView('BANK')}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: activeView === 'BANK' ? '#2563EB' : '#FFFFFF', 
                color: activeView === 'BANK' ? '#FFFFFF' : '#475569', 
                borderRadius: '16px', 
                border: activeView === 'BANK' ? 'none' : '1px solid #E2E8F0', 
                fontWeight: 800, 
                fontSize: '14px', 
                cursor: 'pointer', 
                boxShadow: activeView === 'BANK' ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                transition: 'all'
              }}
            >
              원본 은행 거래 내역
            </button>
          </div>

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

      {/* TABLE AREA */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[48px] border border-white overflow-hidden shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)]">
        {activeView === 'RECORDS' ? (
          <div className="flex flex-col">
            <div className="overflow-y-auto max-h-[500px] custom-scrollbar relative border-b border-slate-100">
              <table className="w-full text-left">
              <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 shadow-sm">
                <tr>
                  <th className="p-4 px-6 text-[22px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('payment_date')}>일자 {getSortIcon('payment_date')}</th>
                  <th className="p-4 px-6 text-[22px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('depositor_name')}>입금자명 {getSortIcon('depositor_name')}</th>
                  <th className="p-4 px-6 text-[22px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('student_name')}>매칭된 관원 {getSortIcon('student_name')}</th>
                  <th className="p-4 px-6 text-[22px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('amount')}>금액 {getSortIcon('amount')}</th>
                  <th className="p-4 px-6 text-[22px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('status')}>상태 {getSortIcon('status')}</th>
                  <th className="p-4 px-6 text-[22px] font-black text-slate-400 uppercase tracking-widest text-center">관리</th>
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
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <Calendar size={14} />
                        </div>
                        {editingRecordId === record.id ? (
                          <input 
                            type="date" 
                            value={editForm.payment_date} 
                            onChange={e => setEditForm({...editForm, payment_date: e.target.value})} 
                            className="bg-white border-2 border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 outline-none focus:border-blue-500" 
                          />
                        ) : (
                          <span className="text-[16px] font-bold text-slate-600">{new Date(record.payment_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {editingRecordId === record.id ? (
                        <input 
                          type="text" 
                          value={editForm.depositor_name} 
                          onChange={e => setEditForm({...editForm, depositor_name: e.target.value})} 
                          className="w-full bg-white border-2 border-slate-200 rounded-lg px-2 py-1 font-bold text-[16px] text-slate-700 outline-none focus:border-blue-500" 
                        />
                      ) : (
                        <span className="text-[16px] font-black text-slate-900">{record.depositor_name}</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {record.student_name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] text-blue-600 font-black">ST</div>
                          <span className="font-black text-[16px] text-slate-700">{record.student_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[16px] font-bold">매칭 정보 없음</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {editingRecordId === record.id ? (
                        <input 
                          type="number" 
                          value={editForm.amount} 
                          onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})} 
                          className="w-24 bg-white border-2 border-slate-200 rounded-lg px-2 py-1 font-bold text-[16px] text-slate-700 outline-none focus:border-blue-500" 
                        />
                      ) : (
                        <span className="text-[16px] font-black text-slate-900">{record.amount.toLocaleString()}원</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
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
                    <td className="px-6 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {editingRecordId === record.id ? (
                          <>
                            <button onClick={handleEditSave} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all"><Save size={18} /></button>
                            <button onClick={() => setEditingRecordId(null)} className="p-2 text-slate-500 bg-slate-50 hover:bg-slate-200 rounded-xl transition-all"><X size={18} /></button>
                          </>
                        ) : (
                          <>
                            {record.status === 'UNMATCHED' && (
                              <button 
                                onClick={() => setShowMatchModal(record.id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[11px] hover:bg-blue-700 transition-all shadow-md active:scale-95"
                              >
                                관원 매칭
                              </button>
                            )}
                            <button onClick={() => startEditing(record)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"><Edit2 size={18} /></button>
                            <button 
                              onClick={() => handleDelete(record.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
          <div className="bg-slate-50 p-8 border-t border-slate-100 flex justify-between items-center overflow-x-auto gap-8">
            <div className="flex gap-4">
              {Object.entries(monthlyTotals).sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => (
                <div key={month} className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 whitespace-nowrap">
                  <p className="text-sm font-bold text-slate-500 mb-1">{month} 누적 수납액</p>
                  <p className="text-xl font-black text-blue-600">{total.toLocaleString()}원</p>
                </div>
              ))}
              {Object.keys(monthlyTotals).length === 0 && (
                <div className="text-slate-400 font-bold italic py-4">월별 수납 데이터가 없습니다.</div>
              )}
            </div>
            <div className="bg-blue-600 px-8 py-5 rounded-2xl shadow-md border border-blue-500 whitespace-nowrap shrink-0 ml-auto">
              <p className="text-sm font-bold text-blue-200 mb-1">{currentYear}년도 총 수납 누계</p>
              <p className="text-2xl font-black text-white">{yearlyTotal.toLocaleString()}원</p>
            </div>
          </div>
        </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">거래 일시</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">적요/내용</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">입금액</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">출금액</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">잔액</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-black text-xs tracking-widest">FETCHING BANK DATA...</p>
                    </div>
                  </td>
                </tr>
              ) : bankTransactions.filter(t => matchChosung(t.description || '', searchTerm)).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center text-slate-300 font-bold italic">
                    은행 거래 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                bankTransactions
                  .filter(t => matchChosung(t.description || '', searchTerm))
                  .map((t, idx) => (
                  <tr key={idx} className="border-b border-[#F1F5F9] hover:bg-slate-50 transition-colors">
                    <td className="p-6">
                      <span className="text-sm font-bold text-slate-600">{new Date(t.date).toLocaleString()}</span>
                    </td>
                    <td className="p-6">
                      <span className="text-lg font-black text-slate-900">{t.description}</span>
                    </td>
                    <td className="p-6">
                      {t.type === 'deposit' ? (
                        <span className="text-lg font-black text-emerald-600">+{t.amount.toLocaleString()}원</span>
                      ) : '-'}
                    </td>
                    <td className="p-6">
                      {t.type === 'withdrawal' ? (
                        <span className="text-lg font-black text-rose-600">-{Math.abs(t.amount).toLocaleString()}원</span>
                      ) : '-'}
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-bold text-slate-500">{t.balance?.toLocaleString() || '-'}원</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
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
