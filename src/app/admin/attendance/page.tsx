'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { queryTable, deleteRows } from '@root/egdesk-helpers';

interface AttendanceLog {
  id: number;
  student_id: number;
  timestamp: string;
  type: string;
  status: string;
  student_name?: string;
}

export default function AttendanceManagementPage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setSelectedIds([]);
    try {
      // 1. 모든 학생 정보 로드 (이름 매핑용)
      const studentsRes = await queryTable('students');
      const studentMap = new Map(
        (studentsRes.rows || []).map((s: any) => [s.id, s.name])
      );

      // 2. 출결 기록 로드 (최신순 100건)
      const logsRes = await queryTable('attendance_logs', {
        limit: 100,
        orderBy: 'id',
        orderDirection: 'DESC'
      });

      const formattedLogs = (logsRes.rows || []).map((log: any) => ({
        ...log,
        student_name: studentMap.get(log.student_id) || `ID: ${log.student_id}`
      }));

      setLogs(formattedLogs);
    } catch (err) {
      console.error('기록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(logs.map((log) => log.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length}개의 기록을 삭제하시겠습니까?`)) return;

    try {
      await deleteRows('attendance_logs', { ids: selectedIds });
      setLogs((prev) => prev.filter((log) => !selectedIds.includes(log.id)));
      setSelectedIds([]);
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;

    try {
      await deleteRows('attendance_logs', { ids: [id] });
      setLogs((prev) => prev.filter((log) => log.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.05em' }}>출결 기록 관리</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              style={{ padding: '12px 24px', backgroundColor: '#EF4444', color: '#FFFFFF', borderRadius: '16px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)' }}
            >
              선택 삭제 ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={fetchLogs}
            style={{ padding: '12px 24px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', fontWeight: 800, fontSize: '14px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} /> 새로고침
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
            <tr>
              <th className="p-5 w-16">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-[#E2E8F0] cursor-pointer"
                  checked={logs.length > 0 && selectedIds.length === logs.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-5 text-sm font-bold text-[#475569]">ID</th>
              <th className="p-5 text-sm font-bold text-[#475569]">날짜/시간</th>
              <th className="p-5 text-sm font-bold text-[#475569]">이름</th>
              <th className="p-5 text-sm font-bold text-[#475569]">구분</th>
              <th className="p-5 text-sm font-bold text-[#475569]">상태</th>
              <th className="p-5 text-sm font-bold text-[#475569] text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-20 text-center text-[#94A3B8] animate-pulse">
                  기록을 불러오는 중입니다...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-20 text-center text-[#94A3B8] italic">
                  기록된 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className={`border-b border-[#F1F5F9] hover:bg-gray-50 transition-colors ${selectedIds.includes(log.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="p-5">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-[#E2E8F0] cursor-pointer"
                      checked={selectedIds.includes(log.id)}
                      onChange={() => handleSelectOne(log.id)}
                    />
                  </td>
                  <td className="p-5 text-[#64748B] text-sm">{log.id}</td>
                  <td className="p-5 font-medium">
                    {new Date(log.timestamp).toLocaleString('ko-KR')}
                  </td>
                  <td className="p-5 font-bold text-lg">{log.student_name}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      log.type === 'IN' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
                    }`}>
                      {log.type === 'IN' ? '등원' : '하원'}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="text-[#64748B] text-sm font-medium">{log.status}</span>
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-[#EF4444] hover:text-[#DC2626] text-sm font-bold transition-all p-2"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="mt-8 text-center text-[#94A3B8] text-sm">
        최근 100건의 기록만 표시됩니다.
      </footer>
    </div>
  );
}
